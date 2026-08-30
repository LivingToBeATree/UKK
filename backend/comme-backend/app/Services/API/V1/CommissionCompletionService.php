<?php

namespace App\Services\API\V1;

use App\Enum\CommissionStatus;
use App\Enum\NotificationType;
use App\Enum\PayoutStatus;
use App\Models\Commission;
use App\Models\CommissionPayout;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class CommissionCompletionService
{
    public function __construct(
        protected PayoutService $payoutService
    ) {}

    /**
     * Atomically complete a commission and initiate the payout ledger.
     * Used by both human buyer confirmation and automatic scheduler release.
     */
    public function completeCommission(Commission $commission, bool $isAutoRelease = false): Commission
    {
        return DB::transaction(function () use ($commission, $isAutoRelease) {
            // Lock commission record to prevent race conditions
            $locked = Commission::where('id', $commission->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== CommissionStatus::WAITING_FOR_CLIENT) {
                throw new InvalidArgumentException("Commission #{$locked->id} is in status '{$locked->status->value}', expected 'waiting_for_client'.");
            }

            if ($isAutoRelease && $locked->review_deadline && $locked->review_deadline->isFuture()) {
                throw new InvalidArgumentException("Commission #{$locked->id} review deadline has not passed yet.");
            }

            // Check if payout already exists for idempotency
            $existingPayout = CommissionPayout::where('commission_id', $locked->id)->first();
            if ($existingPayout && in_array($existingPayout->status, [PayoutStatus::COMPLETED, PayoutStatus::PROCESSING])) {
                throw new InvalidArgumentException("Commission #{$locked->id} payout is already being processed or completed.");
            }

            // Mark commission as officially completed
            $locked->update([
                'status' => CommissionStatus::COMPLETED,
                'completed_at' => now(),
            ]);

            // Resolve artist payout account
            $artistProfile = $locked->artistProfile;
            $payoutAccount = $artistProfile?->payoutAccount;

            // Generate deterministic idempotency reference
            $reference = 'PAYOUT-' . $locked->id . '-' . strtoupper(Str::random(8));

            // Create or update payout record
            $payout = CommissionPayout::create([
                'commission_id' => $locked->id,
                'artist_profile_id' => $locked->artist_profile_id,
                'amount' => $locked->total_price,
                'status' => PayoutStatus::PENDING,
                'reference' => $reference,
                'bank_name' => $payoutAccount?->bank_name ?? 'UNSPECIFIED',
                'bank_account_name' => $payoutAccount?->bank_account_name ?? ($artistProfile?->user?->display_name ?? 'Artist'),
                'bank_account_number' => $payoutAccount?->bank_account_number ?? '000000',
                'requested_at' => now(),
            ]);

            // Attempt processing disbursement via PayoutService
            $this->payoutService->processPayout($payout);

            // Notify artist
            if ($artistProfile?->user_id) {
                Notification::create([
                    'user_id' => $artistProfile->user_id,
                    'actor_id' => $locked->user_id,
                    'type' => NotificationType::COMMISSION_COMPLETED,
                    'title' => 'Commission Completed & Payment Released',
                    'message' => $isAutoRelease
                        ? "Commission #{$locked->id} was automatically completed after the review period. Payout of Rp " . number_format((float) $locked->total_price, 0, ',', '.') . " has been queued."
                        : "Buyer has approved deliverables for Commission #{$locked->id}. Payout of Rp " . number_format((float) $locked->total_price, 0, ',', '.') . " has been released.",
                    'notifiable_type' => Commission::class,
                    'notifiable_id' => $locked->id,
                ]);
            }

            // Notify buyer
            if ($locked->user_id) {
                Notification::create([
                    'user_id' => $locked->user_id,
                    'actor_id' => $artistProfile?->user_id,
                    'type' => NotificationType::COMMISSION_COMPLETED,
                    'title' => 'Commission Completed',
                    'message' => "Commission #{$locked->id} is officially completed. Thank you for supporting independent creators on Comme!",
                    'notifiable_type' => Commission::class,
                    'notifiable_id' => $locked->id,
                ]);
            }

            return $locked;
        });
    }
}
