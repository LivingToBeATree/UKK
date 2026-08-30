<?php

namespace App\Console\Commands;

use App\Enum\PayoutStatus;
use App\Models\CommissionPayout;
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
