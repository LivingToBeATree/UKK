<?php

namespace App\Services\API\V1;

use App\Enum\CommissionStatus;
use App\Enum\NotificationType;
use App\Enum\PayoutStatus;
use App\Models\Commission;
use App\Models\CommissionPayout;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class CommissionCompletionService
{
    public function __construct(
        protected PayoutService $payoutService
    ) {}

    /**
     * Atomically complete a commission and create a PENDING payout record.
     *
     * The payout API call happens OUTSIDE the transaction — the DB lock
     * is released before any HTTP request touches Midtrans. This prevents
     * a slow/failed payout API call from holding a row-level lock.
     *
     * Used by both human buyer confirmation and automatic scheduler release.
     */
    public function completeCommission(Commission $commission, bool $isAutoRelease = false): Commission
    {
        // ─── Phase 1: Atomic DB transaction (short, no I/O) ───────────
        $result = DB::transaction(function () use ($commission, $isAutoRelease) {
            $locked = Commission::where('id', $commission->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== CommissionStatus::WAITING_FOR_CLIENT) {
                throw new InvalidArgumentException(
                    "Commission #{$locked->id} is in status '{$locked->status->value}', expected 'waiting_for_client'."
                );
            }

            if ($isAutoRelease && $locked->review_deadline && $locked->review_deadline->isFuture()) {
                throw new InvalidArgumentException(
                    "Commission #{$locked->id} review deadline has not passed yet."
                );
            }

            // Idempotency: if a payout already exists and is in-flight or done, refuse.
            $existingPayout = CommissionPayout::where('commission_id', $locked->id)->first();
            if ($existingPayout && in_array($existingPayout->status, [PayoutStatus::COMPLETED, PayoutStatus::PROCESSING])) {
                throw new InvalidArgumentException(
                    "Commission #{$locked->id} payout is already being processed or completed."
                );
            }

            // Mark commission completed.
            $locked->update([
                'status' => CommissionStatus::COMPLETED,
                'completed_at' => now(),
            ]);

            // Resolve artist payout account.
            $artistProfile = $locked->artistProfile;
            $payoutAccount = $artistProfile?->payoutAccount;

            // Deterministic reference: one payout per commission, ever.
            // The unique constraint on `reference` prevents double-creation.
            $reference = 'PAYOUT-' . $locked->id;

            // Create payout record. Bank fields are nullable — if the artist
            // hasn't configured a payout account, we create the record with
            // null bank info and status PENDING. The retry scheduler will
            // pick it up once the artist adds their account.
            $payout = CommissionPayout::create([
                'commission_id' => $locked->id,
                'artist_profile_id' => $locked->artist_profile_id,
                'amount' => $locked->total_price,
                'status' => PayoutStatus::PENDING,
                'reference' => $reference,
                'bank_name' => $payoutAccount?->bank_name,
                'bank_account_name' => $payoutAccount?->bank_account_name,
                'bank_account_number' => $payoutAccount?->bank_account_number,
                'requested_at' => now(),
            ]);

            $hasPayoutAccount = $payoutAccount !== null;

            // Notify artist
            if ($artistProfile?->user_id) {
                $payoutMessage = $hasPayoutAccount
                    ? ($isAutoRelease
                        ? "Commission #{$locked->id} was automatically completed after the review period. Your payout of Rp " . number_format((float) $locked->total_price, 0, ',', '.') . " has been queued for processing."
                        : "Buyer has approved deliverables for Commission #{$locked->id}. Your payout of Rp " . number_format((float) $locked->total_price, 0, ',', '.') . " has been queued for processing.")
                    : "Commission #{$locked->id} is completed, but your payout is blocked — please configure your payout account in Settings to receive Rp " . number_format((float) $locked->total_price, 0, ',', '.') . ".";

                Notification::create([
                    'user_id' => $artistProfile->user_id,
                    'actor_id' => $locked->user_id,
                    'type' => NotificationType::COMMISSION_COMPLETED,
                    'title' => $hasPayoutAccount ? 'Commission Completed — Payout Queued' : 'Commission Completed — Payout Account Required',
                    'message' => $payoutMessage,
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

            return [
                'commission' => $locked,
                'payout' => $payout,
                'has_payout_account' => $hasPayoutAccount,
            ];
        });

        // ─── Phase 2: External API call (outside transaction) ─────────
        // Only attempt disbursement if the artist has a valid payout account.
        // Otherwise the payout stays PENDING until the retry scheduler picks it up.
        if ($result['has_payout_account']) {
            try {
                $this->payoutService->processPayout($result['payout']);
            } catch (\Exception $e) {
                // PayoutService already marks the payout FAILED internally.
                // Commission stays COMPLETED — that's a valid business state.
                Log::warning("Payout dispatch failed for Commission #{$result['commission']->id}: " . $e->getMessage());
            }
        } else {
            Log::info("Payout #{$result['payout']->id} created without bank info — awaiting artist payout account configuration.");
        }

        return $result['commission'];
    }
}
