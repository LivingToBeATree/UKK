<?php

namespace App\Jobs;

use App\Models\Media;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PruneOrphanedMediaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $olderThanHours = 24,
        public bool $dryRun = false
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): array
    {
        $cutoff = now()->subHours($this->olderThanHours);

        // Fetch candidate media older than cutoff
        $candidates = Media::where('created_at', '<=', $cutoff)->get();

        if ($candidates->isEmpty()) {
            return ['pruned_count' => 0, 'reclaimed_bytes' => 0];
        }

        // Build a cache of all referenced file paths across related tables
        $usedPaths = collect();

        // 1. Post medias
        $usedPaths = $usedPaths->merge(DB::table('post_medias')->pluck('file_path'));

        // 2. Portfolio medias
        $usedPaths = $usedPaths->merge(DB::table('portfolio_medias')->pluck('file_path'));

        // 3. Commission medias
        $usedPaths = $usedPaths->merge(DB::table('commission_medias')->pluck('file_path'));

        // 4. Commission message medias
        $usedPaths = $usedPaths->merge(DB::table('commission_message_medias')->pluck('file_path'));

        // 5. Commission service medias
        $usedPaths = $usedPaths->merge(DB::table('commission_service_medias')->pluck('file_path'));

        // 6. User avatars and banners
        $usedPaths = $usedPaths->merge(DB::table('users')->whereNotNull('avatar')->pluck('avatar'));
        $usedPaths = $usedPaths->merge(DB::table('users')->whereNotNull('banner')->pluck('banner'));

        // 7. Artist profile banners
        $usedPaths = $usedPaths->merge(DB::table('artist_profiles')->whereNotNull('banner')->pluck('banner'));

        $usedPathsLookup = $usedPaths->filter()->flip();

        $prunedCount = 0;
        $reclaimedBytes = 0;

        foreach ($candidates as $media) {
            $path = $media->file_path;

            // If referenced anywhere, it's NOT orphaned
            if ($path && $usedPathsLookup->has($path)) {
                continue;
            }

            $disk = $media->getDisk();
            $fileSize = $media->file_size ?: 0;

            if (! $this->dryRun) {
                // Delete primary file
                if ($path && Storage::disk($disk)->exists($path)) {
                    Storage::disk($disk)->delete($path);
                }

                // Delete thumbnail if present
                if ($media->thumbnail_path && Storage::disk($disk)->exists($media->thumbnail_path)) {
                    Storage::disk($disk)->delete($media->thumbnail_path);
                }

                $media->delete();
            }

            $prunedCount++;
            $reclaimedBytes += $fileSize;
        }

        Log::info("PruneOrphanedMediaJob completed. Pruned {$prunedCount} orphaned files (" . round($reclaimedBytes / 1024 / 1024, 2) . " MB reclaimed)." . ($this->dryRun ? ' [DRY RUN]' : ''));

        return [
            'pruned_count' => $prunedCount,
            'reclaimed_bytes' => $reclaimedBytes,
        ];
    }
}
