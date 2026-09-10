<?php

namespace App\Jobs;

use App\Models\Media;
use App\Services\API\V1\MediaProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMediaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Seconds to wait before retrying the job.
     *
     * @var array<int, int>
     */
    public array $backoff = [10, 30];

    /**
     * Delete the job if its models no longer exist.
     */
    public bool $deleteWhenMissingModels = true;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $mediaId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(MediaProcessingService $processor): void
    {
        $media = Media::find($this->mediaId);

        if (! $media) {
            Log::info("ProcessMediaJob skipped: Media #{$this->mediaId} no longer exists.");
            return;
        }

        $success = $processor->process($media);

        if ($success) {
            Log::info("ProcessMediaJob successfully processed Media #{$this->mediaId} ({$media->file_name}).");
        } else {
            Log::warning("ProcessMediaJob finished with warnings for Media #{$this->mediaId}.");
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(?\Throwable $exception): void
    {
        Log::error("ProcessMediaJob permanently failed for Media #{$this->mediaId}: " . ($exception?->getMessage() ?? 'Unknown error'), [
            'media_id' => $this->mediaId,
            'exception' => $exception?->getTraceAsString(),
        ]);
    }
}
