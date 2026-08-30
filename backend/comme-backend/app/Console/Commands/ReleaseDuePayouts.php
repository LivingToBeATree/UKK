<?php

namespace App\Console\Commands;

use App\Enum\CommissionStatus;
use App\Models\Commission;
use App\Services\API\V1\CommissionCompletionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ReleaseDuePayouts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'commissions:release-due-payouts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically completes delivered commissions and releases payouts whose 7-day buyer review deadline has elapsed.';

    /**
     * Execute the console command.
     */
    public function handle(CommissionCompletionService $completionService): int
    {
        $this->info('Checking for eligible commissions awaiting automatic payout release...');

        $eligibleCommissions = Commission::where('status', CommissionStatus::WAITING_FOR_CLIENT)
            ->whereNotNull('review_deadline')
            ->where('review_deadline', '<=', now())
            ->get();

        $count = $eligibleCommissions->count();
        $this->info("Found {$count} eligible commission(s).");

        $processed = 0;
        $failed = 0;

        foreach ($eligibleCommissions as $commission) {
            try {
                $this->line("Processing Commission #{$commission->id} (review deadline: {$commission->review_deadline})...");
                $completionService->completeCommission($commission, true);
                $processed++;
                $this->info("✓ Commission #{$commission->id} completed and payout queued.");
            } catch (\Exception $e) {
                $failed++;
                $this->error("✗ Failed to process Commission #{$commission->id}: " . $e->getMessage());
                Log::error("ReleaseDuePayouts failed for Commission #{$commission->id}: " . $e->getMessage());
            }
        }

        $this->info("ReleaseDuePayouts summary: {$processed} completed, {$failed} failed.");

        return Command::SUCCESS;
    }
}
