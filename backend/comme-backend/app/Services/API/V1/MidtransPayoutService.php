<?php

namespace App\Services\API\V1;

use App\Models\CommissionPayout;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class MidtransPayoutService
{
    protected string $apiKey;
    protected bool $isProduction;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.midtrans.iris_api_key', env('MIDTRANS_IRIS_API_KEY', ''));
        $this->isProduction = (bool) config('services.midtrans.is_production', env('MIDTRANS_IS_PRODUCTION', false));
        $this->baseUrl = $this->isProduction
            ? 'https://app.midtrans.com/iris/api/v1'
            : 'https://app.sandbox.midtrans.com/iris/api/v1';
    }

    /**
     * Create and dispatch a payout via Midtrans Iris API with idempotency guarantee.
     */
    public function createPayout(CommissionPayout $payout): array
    {
        if (empty($this->apiKey)) {
            Log::info("Midtrans Iris API Key not set. Payout #{$payout->id} recorded locally in simulation mode.", [
                'reference' => $payout->reference,
                'amount' => $payout->amount,
                'bank' => $payout->bank_name,
            ]);

            return [
                'status' => 'queued_simulated',
                'payouts' => [
                    [
                        'status' => 'queued',
                        'reference_no' => $payout->reference,
                    ]
                ]
            ];
        }

        try {
            $response = Http::withBasicAuth($this->apiKey, '')
                ->withHeaders([
                    'Idempotency-Key' => $payout->reference,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post("{$this->baseUrl}/payouts", [
                    'payouts' => [
                        [
                            'beneficiary_name' => $payout->bank_account_name,
                            'beneficiary_account' => $payout->bank_account_number,
                            'beneficiary_bank' => strtolower($payout->bank_name),
                            'beneficiary_email' => $payout->artistProfile?->user?->email ?? 'creator@comme.art',
                            'amount' => (string) round((float) $payout->amount, 2),
                            'notes' => "Comme Commission #{$payout->commission_id} Payout",
                        ]
                    ]
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error("Midtrans Iris Payout API failed for Payout #{$payout->id}", [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            throw new Exception("Midtrans Iris Error: " . $response->body());
        } catch (Exception $e) {
            Log::error("Midtrans Iris Exception for Payout #{$payout->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
