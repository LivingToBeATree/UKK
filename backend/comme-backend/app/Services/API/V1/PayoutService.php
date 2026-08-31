<?php

namespace App\Services\API\V1;

use App\Enum\PayoutStatus;
use App\Models\CommissionPayout;
use Exception;
use Illuminate\Support\Facades\Log;

class PayoutService
{
    public function __construct(
        protected MidtransPayoutService $midtransPayoutService
    ) {}

    /**
     * Dispatch a payout to the provider. On success the payout moves to
     * PROCESSING (not COMPLETED — that only happens when the provider
     * confirms the bank transfer actually landed, via reconciliation).
     *
     * On failure the payout is marked FAILED so the retry scheduler
     * can pick it up later.
     */
    public function processPayout(CommissionPayout $payout): CommissionPayout
    {
        try {
            $payout->update([
                'status' => PayoutStatus::PROCESSING,
                'requested_at' => $payout->requested_at ?? now(),
            ]);

            $response = $this->midtransPayoutService->createPayout($payout);

            // Extract provider-side payout identifier for reconciliation.
            $midtransPayoutId = $response['payouts'][0]['reference_no']
                ?? $response['payouts'][0]['payout_id']
                ?? null;

            $payout->update([
                'status' => PayoutStatus::PROCESSING,
                'midtrans_payout_id' => $midtransPayoutId,
                'raw_response' => $response,
            ]);

            Log::info("Payout #{$payout->id} dispatched to provider for Commission #{$payout->commission_id}", [
                'midtrans_payout_id' => $midtransPayoutId,
            ]);

            return $payout;
        } catch (Exception $e) {
            $errorMessage = $e->getMessage();
            $isAmbiguousTimeout = str_contains(strtolower($errorMessage), 'timeout')
                || str_contains(strtolower($errorMessage), 'timed out')
                || str_contains(strtolower($errorMessage), 'connection')
                || str_contains(strtolower($errorMessage), '504')
                || str_contains(strtolower($errorMessage), '502')
                || str_contains(strtolower($errorMessage), '503');

            if ($isAmbiguousTimeout) {
                // Ambiguous network outcome: Iris might have accepted the payout before connection severed.
                // Leave status as PROCESSING with note so ReconcilePayouts checks provider status via reference.
                $payout->update([
                    'status' => PayoutStatus::PROCESSING,
                    'failure_reason' => "Ambiguous network outcome: {$errorMessage}. Awaiting reconciliation.",
                ]);

                Log::warning("Payout #{$payout->id} encountered ambiguous network response — remaining in PROCESSING for reconciliation: " . $errorMessage);
            } else {
                // Definitive client-side failure (e.g. 400 Bad Request, 422 Invalid Beneficiary Account)
                $payout->update([
                    'status' => PayoutStatus::FAILED,
                    'failed_at' => now(),
                    'failure_reason' => $errorMessage,
                ]);

                Log::error("Payout #{$payout->id} definitively failed: " . $errorMessage);
            }

            return $payout;
        }
    }
}
