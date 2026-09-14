<?php

namespace App\Services\API\V1;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GeoIpService
{
    /**
     * Map country codes to platform supported currencies: IDR, USD, EUR, JPY, SGD, GBP.
     */
    public const EUROZONE_COUNTRIES = [
        'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'FI', 'PT',
        'GR', 'EE', 'LV', 'LT', 'SK', 'SI', 'CY', 'MT', 'LU', 'MC',
        'SM', 'VA', 'AD', 'ME', 'XK',
    ];

    public const COUNTRY_NAMES = [
        'ID' => 'Indonesia',
        'US' => 'United States',
        'CA' => 'Canada',
        'GB' => 'United Kingdom',
        'JP' => 'Japan',
        'SG' => 'Singapore',
        'DE' => 'Germany',
        'FR' => 'France',
        'AU' => 'Australia',
    ];

    /**
     * Official Cloudflare IPv4 CIDR blocks (https://www.cloudflare.com/ips/)
     */
    public const CLOUDFLARE_IPV4_CIDRS = [
        '173.245.48.0/20',
        '103.21.244.0/22',
        '103.22.200.0/22',
        '103.31.4.0/22',
        '141.101.64.0/18',
        '108.162.192.0/18',
        '190.93.240.0/20',
        '188.114.96.0/20',
        '197.234.240.0/22',
        '198.41.128.0/17',
        '162.158.0.0/15',
        '104.16.0.0/13',
        '104.24.0.0/14',
        '172.64.0.0/13',
        '131.0.72.0/22',
    ];

    /**
     * Check whether an IPv4 address falls within a given CIDR subnet.
     */
    public static function isIpInCidr(string $ip, string $cidr): bool
    {
        if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return false;
        }

        [$subnet, $mask] = explode('/', $cidr);
        $ipLong = ip2long($ip);
        $subnetLong = ip2long($subnet);
        $maskLong = -1 << (32 - (int) $mask);

