<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\CommissionStatus;
use App\Http\Helpers\ApiResponseHelper;
use App\Models\Commission;
use App\Models\CommissionMedia;
use App\Models\CommissionMessageMedia;
use App\Models\Media;
use App\Services\API\V1\WatermarkService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CommissionDeliveryController extends Controller
{
    /**
     * Resolve the target media model across CommissionMessageMedia, CommissionMedia, or base Media.
     */
    private function resolveCommissionMedia(Commission $commission, mixed $media): ?Media
    {
        if ($media instanceof Media) {
            return $media;
        }

        $mediaId = is_numeric($media) ? (int) $media : $media;

        // Deliverables and commission message media (most common for deliverables)
        $messageMedia = CommissionMessageMedia::where('id', $mediaId)
            ->whereHas('commissionMessage', function ($q) use ($commission) {
                $q->where('commission_id', $commission->id);
            })
            ->first();

        if ($messageMedia) {
            return $messageMedia;
        }

        // Direct commission attachment media
        $commMedia = CommissionMedia::where('id', $mediaId)
            ->where('commission_id', $commission->id)
            ->first();

        if ($commMedia) {
            return $commMedia;
        }

        // Fallback: Check CommissionMessageMedia by ID directly
        $directMsgMedia = CommissionMessageMedia::find($mediaId);
        if ($directMsgMedia) {
            return $directMsgMedia;
        }

        // Fallback: Base media table
        return Media::find($mediaId);
    }

    /**
     * Download or view the watermarked proof preview for an in-progress or review commission.
     */
    public function proof(
        Request $request,
        Commission $commission,
        mixed $media,
        WatermarkService $watermarkService
    ): BinaryFileResponse|\Illuminate\Http\JsonResponse {
        $user = $request->user();

        if (! $user) {
            return ApiResponseHelper::errorResponse('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
        }

        // Authorization check: participant or staff
        $isParticipant = $user->id === $commission->user_id
            || $user->id === $commission->artistProfile?->user_id
            || $user->isStaff()
            || $user->isAdmin();

        if (! $isParticipant) {
            return ApiResponseHelper::errorResponse(
                'You are not authorized to access files for this commission.',
                Response::HTTP_FORBIDDEN
            );
        }

        $mediaModel = $this->resolveCommissionMedia($commission, $media);
        if (! $mediaModel) {
            return ApiResponseHelper::errorResponse('Deliverable file not found.', Response::HTTP_NOT_FOUND);
        }

        $disk = $mediaModel->getDisk();

        // Check for existing generated proof
        $dir = dirname($mediaModel->file_path);
        $dirPrefix = ($dir === '.' || $dir === '/' || $dir === '') ? '' : $dir . '/';
        $filename = pathinfo($mediaModel->file_path, PATHINFO_FILENAME);
        $expectedProofPath = $dirPrefix . $filename . '_proof.webp';

        $targetPath = null;
        if (! empty($mediaModel->thumbnail_path) && Storage::disk($disk)->exists($mediaModel->thumbnail_path)) {
            $targetPath = $mediaModel->thumbnail_path;
        } elseif (Storage::disk($disk)->exists($expectedProofPath)) {
            $targetPath = $expectedProofPath;
        }

        // If no proof exists yet, attempt to generate one
        if (! $targetPath) {
            $generated = $watermarkService->generateProof($commission, $mediaModel);
            if ($generated && Storage::disk($disk)->exists($generated)) {
                $targetPath = $generated;
                if (Schema::hasColumn($mediaModel->getTable(), 'thumbnail_path')) {
                    $mediaModel->thumbnail_path = $generated;
                    $mediaModel->saveQuietly();
                }
            } else {
                $targetPath = $mediaModel->file_path;
            }
        }

        if (! Storage::disk($disk)->exists($targetPath)) {
            return ApiResponseHelper::errorResponse('Preview file not found in storage.', Response::HTTP_NOT_FOUND);
        }

        $fullPath = Storage::disk($disk)->path($targetPath);
        $ext = pathinfo($targetPath, PATHINFO_EXTENSION) ?: 'webp';
        $baseName = pathinfo($mediaModel->file_name ?: basename($targetPath), PATHINFO_FILENAME);
        $downloadName = 'proof_' . $baseName . '.' . $ext;

        return response()->download($fullPath, $downloadName, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }

    /**
     * Download the pristine full-resolution deliverable asset.
     * Enforces anti-art theft: buyers can only download once order is completed.
     */
    public function downloadOriginal(
        Request $request,
        Commission $commission,
        mixed $media
    ): BinaryFileResponse|\Illuminate\Http\JsonResponse {
        $user = $request->user();

        if (! $user) {
            return ApiResponseHelper::errorResponse('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
        }

        $isArtist = $user->id === $commission->artistProfile?->user_id;
        $isStaff = $user->isStaff() || $user->isAdmin();
        $isBuyer = $user->id === $commission->user_id;

        if (! ($isBuyer || $isArtist || $isStaff)) {
            return ApiResponseHelper::errorResponse(
                'You are not authorized to download deliverables for this commission.',
                Response::HTTP_FORBIDDEN
            );
        }

        $statusValue = $commission->status instanceof CommissionStatus ? $commission->status->value : $commission->status;

        // If requester is the buyer and order is not completed yet, protect the artist
        if ($isBuyer && ! in_array($statusValue, ['completed'], true) && ! $isStaff) {
            return ApiResponseHelper::errorResponse(
                'Original full-resolution asset unlocks once you approve delivery and complete the order. Please review the watermarked proof preview first.',
                Response::HTTP_FORBIDDEN
            );
        }

        $mediaModel = $this->resolveCommissionMedia($commission, $media);
        if (! $mediaModel) {
            return ApiResponseHelper::errorResponse('Deliverable file not found.', Response::HTTP_NOT_FOUND);
        }

        $disk = $mediaModel->getDisk();

        if (! Storage::disk($disk)->exists($mediaModel->file_path)) {
            return ApiResponseHelper::errorResponse('File not found in storage.', Response::HTTP_NOT_FOUND);
        }

        $fullPath = Storage::disk($disk)->path($mediaModel->file_path);

        return response()->download($fullPath, $mediaModel->file_name ?: basename($mediaModel->file_path), [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }
}
