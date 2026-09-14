<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

use App\Services\API\V1\GeoIpService;

class ExchangeRateController extends Controller
{
    /**
     * Get live or cached currency exchange rates with IDR as base currency.
     */
    public function index(Request $request): JsonResponse
    {
        $cachedData = Cache::remember('comme_exchange_rates_v1', 21600, function () {
            $fallbackRates = [
                'IDR' => 1.0,
                'USD' => 0.000063, // ~15,873 IDR
                'EUR' => 0.000058, // ~17,241 IDR
                'JPY' => 0.0095,   // ~105.26 IDR
                'SGD' => 0.000085, // ~11,764 IDR
                'GBP' => 0.000049, // ~20,408 IDR
            ];

            $rates = $fallbackRates;
            $isFallback = true;

            try {
                // Free, open public exchange rate API (no API key required)
                $response = Http::timeout(3)->get('https://open.er-api.com/v6/latest/IDR');
                if ($response->successful() && isset($response['rates'])) {
                    $apiRates = $response['rates'];
                    foreach (['USD', 'EUR', 'JPY', 'SGD', 'GBP'] as $currency) {
                        if (isset($apiRates[$currency]) && is_numeric($apiRates[$currency])) {
                            $rates[$currency] = (float) $apiRates[$currency];
                        }
                    }
                    $isFallback = false;
                }
            } catch (\Throwable $e) {
                // Silently fallback on timeout or network unavailability
                $isFallback = true;
            }

            // Calculate human-friendly IDR conversion multipliers (1 USD = X IDR)
            $ratesToIdr = [];
            foreach ($rates as $curr => $val) {
                $ratesToIdr[$curr] = $val > 0 ? round(1 / $val, 2) : 1;
            }

            return [
                'base' => 'IDR',
                'rates' => $rates,
                'rates_to_idr' => $ratesToIdr,
                'symbols' => [
                    'IDR' => 'Rp',
                    'USD' => '$',
                    'EUR' => '€',
                    'JPY' => '¥',
                    'SGD' => 'S$',
                    'GBP' => '£',
                ],
                'currency_names' => [
                    'IDR' => 'Indonesian Rupiah',
                    'USD' => 'US Dollar',
                    'EUR' => 'Euro',
                    'JPY' => 'Japanese Yen',
                    'SGD' => 'Singapore Dollar',
                    'GBP' => 'British Pound',
                ],
                'updated_at' => now()->toIso8601String(),
                'is_fallback' => $isFallback,
            ];
        });

        $responseData = $cachedData;
        $responseData['user_location'] = GeoIpService::getClientLocation($request);

        return ApiResponseHelper::successResponse($responseData, 'Exchange rates retrieved successfully.');
    }

    /**
     * Get verified client geographic location and billing currency.
     */
    public function location(Request $request): JsonResponse
    {
        $location = GeoIpService::getClientLocation($request);

        return ApiResponseHelper::successResponse($location, 'Client location retrieved successfully.');
    }
}
