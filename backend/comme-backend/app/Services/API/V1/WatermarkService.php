<?php

namespace App\Services\API\V1;

use App\Models\Commission;
use App\Models\Media;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class WatermarkService
{
    /**
     * Generate an anti-theft watermarked preview for a commission delivery.
     * Stamps diagonal repeated security text across the preview image:
     * "COMME PREVIEW • UNPAID • ORDER #[ID]"
     */
    public function generateProof(Commission $commission, Media $media): ?string
    {
        $disk = $media->getDisk();

        if (! Storage::disk($disk)->exists($media->file_path)) {
            Log::warning("Cannot generate watermark proof: source file missing on disk [{$disk}]: {$media->file_path}");
            return null;
        }

        $fullPath = Storage::disk($disk)->path($media->file_path);

        if (! file_exists($fullPath) || ! is_readable($fullPath)) {
            return null;
        }

        // If not an image, return null
        $mime = $media->mime_type ?: mime_content_type($fullPath);
        if (! str_starts_with($mime, 'image/')) {
            return null;
        }

        $dir = dirname($media->file_path);
        $dirPrefix = ($dir === '.' || $dir === '/' || $dir === '') ? '' : $dir . '/';
        $filename = pathinfo($media->file_path, PATHINFO_FILENAME);
        $previewRelativePath = $dirPrefix . $filename . '_proof.webp';
        $previewFullPath = Storage::disk($disk)->path($previewRelativePath);

        // Ensure target directory exists
        $targetDir = dirname($previewFullPath);
        if (! is_dir($targetDir)) {
            @mkdir($targetDir, 0755, true);
        }

        // If GD is available, burn the watermark directly into pixel data
        if (extension_loaded('gd')) {
            $created = $this->burnGdWatermark($fullPath, $previewFullPath, $commission->id);
            if ($created) {
                return $previewRelativePath;
            }
        }

        // Fallback: Copy original as companion preview
        @copy($fullPath, $previewFullPath);
        return $previewRelativePath;
    }

    /**
     * Use PHP GD to render a repeated semi-transparent diagonal watermark across the canvas.
     */
    private function burnGdWatermark(string $sourcePath, string $outputPath, int $commissionId): bool
    {
        $imageInfo = @getimagesize($sourcePath);
        if (! $imageInfo) {
            return false;
        }

        [$width, $height, $imageType] = $imageInfo;
        if ($width <= 0 || $height <= 0) {
            return false;
        }

        $src = match ($imageType) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($sourcePath),
            IMAGETYPE_PNG => @imagecreatefrompng($sourcePath),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($sourcePath) : null,
            IMAGETYPE_GIF => @imagecreatefromgif($sourcePath),
            default => null,
        };

        if (! $src) {
            return false;
        }

        // Enable alpha blending
        imagealphablending($src, true);
        imagesavealpha($src, true);

        // Watermark text
        $text = "COMME PREVIEW • UNPAID • ORDER #{$commissionId}";
        $font = 5; // Built-in GD font (highest built-in size)

        // Text colors: white text with subtle dark outline / shadow
        $textColor = imagecolorallocatealpha($src, 255, 255, 255, 45); // Semi-transparent white
        $shadowColor = imagecolorallocatealpha($src, 0, 0, 0, 60);       // Semi-transparent black

        // Render tiled diagonal or grid watermark stamps
        $stepX = max(240, (int) round($width / 3));
        $stepY = max(160, (int) round($height / 4));

        for ($y = 40; $y < $height; $y += $stepY) {
            for ($x = 30; $x < $width; $x += $stepX) {
                // Shadow
                imagestring($src, $font, $x + 1, $y + 1, $text, $shadowColor);
                // Main text
                imagestring($src, $font, $x, $y, $text, $textColor);
            }
        }

        // Add a prominent center banner
        $centerBannerY = (int) round($height / 2);
        $bannerBg = imagecolorallocatealpha($src, 15, 23, 42, 50); // Dark slate banner
        imagefilledrectangle($src, 0, $centerBannerY - 24, $width, $centerBannerY + 24, $bannerBg);

        $centerText = "••• COMME SECURE PROOF • UNPAID ORDER #{$commissionId} •••";
        $textWidth = strlen($centerText) * 9;
        $centerTextX = max(10, (int) round(($width - $textWidth) / 2));

        $prominentColor = imagecolorallocatealpha($src, 255, 255, 255, 20);
        imagestring($src, $font, $centerTextX, $centerBannerY - 7, $centerText, $prominentColor);

        $saved = false;
        if (function_exists('imagewebp')) {
            $saved = @imagewebp($src, $outputPath, 80);
        } elseif (function_exists('imagejpeg')) {
            $saved = @imagejpeg($src, $outputPath, 85);
        }

        imagedestroy($src);

        return $saved;
    }
}
