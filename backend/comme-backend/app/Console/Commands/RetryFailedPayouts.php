<?php

namespace App\Console\Commands;

use App\Enum\PayoutStatus;
use App\Models\CommissionPayout;
use App\Services\API\V1\PayoutService;
use App\Services\API\V1\StaffNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RetryFailedPayouts extends Command
{
    protected $signature = 'commissions:retry-failed-payouts';

    protected $description = 'Retry FAILED payouts that have a valid payout account, up to 3 attempts.';

    private const MAX_RETRIES = 3;

    public function handle(PayoutService $payoutService): int
    {
        // Only retry payouts that:
        // 1. Are FAILED
        // 2. Failed more than 15 minutes ago (backoff)
        // 3. Have not exceeded max retries
        // 4. Have bank info (artist configured their account)
        $eligiblePayouts = CommissionPayout::where('status', PayoutStatus::FAILED)
            ->where('retry_count', '<', self::MAX_RETRIES)
            ->where('failed_at', '<=', now()->subMinutes(15))
            ->whereNotNull('bank_name')
            ->whereNotNull('bank_account_number')
            ->get();

        $this->info("Found {$eligiblePayouts->count()} failed payout(s) eligible for retry.");

        // Also check for PENDING payouts that were created without bank info
        // but the artist has since configured their account.
        $pendingWithoutBank = CommissionPayout::where('status', PayoutStatus::PENDING)
            ->whereNull('bank_account_number')
            ->with('artistProfile.payoutAccount')
            ->get();

        foreach ($pendingWithoutBank as $payout) {
            $account = $payout->artistProfile?->payoutAccount;
            if ($account) {
                $payout->update([
                    'bank_name' => $account->bank_name,
                    'bank_account_name' => $account->bank_account_name,
                    'bank_account_number' => $account->bank_account_number,
                ]);
                $eligiblePayouts->push($payout);
                $this->info("  Payout #{$payout->id} — artist configured account, now eligible.");
            }
        }

        $retried = 0;
        $permanentlyFailed = 0;

        foreach ($eligiblePayouts as $payout) {
            try {
                // Atomic claim: only proceed if the payout is still in FAILED or PENDING status.
                // This prevents duplicate HTTP disbursements if multiple scheduler workers run concurrently.
                $claimed = CommissionPayout::where('id', $payout->id)
                    ->whereIn('status', [PayoutStatus::FAILED, PayoutStatus::PENDING])
                    ->update([
                        'status' => PayoutStatus::PROCESSING,
                        'failed_at' => null,
                        'failure_reason' => null,
                        'retry_count' => $payout->retry_count + 1,
                    ]);

                if (!$claimed) {
                    $this->line("  Payout #{$payout->id} already claimed by another process — skipping.");
                    continue;
                }

                $this->line("  Retrying Payout #{$payout->id} (attempt " . ($payout->retry_count + 1) . "/" . self::MAX_RETRIES . ")...");
                $payoutService->processPayout($payout);

                $payout->refresh();
                if ($payout->status === PayoutStatus::FAILED) {
                    $this->error("  ✗ Payout #{$payout->id} failed again: {$payout->failure_reason}");

                    if ($payout->retry_count >= self::MAX_RETRIES) {
                        $permanentlyFailed++;
                        $this->error("  ✗ Payout #{$payout->id} has exhausted all {" . self::MAX_RETRIES . "} retries.");

                        // Broadcast to staff recipients via StaffNotificationService
                        StaffNotificationService::notifyStaff(
                            title: 'Payout Permanently Failed',
                            message: "Payout #{$payout->id} for Commission #{$payout->commission_id} has failed after " . self::MAX_RETRIES . " attempts. Manual intervention required. Reason: {$payout->failure_reason}",
                            notifiable: $payout
                        );
                    }
                } else {
                    $retried++;
                    $this->info("  ✓ Payout #{$payout->id} dispatched successfully on retry.");
                }
            } catch (\Exception $e) {
                $this->error("  Error retrying Payout #{$payout->id}: " . $e->getMessage());
                Log::error("RetryFailedPayouts error for Payout #{$payout->id}: " . $e->getMessage());
            }
        }

        $this->info("Retry summary: {$retried} dispatched, {$permanentlyFailed} permanently failed.");

        return Command::SUCCESS;
    }
}