        return ($ipLong & $maskLong) === ($subnetLong & $maskLong);
    }

    /**
     * Verify whether the incoming HTTP request is genuinely dispatched by Cloudflare edge servers.
     */
    public static function isCloudflareRequest(Request $request): bool
    {
        // Testing hook: Allow test suites to simulate verified Cloudflare proxy if explicitly declared
        if (app()->environment('testing') && $request->hasHeader('X-Test-Cloudflare-Proxy')) {
            return true;
        }

        $remoteAddr = $request->server('REMOTE_ADDR') ?: $request->ip();
        if (! $remoteAddr) {
            return false;
        }

        foreach (self::CLOUDFLARE_IPV4_CIDRS as $cidr) {
            if (self::isIpInCidr($remoteAddr, $cidr)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine client's real IP address from standard headers or request object.
     */
    public static function getClientIp(Request $request): string
    {
        // Dev / testing simulated IP header (only active during local development or test suites)
        if (app()->environment(['local', 'testing']) || config('app.debug')) {
            if ($simIp = $request->header('X-Simulated-IP')) {
                $cleanedSim = trim(explode(',', $simIp)[0]);
                if (filter_var($cleanedSim, FILTER_VALIDATE_IP)) {
                    return $cleanedSim;
                }
            }
        }

        // Cloudflare real IP header: Only trust if request genuinely originates from Cloudflare edge servers
        if (self::isCloudflareRequest($request) && ($cfIp = $request->header('CF-Connecting-IP'))) {
            $cleaned = trim(explode(',', $cfIp)[0]);
            if (filter_var($cleaned, FILTER_VALIDATE_IP)) {
                return $cleaned;
            }
        }

        if ($xRealIp = $request->header('X-Real-IP')) {
            $cleaned = trim(explode(',', $xRealIp)[0]);
            if (filter_var($cleaned, FILTER_VALIDATE_IP)) {
                return $cleaned;
            }
        }

        if ($forwarded = $request->header('X-Forwarded-For')) {
            $cleaned = trim(explode(',', $forwarded)[0]);
            if (filter_var($cleaned, FILTER_VALIDATE_IP)) {
                return $cleaned;
            }
        }

        return $request->ip() ?: '127.0.0.1';
    }

    /**
     * Map a 2-letter ISO country code to a supported billing currency.
     */
    public static function getCurrencyForCountry(string $countryCode): string
    {
        $code = strtoupper(trim($countryCode));

        if ($code === 'ID') {
            return 'IDR';
        }

        if (in_array($code, self::EUROZONE_COUNTRIES, true)) {
            return 'EUR';
        }

        if ($code === 'GB') {
            return 'GBP';
        }

        if ($code === 'JP') {
            return 'JPY';
        }

        if ($code === 'SG') {
            return 'SGD';
        }

        // Default international standard for all other countries (US, CA, AU, etc.)
        return 'USD';
    }

    /**
     * Get full location data from client request, with automated VPN/Datacenter detection
     * and anti-arbitrage fallback to USD for VPN exit nodes.
     *
     * @return array{
     *   ip: string,
     *   country_code: string,
     *   country_name: string,
     *   billing_currency: string,
     *   is_simulated: bool,
     *   is_vpn: bool,
     *   is_datacenter: bool,
     *   vpn_provider: ?string,
     *   arbitrage_blocked: bool
     * }
     */
    public static function getClientLocation(Request $request): array
    {
        $ip = self::getClientIp($request);
        $isSimulated = false;
        $isDevOrTesting = app()->environment(['local', 'testing']) || config('app.debug');

        // Dev / testing simulation headers (strictly ignored in production environments)
        if ($isDevOrTesting && ($request->hasHeader('X-Simulated-Country') || $request->hasHeader('X-Dev-Country'))) {
            $simCountry = strtoupper(trim((string) ($request->header('X-Simulated-Country') ?: $request->header('X-Dev-Country'))));
            if (strlen($simCountry) === 2) {
                $isVpnSimulated = filter_var($request->header('X-Simulated-VPN', false), FILTER_VALIDATE_BOOLEAN)
                    || filter_var($request->header('X-Simulated-Proxy', false), FILTER_VALIDATE_BOOLEAN);

                $detectedCurrency = self::getCurrencyForCountry($simCountry);
                $arbitrageBlocked = false;
                $billingCurrency = $detectedCurrency;

                // Anti-Arbitrage: If VPN detected and attempting regional discounted currency, force USD fallback
                if ($isVpnSimulated && $detectedCurrency !== 'USD') {
                    $billingCurrency = 'USD';
                    $arbitrageBlocked = true;
                }

                return [
                    'ip' => $ip,
                    'country_code' => $simCountry,
                    'country_name' => self::COUNTRY_NAMES[$simCountry] ?? "Country ({$simCountry})",
                    'billing_currency' => $billingCurrency,
                    'is_simulated' => true,
                    'is_vpn' => $isVpnSimulated,
                    'is_datacenter' => $isVpnSimulated,
                    'vpn_provider' => $isVpnSimulated ? 'Simulated VPN/Datacenter Exit Node' : null,
                    'arbitrage_blocked' => $arbitrageBlocked,
                ];
            }
        }

        // Cloudflare edge headers: Only trusted if the request actually originates from verified Cloudflare edge nodes
        if (self::isCloudflareRequest($request) && ($cfCountry = $request->header('CF-IPCountry'))) {
            $code = strtoupper(trim($cfCountry));
            if (strlen($code) === 2 && $code !== 'XX' && $code !== 'T1') {
                return [
                    'ip' => $ip,
                    'country_code' => $code,
                    'country_name' => self::COUNTRY_NAMES[$code] ?? $code,
                    'billing_currency' => self::getCurrencyForCountry($code),
                    'is_simulated' => false,
                    'is_vpn' => false,
                    'is_datacenter' => false,
                    'vpn_provider' => null,
                    'arbitrage_blocked' => false,
                ];
            }
        } elseif ($request->hasHeader('CF-IPCountry')) {
            \Illuminate\Support\Facades\Log::warning("Anti-Spoofing: Untrusted client from IP {$ip} attempted to inject CF-IPCountry header: " . $request->header('CF-IPCountry'));
        }

        // Check for private / loopback IP ranges (localhost, local development)
        $isPublic = filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) !== false;

        if (! $isPublic) {
            // Check if dev VPN simulation was requested on localhost
            $isVpnSim = $isDevOrTesting && (
                filter_var($request->header('X-Simulated-VPN', false), FILTER_VALIDATE_BOOLEAN) ||
                filter_var($request->header('X-Simulated-Proxy', false), FILTER_VALIDATE_BOOLEAN)
            );

            $billingCurrency = $isVpnSim ? 'USD' : 'IDR';

            return [
                'ip' => $ip,
                'country_code' => 'ID',
                'country_name' => 'Indonesia',
                'billing_currency' => $billingCurrency,
                'is_simulated' => $isVpnSim,
                'is_vpn' => $isVpnSim,
                'is_datacenter' => $isVpnSim,
                'vpn_provider' => $isVpnSim ? 'Simulated Local VPN' : null,
                'arbitrage_blocked' => $isVpnSim,
            ];
        }

        // Public IP lookup with 24-hour cache (includes proxy, hosting, and ASN intelligence)
        $cached = Cache::remember("geoip_v2_{$ip}", 86400, function () use ($ip) {
            try {
                $response = Http::timeout(2)->get("http://ip-api.com/json/{$ip}?fields=status,message,countryCode,country,proxy,hosting,isp,org,as");
                if ($response->successful() && ($response['status'] ?? '') === 'success') {
                    $isProxy = (bool) ($response['proxy'] ?? false);
                    $isHosting = (bool) ($response['hosting'] ?? false);
                    $provider = (string) ($response['org'] ?? ($response['isp'] ?? 'Datacenter / VPN Provider'));

                    return [
                        'country_code' => strtoupper((string) ($response['countryCode'] ?? 'ID')),
                        'country_name' => (string) ($response['country'] ?? 'Indonesia'),
                        'is_vpn' => $isProxy || $isHosting,
                        'is_datacenter' => $isHosting,
                        'vpn_provider' => ($isProxy || $isHosting) ? $provider : null,
                    ];
                }
            } catch (\Throwable $e) {
                // Fallback silently on network timeout
            }

            return [
                'country_code' => 'ID',
                'country_name' => 'Indonesia',
                'is_vpn' => false,
                'is_datacenter' => false,
                'vpn_provider' => null,
            ];
        });

        $countryCode = $cached['country_code'] ?? 'ID';
        $countryName = $cached['country_name'] ?? 'Indonesia';
        $isVpn = (bool) ($cached['is_vpn'] ?? false);
        $isDatacenter = (bool) ($cached['is_datacenter'] ?? false);
        $vpnProvider = $cached['vpn_provider'] ?? null;

        $detectedCurrency = self::getCurrencyForCountry($countryCode);
        $billingCurrency = $detectedCurrency;
        $arbitrageBlocked = false;

        // Anti-Arbitrage: Force fallback to international USD standard if commercial VPN or Datacenter IP is detected
        if ($isVpn && $detectedCurrency !== 'USD') {
            $billingCurrency = 'USD';
            $arbitrageBlocked = true;
        }

        return [
            'ip' => $ip,
            'country_code' => $countryCode,
            'country_name' => $countryName,
            'billing_currency' => $billingCurrency,
            'is_simulated' => false,
            'is_vpn' => $isVpn,
            'is_datacenter' => $isDatacenter,
            'vpn_provider' => $vpnProvider,
            'arbitrage_blocked' => $arbitrageBlocked,
        ];
    }

    /**
     * Calibrated Purchasing Power Parity (PPP) Economic Reference Ratios
     * Benchmark: USD = 1.00
     */
    public const PPP_RATIOS = [
        'USD' => 1.0,
        'EUR' => 0.95,
        'GBP' => 0.85,
        'SGD' => 1.15,
        'JPY' => 120.0,
        'IDR' => 8800.0,
    ];

    /**
     * Calculate recommended PPP price between currencies.
     */
    public static function calculatePppPrice(float $baseAmount, string $baseCurrency, string $targetCurrency): float
    {
        if ($baseAmount <= 0) {
            return 0.0;
        }

        $base = strtoupper(trim($baseCurrency));
        $target = strtoupper(trim($targetCurrency));

        if ($base === $target) {
            return $baseAmount;
        }

        $baseRatio = self::PPP_RATIOS[$base] ?? 1.0;
        $targetRatio = self::PPP_RATIOS[$target] ?? 1.0;

        $unrounded = $baseAmount * ($targetRatio / $baseRatio);

        return match ($target) {
            'IDR' => round($unrounded / 1000) * 1000,
            'JPY' => max(100.0, round($unrounded / 100) * 100),
            default => round($unrounded * 2) / 2, // 0.50 increments for USD/EUR/GBP/SGD
        };
    }
}

