<?php

namespace App\Services\API\V1;

use App\Models\CommissionPayout;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class MidtransPayoutService
{
    protected string $apiKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('midtrans.iris_api_key') ?? '';
        $this->baseUrl = config('midtrans.iris_base_url') ?? 'https://app.sandbox.midtrans.com/iris/api/v1';
    }

    /**
     * Create and dispatch a payout via Midtrans Iris API.
     * Uses the payout's unique `reference` as the Idempotency-Key header.
     */
    public function createPayout(CommissionPayout $payout): array
    {
        // Validate: artist must have a real email.
        $artistEmail = $payout->artistProfile?->user?->email;
        if (empty($artistEmail)) {
            throw new Exception("Cannot dispatch payout #{$payout->id}: artist has no email address on file.");
        }

        if (empty($this->apiKey)) {
            Log::info("Midtrans Iris API Key not configured. Payout #{$payout->id} recorded in simulation mode.", [
                'reference' => $payout->reference,
                'amount' => $payout->amount,
                'bank' => $payout->bank_name,
            ]);

            return [
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
                            'beneficiary_email' => $artistEmail,
                            'amount' => (string) round((float) $payout->amount, 2),
                            'notes' => "Comme Commission #{$payout->commission_id} Payout",
                        ]
                    ]
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error("Midtrans Iris Payout API returned error for Payout #{$payout->id}", [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            throw new Exception("Midtrans Iris HTTP {$response->status()}: " . $response->body());
        } catch (Exception $e) {
            Log::error("Midtrans Iris Exception for Payout #{$payout->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Poll payout status from Midtrans Iris API.
     * Used by the reconciliation scheduler to determine whether a
     * PROCESSING payout has actually landed in the artist's bank.
     */
    public function getPayoutStatus(CommissionPayout $payout): array
    {
        if (empty($this->apiKey)) {
            // Simulation mode: report completed after 60 seconds.
            $isCompleted = $payout->requested_at && $payout->requested_at->copy()->addSeconds(60)->isPast();

            return [
                'status' => $isCompleted ? 'completed' : 'processing',
                'reference_no' => $payout->reference,
                'simulated' => true,
            ];
        }

        try {
            $reference = $payout->midtrans_payout_id ?? $payout->reference;

            $response = Http::withBasicAuth($this->apiKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                ])
                ->get("{$this->baseUrl}/payouts/{$reference}");

            if ($response->successful()) {
                return $response->json();
            }

            Log::warning("Midtrans Iris status check failed for Payout #{$payout->id}", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'status' => 'unknown',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error("Midtrans Iris status poll exception for Payout #{$payout->id}: " . $e->getMessage());

            return [
                'status' => 'unknown',
                'error' => $e->getMessage(),
            ];
        }
    }
}
