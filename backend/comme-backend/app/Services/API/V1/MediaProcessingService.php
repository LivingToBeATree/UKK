<?php

namespace App\Services\API\V1;

use App\Enum\MediaType;
use App\Models\Media;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MediaProcessingService
{
    /**
     * Process an uploaded media file:
     * - Fast-start MP4 videos for instant browser seeking
     * - Generate lightweight WebP/JPEG thumbnails for images
     */
    public function process(Media $media): bool
    {
        try {
            $disk = $media->getDisk();

            if (! Storage::disk($disk)->exists($media->file_path)) {
                Log::warning("Media file does not exist on disk [{$disk}]: {$media->file_path}");
                return false;
            }

            $fullDiskPath = Storage::disk($disk)->path($media->file_path);

            // 1. Process Video (MP4 faststart)
            if ($media->isVideo() && strtolower(pathinfo($media->file_path, PATHINFO_EXTENSION)) === 'mp4') {
                $scriptPath = base_path('storage/mp4-faststart.cjs');
                if (file_exists($scriptPath) && file_exists($fullDiskPath)) {
                    @exec('node ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($fullDiskPath) . ' 2>&1');
                    clearstatcache(true, $fullDiskPath);
                    $media->file_size = filesize($fullDiskPath);
                    $media->saveQuietly();
                }
            }

            // 2. Process Image (Thumbnail generation)
            if ($media->isImage() && empty($media->thumbnail_path)) {
                $thumbPath = $this->generateThumbnail($media);
                if ($thumbPath) {
                    $media->thumbnail_path = $thumbPath;
                    $media->saveQuietly();
                }
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('Media processing error for media #' . $media->id . ': ' . $e->getMessage(), [
                'media_id' => $media->id,
                'file_path' => $media->file_path,
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Generate a scaled companion thumbnail for the image media.
     * Uses PHP GD if available, falling back gracefully if not enabled.
     */
    public function generateThumbnail(Media $media, int $maxWidth = 600): ?string
    {
        if (! extension_loaded('gd')) {
            return null;
        }

        $disk = $media->getDisk();
        $fullPath = Storage::disk($disk)->path($media->file_path);

        if (! file_exists($fullPath) || ! is_readable($fullPath)) {
            return null;
        }

        $imageInfo = @getimagesize($fullPath);
        if (! $imageInfo) {
            return null;
        }

        [$origWidth, $origHeight, $imageType] = $imageInfo;
        if ($origWidth <= 0 || $origHeight <= 0) {
            return null;
        }

        // Calculate proportional dimensions
        if ($origWidth <= $maxWidth) {
            $newWidth = $origWidth;
            $newHeight = $origHeight;
        } else {
            $newWidth = $maxWidth;
            $newHeight = (int) round(($origHeight / $origWidth) * $maxWidth);
        }

        $src = match ($imageType) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($fullPath),
            IMAGETYPE_PNG => @imagecreatefrompng($fullPath),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($fullPath) : null,
            IMAGETYPE_GIF => @imagecreatefromgif($fullPath),
            default => null,
        };

        if (! $src) {
            return null;
        }

        $dst = imagecreatetruecolor($newWidth, $newHeight);
        if (! $dst) {
            imagedestroy($src);
            return null;
        }

        // Preserve transparency for PNG and WebP
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

        $dir = dirname($media->file_path);
        $dirPrefix = ($dir === '.' || $dir === '/' || $dir === '') ? '' : $dir . '/';
        $filename = pathinfo($media->file_path, PATHINFO_FILENAME);

        $thumbRelativePath = $dirPrefix . $filename . '_thumb.webp';
        $thumbFullPath = Storage::disk($disk)->path($thumbRelativePath);

        // Ensure parent directory exists on disk
        $thumbDir = dirname($thumbFullPath);
        if (! is_dir($thumbDir)) {
            @mkdir($thumbDir, 0755, true);
        }

        $saved = false;
        if (function_exists('imagewebp')) {
            $saved = @imagewebp($dst, $thumbFullPath, 80);
        } elseif (function_exists('imagejpeg')) {
            $thumbRelativePath = $dirPrefix . $filename . '_thumb.jpg';
            $thumbFullPath = Storage::disk($disk)->path($thumbRelativePath);
            $saved = @imagejpeg($dst, $thumbFullPath, 85);
        }

        imagedestroy($src);
        imagedestroy($dst);

        return $saved ? $thumbRelativePath : null;
    }
}
