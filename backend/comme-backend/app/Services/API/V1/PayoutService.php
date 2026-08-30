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
     * Process an individual payout ledger record.
     */
    public function processPayout(CommissionPayout $payout): CommissionPayout
    {
        try {
            $payout->update([
                'status' => PayoutStatus::PROCESSING,
                'requested_at' => now(),
            ]);

            $response = $this->midtransPayoutService->createPayout($payout);

            $payout->update([
                'status' => PayoutStatus::COMPLETED,
                'completed_at' => now(),
                'raw_response' => $response,
            ]);

            Log::info("Payout #{$payout->id} successfully processed for Commission #{$payout->commission_id}");

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
