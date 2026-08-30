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
            $payout->update([
                'status' => PayoutStatus::FAILED,
                'failed_at' => now(),
                'failure_reason' => $e->getMessage(),
            ]);

            Log::error("Payout #{$payout->id} failed: " . $e->getMessage());

            return $payout;
        }
    }
}
