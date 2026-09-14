<?php

namespace App\Services\API\V1;

use App\Enum\NotificationType;
use App\Enum\ReportReason;
use App\Enum\ReportStatus;
use App\Enum\TicketPriority;
use App\Models\Commission;
use App\Models\CommissionPayment;
use App\Models\Report;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AntiArbitrageService
{
    /**
     * Recognized Indonesian domestic acquiring/issuing banks for Midtrans transactions.
     */
    public const INDONESIAN_DOMESTIC_BANKS = [
        'bca', 'bni', 'mandiri', 'bri', 'cimb', 'permata', 'danamon',
        'btn', 'mega', 'panin', 'bsi', 'maybank', 'ocbc', 'jenius',
        'jago', 'allo', 'seabank', 'bcasyariah', 'muamalat',
    ];

    /**
     * Handle detected commercial VPN or Datacenter IP arbitrage attempt during commission creation.
     */
    public static function handleVpnArbitrageAttempt(
        User $user,
        Commission $commission,
        array $locationData
    ): Report {
        $ip = $locationData['ip'] ?? 'Unknown IP';
        $countryName = $locationData['country_name'] ?? 'Unknown Country';
        $countryCode = $locationData['country_code'] ?? '??';
        $provider = $locationData['vpn_provider'] ?? 'Datacenter / Commercial VPN';

        Log::warning("Anti-Arbitrage Alert: User @{$user->username} (ID: {$user->id}) attempted order on Commission #{$commission->id} via VPN/Datacenter IP {$ip} ({$provider}) for {$countryName}.", [
            'user_id' => $user->id,
            'commission_id' => $commission->id,
            'ip' => $ip,
            'country' => $countryCode,
            'provider' => $provider,
        ]);

        return DB::transaction(function () use ($user, $commission, $ip, $countryName, $countryCode, $provider) {
            // Create audit moderation report
            $report = Report::create([
                'user_id' => $user->id,
                'reportable_type' => Commission::class,
                'reportable_id' => $commission->id,
                'reason' => ReportReason::ARBITRAGE,
                'description' => "Anti-Arbitrage Alert (Terms Section 4): Regional pricing evasion detected.\n"
                    . "User @{$user->username} connected via VPN/Datacenter IP [{$ip}] ({$provider}) "
                    . "matching regional zone {$countryName} ({$countryCode}). "
                    . "Pricing was automatically forced to standard USD benchmark to prevent arbitrage. "
                    . "Review account for Section 4 enforcement (order cancellation without refund or suspension).",
                'status' => ReportStatus::PENDING,
            ]);

            // Attach High-Priority ticket for staff investigation
            $ticket = $report->ticket()->create([
                'priority' => TicketPriority::HIGH,
            ]);

            $ticket->messages()->create([
                'user_id' => $user->id,
                'content' => "🛡️ Automated Anti-Arbitrage Monitor: User connected from verified VPN/Datacenter exit node [{$ip}] ({$provider}). "
                    . "Adheres to Terms of Service Section 4: Regional Pricing & Anti-Arbitrage Policy.",
            ]);

            // 3. Dispatch high-severity security alert to all active Administrators & Moderators
            StaffNotificationService::notifyStaff(
                'Anti-Arbitrage Violation Detected',
                "User @{$user->username} attempted regional pricing bypass via VPN/Datacenter IP [{$ip}] ({$provider}). Ticket #{$ticket->id} opened for review.",
                $commission,
                NotificationType::SYSTEM
            );

            return $report;
        });
    }

    /**
     * Resolve card issuing details (country code, bank name) via Midtrans BIN API (/v1/bins/{bin})
     * to identify the true card issuer (distinguishing client's foreign bank from the merchant's Indonesian acquiring bank).
     */
    public static function resolveCardIssuingDetails(string $maskedCard, array $payload = []): ?array
    {
        // Check if explicitly provided in payload or test attributes
        if (! empty($payload['card_country_code']) || ! empty($payload['bin_country_code'])) {
            return [
                'country_code' => strtoupper((string) ($payload['card_country_code'] ?? $payload['bin_country_code'])),
                'bank' => strtolower((string) ($payload['card_bank'] ?? $payload['bin_bank'] ?? '')),
            ];
        }

        // Extract 6-digit BIN
        $cleanDigits = preg_replace('/[^0-9]/', '', $maskedCard);
        if (strlen($cleanDigits) < 6) {
            return null;
        }
        $bin = substr($cleanDigits, 0, 6);

        return Cache::remember("midtrans_bin_{$bin}", 86400, function () use ($bin) {
            try {
                $serverKey = config('midtrans.server_key');
                if (empty($serverKey)) {
                    return null;
                }
                $isProduction = config('midtrans.is_production', false);
                $baseUrl = $isProduction ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';

                $response = Http::withBasicAuth($serverKey, '')
                    ->timeout(3)
                    ->get("{$baseUrl}/v1/bins/{$bin}");

                if ($response->successful()) {
                    $data = $response->json('data') ?? $response->json();
                    return [
                        'country_code' => strtoupper((string) ($data['country_code'] ?? '')),
                        'country_name' => (string) ($data['country_name'] ?? ''),
                        'bank' => strtolower((string) ($data['bank'] ?? '')),
                        'brand' => (string) ($data['brand'] ?? ''),
                    ];
                }
            } catch (\Exception $e) {
                Log::warning("Midtrans BIN API lookup exception for {$bin}: " . $e->getMessage());
            }

            return null;
        });
    }

    /**
     * Inspect payment webhook payload to detect residential proxy bypass
     * (e.g. order placed at Indonesian Rupiah regional rate, but paid with foreign card / bank).
     */
    public static function checkPaymentOriginMismatch(CommissionPayment $payment, array $payload): ?Report
    {
        $commission = $payment->commission()->with(['commissionOption', 'user'])->first();
        if (! $commission) {
            return null;
        }

        $paymentType = strtolower((string) ($payload['payment_type'] ?? ''));
        $acquiringBank = strtolower((string) ($payload['bank'] ?? ''));
        $maskedCard = (string) ($payload['masked_card'] ?? '');

        // Only inspect credit card transactions on orders with IDR regional rates
        if ($paymentType !== 'credit_card' || (empty($acquiringBank) && empty($maskedCard))) {
            return null;
        }

        $isDomesticAcquiring = in_array($acquiringBank, self::INDONESIAN_DOMESTIC_BANKS, true);

        // In Midtrans, $payload['bank'] is the merchant's Indonesian ACQUIRING bank (e.g. BCA, Mandiri).
        // To identify the actual card issuing bank & origin, inspect the 6-digit BIN via Midtrans BIN API.
        $binDetails = self::resolveCardIssuingDetails($maskedCard, $payload);
        $issuingCountry = $binDetails['country_code'] ?? null;
        $issuingBank = $binDetails['bank'] ?? null;

        // An arbitrage mismatch occurs if:
        // 1. The acquiring bank param itself is non-domestic (e.g. 'chase_us'), OR
        // 2. The card BIN resolves to a country outside Indonesia ('ID')
        $isForeignIssuingCountry = (! empty($issuingCountry) && $issuingCountry !== 'ID');
        $isForeignAcquiringBank = (! empty($acquiringBank) && ! $isDomesticAcquiring);

        if ($isForeignAcquiringBank || $isForeignIssuingCountry) {
            $user = $commission->user;
            if ($isForeignAcquiringBank && $isForeignIssuingCountry) {
                $flaggedSource = "{$acquiringBank} (BIN: " . ($issuingBank ? "{$issuingBank} " : '') . "{$issuingCountry})";
            } elseif ($isForeignAcquiringBank) {
                $flaggedSource = $acquiringBank;
            } else {
                $flaggedSource = $issuingBank ? "{$issuingBank} ({$issuingCountry})" : "foreign_card_bin_{$issuingCountry}";
            }

            Log::warning("Anti-Arbitrage Alert: Residential Proxy / Foreign Payment Mismatch on Commission #{$commission->id}. Source: {$flaggedSource}, Card: {$maskedCard}", [
                'commission_id' => $commission->id,
                'user_id' => $user?->id,
                'acquiring_bank' => $acquiringBank,
                'issuing_country' => $issuingCountry,
                'issuing_bank' => $issuingBank,
                'masked_card' => $maskedCard,
            ]);

            return DB::transaction(function () use ($user, $commission, $flaggedSource, $maskedCard) {
                $report = Report::create([
                    'user_id' => $user?->id ?? $commission->user_id,
                    'reportable_type' => Commission::class,
                    'reportable_id' => $commission->id,
                    'reason' => ReportReason::ARBITRAGE,
                    'description' => "Anti-Arbitrage Alert (Residential Proxy / Payment Mismatch): "
                        . "Commission #{$commission->id} ordered under Indonesian regional pricing, but payment was settled "
                        . "using a non-domestic foreign card/bank ('{$flaggedSource}', Card: {$maskedCard}). "
                        . "Terms Section 4 violation: Possible residential proxy arbitrage.",
                    'status' => ReportStatus::PENDING,
                ]);

                $ticket = $report->ticket()->create([
                    'priority' => TicketPriority::HIGH,
                ]);

                $ticket->messages()->create([
                    'user_id' => $user?->id ?? $commission->user_id,
                    'content' => "Automated Payment Integrity Monitor: Non-domestic issuing card/bank ('{$flaggedSource}') detected on regional discounted commission. Flagged for Section 4 audit.",
                ]);

                StaffNotificationService::notifyStaff(
                    'Payment Integrity Alert: Foreign Card on Regional Tier',
                    "Commission #{$commission->id} by @{$user?->username} was settled with non-domestic card bank '{$flaggedSource}'. Flagged for anti-arbitrage audit.",
                    $commission,
                    NotificationType::SYSTEM
                );

                return $report;
            });
        }

        return null;
    }
}
