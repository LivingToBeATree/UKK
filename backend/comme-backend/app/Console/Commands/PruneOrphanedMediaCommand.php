<?php

namespace App\Console\Commands;

use App\Jobs\PruneOrphanedMediaJob;
use Illuminate\Console\Command;

class PruneOrphanedMediaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:prune 
                            {--hours=24 : Threshold in hours to consider unattached media orphaned} 
                            {--dry-run : Simulate pruning without deleting files or records}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up unattached and abandoned media files older than the specified threshold';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $hours = (int) $this->option('hours');
        $dryRun = (bool) $this->option('dry-run');

        $this->info("Scanning for orphaned media older than {$hours} hours..." . ($dryRun ? ' (DRY RUN)' : ''));

        $job = new PruneOrphanedMediaJob($hours, $dryRun);
        $result = $job->handle();

        $count = $result['pruned_count'];
        $bytes = $result['reclaimed_bytes'];
        $mb = round($bytes / 1024 / 1024, 2);

        if ($count === 0) {
            $this->info('No orphaned media found. Storage is clean!');
            return Command::SUCCESS;
        }

        if ($dryRun) {
            $this->warn("Dry run complete: Found {$count} orphaned file(s) ({$mb} MB) eligible for deletion.");
        } else {
            $this->info("Successfully pruned {$count} orphaned file(s) and reclaimed {$mb} MB of disk space.");
        }

        return Command::SUCCESS;
    }
}
