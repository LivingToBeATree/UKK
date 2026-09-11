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
     * Find an available TrueType font for high-resolution, anti-aliased text rendering.
     */
    private function getTtfFontPath(): ?string
    {
        $candidates = [
            resource_path('fonts/Roboto-Bold.ttf'),
            resource_path('fonts/Roboto.ttf'),
            'C:\\Windows\\Fonts\\arialbd.ttf',
            'C:\\Windows\\Fonts\\arial.ttf',
            'C:\\Windows\\Fonts\\segoeui.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
            '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
        ];

        foreach ($candidates as $candidate) {
            if (file_exists($candidate) && is_readable($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    /**
     * Use PHP GD to render a repeated semi-transparent diagonal watermark across the canvas,
     * scaled proportionally to the image resolution.
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

        $fontPath = $this->getTtfFontPath();
        $hasTtf = $fontPath !== null && function_exists('imagettftext');

        if ($hasTtf) {
            $this->renderTtfWatermark($src, $width, $height, $commissionId, $fontPath);
        } else {
            $this->renderBitmapWatermark($src, $width, $height, $commissionId);
        }

        $saved = false;
        if (function_exists('imagewebp')) {
            $saved = @imagewebp($src, $outputPath, 82);
        } elseif (function_exists('imagejpeg')) {
            $saved = @imagejpeg($src, $outputPath, 85);
        }

        imagedestroy($src);

        return $saved;
    }

    /**
     * Render vector TrueType watermark scaled dynamically to image dimensions.
     */
    private function renderTtfWatermark($src, int $width, int $height, int $commissionId, string $fontPath): void
    {
        $minDim = min($width, $height);
        $mainFontSize = max(24, min(140, (int) round($minDim * 0.035)));
        $tiledFontSize = max(16, min(80, (int) round($minDim * 0.022)));

        // Watermark text
        $tiledText = "COMME PREVIEW • UNPAID • ORDER #{$commissionId}";
        $centerText = "••• COMME SECURE PROOF • UNPAID ORDER #{$commissionId} •••";
        $subText = "Review delivery • Full resolution unlocks upon acceptance & payout release";

        // Colors
        $tiledColor = imagecolorallocatealpha($src, 255, 255, 255, 65);
        $tiledShadow = imagecolorallocatealpha($src, 0, 0, 0, 80);
        $bannerBg = imagecolorallocatealpha($src, 15, 23, 42, 35);
        $bannerBorder = imagecolorallocatealpha($src, 245, 158, 11, 40);
        $mainTextColor = imagecolorallocatealpha($src, 255, 255, 255, 10);
        $mainShadowColor = imagecolorallocatealpha($src, 0, 0, 0, 30);
        $accentColor = imagecolorallocatealpha($src, 251, 191, 36, 15);

        // 1. Tiled diagonal repeating stamps across the canvas
        $angle = 32;
        $stepX = max(380, (int) round($width / 3.2));
        $stepY = max(280, (int) round($height / 4.5));

        for ($y = -$stepY; $y < $height + $stepY; $y += $stepY) {
            for ($x = -$stepX; $x < $width + $stepX; $x += $stepX) {
                // Drop shadow
                imagettftext($src, $tiledFontSize, $angle, $x + 3, $y + 3, $tiledShadow, $fontPath, $tiledText);
                // Main tiled text
                imagettftext($src, $tiledFontSize, $angle, $x, $y, $tiledColor, $fontPath, $tiledText);
            }
        }

        // 2. Center Prominent Banner
        $bannerHeight = (int) round($mainFontSize * 2.8);
        $centerY = (int) round($height / 2);
        $bannerTop = $centerY - (int) round($bannerHeight / 2);
        $bannerBottom = $bannerTop + $bannerHeight;

        imagefilledrectangle($src, 0, $bannerTop, $width, $bannerBottom, $bannerBg);

        // Accent top/bottom lines
        $borderThickness = max(2, (int) round($minDim * 0.002));
        for ($i = 0; $i < $borderThickness; $i++) {
            imageline($src, 0, $bannerTop + $i, $width, $bannerTop + $i, $bannerBorder);
            imageline($src, 0, $bannerBottom - $i, $width, $bannerBottom - $i, $bannerBorder);
        }

        // Center banner text
        $bbox = imagettfbbox($mainFontSize, 0, $fontPath, $centerText);
        $textWidth = abs($bbox[2] - $bbox[0]);
        $textHeight = abs($bbox[7] - $bbox[1]);
        $textX = max(20, (int) round(($width - $textWidth) / 2));
        $textY = $bannerTop + (int) round(($bannerHeight + $textHeight) / 2) - 4;

        // Subtitle text
        $subFontSize = max(14, (int) round($mainFontSize * 0.38));
        $subBbox = imagettfbbox($subFontSize, 0, $fontPath, $subText);
        $subWidth = abs($subBbox[2] - $subBbox[0]);
        $subX = max(20, (int) round(($width - $subWidth) / 2));
        $subY = $textY + (int) round($subFontSize * 1.6);

        // Draw center text with shadow
        imagettftext($src, $mainFontSize, 0, $textX + 4, $textY + 4, $mainShadowColor, $fontPath, $centerText);
        imagettftext($src, $mainFontSize, 0, $textX, $textY, $mainTextColor, $fontPath, $centerText);

        // Draw subtitle with shadow
        imagettftext($src, $subFontSize, 0, $subX + 2, $subY + 2, $mainShadowColor, $fontPath, $subText);
        imagettftext($src, $subFontSize, 0, $subX, $subY, $accentColor, $fontPath, $subText);
    }

    /**
     * Fallback built-in bitmap font renderer without non-ASCII mojibake.
     */
    private function renderBitmapWatermark($src, int $width, int $height, int $commissionId): void
    {
        $font = 5;
        // Plain ASCII text to prevent UTF-8 mojibake in GD imagestring
        $text = "COMME PREVIEW - UNPAID - ORDER #{$commissionId}";
        $textColor = imagecolorallocatealpha($src, 255, 255, 255, 40);
        $shadowColor = imagecolorallocatealpha($src, 0, 0, 0, 60);

        $stepX = max(240, (int) round($width / 3));
        $stepY = max(160, (int) round($height / 4));

        for ($y = 40; $y < $height; $y += $stepY) {
            for ($x = 30; $x < $width; $x += $stepX) {
                imagestring($src, $font, $x + 1, $y + 1, $text, $shadowColor);
                imagestring($src, $font, $x, $y, $text, $textColor);
            }
        }

        $centerBannerY = (int) round($height / 2);
        $bannerBg = imagecolorallocatealpha($src, 15, 23, 42, 45);
        imagefilledrectangle($src, 0, $centerBannerY - 24, $width, $centerBannerY + 24, $bannerBg);

        $centerText = "*** COMME SECURE PROOF - UNPAID ORDER #{$commissionId} ***";
        $textWidth = strlen($centerText) * 9;
        $centerTextX = max(10, (int) round(($width - $textWidth) / 2));

        $prominentColor = imagecolorallocatealpha($src, 255, 255, 255, 15);
        imagestring($src, $font, $centerTextX + 1, $centerBannerY - 6, $centerText, $shadowColor);
        imagestring($src, $font, $centerTextX, $centerBannerY - 7, $centerText, $prominentColor);
    }
}
