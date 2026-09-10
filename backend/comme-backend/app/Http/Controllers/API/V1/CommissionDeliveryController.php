<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\CommissionStatus;
use App\Http\Helpers\ApiResponseHelper;
use App\Models\Commission;
use App\Models\Media;
use App\Services\API\V1\WatermarkService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CommissionDeliveryController extends Controller
{
    /**
     * Download or view the watermarked proof preview for an in-progress or review commission.
     */
    public function proof(
        Request $request,
        Commission $commission,
        Media $media,
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

        $disk = $media->getDisk();

        // If thumbnail/proof path exists, serve it
        $targetPath = $media->thumbnail_path;

        // If no proof exists yet, attempt to generate one
        if (empty($targetPath) || ! Storage::disk($disk)->exists($targetPath)) {
            $generated = $watermarkService->generateProof($commission, $media);
            if ($generated) {
                $media->thumbnail_path = $generated;
                $media->saveQuietly();
                $targetPath = $generated;
            } else {
                $targetPath = $media->file_path;
            }
        }

        if (! Storage::disk($disk)->exists($targetPath)) {
            return ApiResponseHelper::errorResponse('Preview file not found in storage.', Response::HTTP_NOT_FOUND);
        }

        $fullPath = Storage::disk($disk)->path($targetPath);

        return response()->download($fullPath, 'proof_' . $media->file_name, [
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
        Media $media
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

        $disk = $media->getDisk();

        if (! Storage::disk($disk)->exists($media->file_path)) {
            return ApiResponseHelper::errorResponse('File not found in storage.', Response::HTTP_NOT_FOUND);
        }

        $fullPath = Storage::disk($disk)->path($media->file_path);

        return response()->download($fullPath, $media->file_name ?: basename($media->file_path), [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }
}
