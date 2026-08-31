<?php

namespace App\Console\Commands;

use App\Enum\NotificationType;
use App\Enum\PayoutStatus;
use App\Enum\UserRole;
use App\Models\CommissionPayout;
use App\Models\Notification;
use App\Models\User;
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
                // Stale detection: if a payout has been in PROCESSING for > 24 hours without resolution, alert staff.
                if ($payout->requested_at && $payout->requested_at->copy()->addHours(24)->isPast()) {
                    Log::warning("Payout #{$payout->id} (Commission #{$payout->commission_id}) has been PROCESSING for > 24 hours.");

                    $staffRecipients = User::whereIn('role', [UserRole::ADMIN, UserRole::MODERATOR])->get();
                    if ($staffRecipients->isEmpty()) {
                        $fallback = User::first();
                        if ($fallback) {
                            $staffRecipients = collect([$fallback]);
                        }
                    }

                    foreach ($staffRecipients as $staff) {
                        Notification::firstOrCreate(
                            [
                                'user_id' => $staff->id,
                                'type' => NotificationType::SYSTEM,
                                'notifiable_type' => CommissionPayout::class,
                                'notifiable_id' => $payout->id,
                            ],
                            [
                                'title' => 'Stale Payout In-Flight Alert',
                                'message' => "Payout #{$payout->id} for Commission #{$payout->commission_id} has been in PROCESSING for over 24 hours without terminal confirmation. Please check Midtrans Iris dashboard.",
                            ]
                        );
                    }
                }

                $status = $midtransPayoutService->getPayoutStatus($payout);
                $providerStatus = strtolower($status['status'] ?? 'unknown');

                if (in_array($providerStatus, ['completed', 'done', 'settled', 'success'])) {
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
                } else {
                    // Status is 'queued', 'processed', 'processing', 'unknown', or non-2xx:
                    // Safely leave in PROCESSING so we never assume false failure.
                    $stillProcessing++;
                    $this->line("  Payout #{$payout->id} still in-flight ({$providerStatus}) — remaining in PROCESSING.");
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
