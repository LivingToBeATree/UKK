<?php

namespace App\Console\Commands;

use App\Enum\NotificationType;
use App\Enum\PayoutStatus;
use App\Models\CommissionPayout;
use App\Models\Notification;
use App\Services\API\V1\MidtransPayoutService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ReconcilePayouts extends Command
{
    protected $signature = 'commissions:reconcile-payouts';

    protected $description = 'Poll Midtrans Iris for the actual bank-transfer status of PROCESSING payouts and update accordingly.';

    public function handle(MidtransPayoutService $midtransPayoutService): int
    {
        $processing = CommissionPayout::where('status', PayoutStatus::PROCESSING)->get();

        $this->info("Found {$processing->count()} payout(s) in PROCESSING state.");

        $completed = 0;
        $failed = 0;
        $stillProcessing = 0;

        foreach ($processing as $payout) {
            try {
                // Stale detection: if a payout has been in PROCESSING for > 24 hours without resolution, alert admin.
                if ($payout->requested_at && $payout->requested_at->copy()->addHours(24)->isPast()) {
                    Log::warning("Payout #{$payout->id} (Commission #{$payout->commission_id}) has been PROCESSING for > 24 hours.");

                    Notification::firstOrCreate(
                        [
                            'type' => NotificationType::SYSTEM,
                            'notifiable_type' => CommissionPayout::class,
                            'notifiable_id' => $payout->id,
                        ],
                        [
                            'user_id' => 1, // Admin user
                            'title' => 'Stale Payout In-Flight Alert',
                            'message' => "Payout #{$payout->id} for Commission #{$payout->commission_id} has been in PROCESSING for over 24 hours without terminal confirmation. Please check Midtrans Iris dashboard.",
                        ]
                    );
                }

                $status = $midtransPayoutService->getPayoutStatus($payout);
                $providerStatus = strtolower($status['status'] ?? 'unknown');

                if ($providerStatus === 'completed' || $providerStatus === 'done') {
                    $payout->update([
                        'status' => PayoutStatus::COMPLETED,
                        'completed_at' => now(),
                        'raw_response' => $status,
                    ]);
                    $completed++;
                    $this->info("✓ Payout #{$payout->id} (Commission #{$payout->commission_id}) confirmed COMPLETED by provider.");
                } elseif (in_array($providerStatus, ['failed', 'rejected', 'denied'])) {
                    $payout->update([
                        'status' => PayoutStatus::FAILED,
                        'failed_at' => now(),
                        'failure_reason' => "Provider reported status: {$providerStatus}",
                        'raw_response' => $status,
                    ]);
                    $failed++;
                    $this->error("✗ Payout #{$payout->id} FAILED per provider: {$providerStatus}");
                } elseif ($providerStatus === 'not_found' || ($status['error_code'] ?? null) === 404) {
                    // Payout was not found on Midtrans (e.g. initial request timed out before reaching Iris)
                    // Mark as FAILED so the retry scheduler can safely re-dispatch with the deterministic reference key.
                    $payout->update([
                        'status' => PayoutStatus::FAILED,
                        'failed_at' => now(),
                        'failure_reason' => "Disbursement record not found on provider after network timeout. Queued for clean retry.",
                        'raw_response' => $status,
                    ]);
                    $failed++;
                    $this->warn("⚠ Payout #{$payout->id} not found on provider — transitioned to FAILED for retry.");
                } else {
                    $stillProcessing++;
                    $this->line("  Payout #{$payout->id} still {$providerStatus} — skipping.");
                }
            } catch (\Exception $e) {
                $this->error("  Error polling Payout #{$payout->id}: " . $e->getMessage());
                Log::error("ReconcilePayouts error for Payout #{$payout->id}: " . $e->getMessage());
            }
        }

        $this->info("Reconciliation complete: {$completed} completed, {$failed} failed, {$stillProcessing} still processing.");

        return Command::SUCCESS;
    }
}
