<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Models\Commission;
use App\Models\CommissionMedia;
use App\Models\CommissionMessageMedia;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PrivateMediaController extends Controller
{
    /**
     * Download or view a protected media file with role/participant authorization.
     */
    public function download(Request $request, Media $media): BinaryFileResponse|\Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponseHelper::errorResponse('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
        }

        // Authorization check
        $isAuthorized = false;

        // Staff / Admin can access all media
        if ($user->isStaff() || $user->isAdmin()) {
            $isAuthorized = true;
        }

        // Direct owner can access
        if ($user->id === $media->user_id) {
            $isAuthorized = true;
        }

        // If media is attached to a commission or commission message, check commission participants
        if (! $isAuthorized) {
            // Check commission_medias
            $commissionMedia = CommissionMedia::where('file_path', $media->file_path)->first();
            if ($commissionMedia) {
                $commission = Commission::with('artistProfile')->find($commissionMedia->commission_id);
                if ($commission && ($commission->user_id === $user->id || $commission->artistProfile?->user_id === $user->id)) {
                    $isAuthorized = true;
                }
            }

            // Check commission_message_medias
            if (! $isAuthorized) {
                $messageMedia = CommissionMessageMedia::with('commissionMessage.commission.artistProfile')
                    ->where('file_path', $media->file_path)
                    ->first();

                if ($messageMedia && $messageMedia->commissionMessage) {
                    $commission = $messageMedia->commissionMessage->commission;
                    if ($commission && ($commission->user_id === $user->id || $commission->artistProfile?->user_id === $user->id)) {
                        $isAuthorized = true;
                    }
                }
            }
        }

        if (! $isAuthorized) {
            return ApiResponseHelper::errorResponse(
                'You are not authorized to view or download this private file.',
                Response::HTTP_FORBIDDEN
            );
        }

        $disk = $media->getDisk();
        $isThumb = $request->query('type') === 'thumb';
        $targetPath = ($isThumb && $media->thumbnail_path) ? $media->thumbnail_path : $media->file_path;

        if (! $targetPath || str_contains($targetPath, "\0") || str_contains($targetPath, '..') || str_contains($targetPath, '\\')) {
            return ApiResponseHelper::errorResponse('Invalid media storage path.', Response::HTTP_NOT_FOUND);
        }

        // Cross-commission safeguard: verify requesting user is an authentic participant of the commission
        if (str_starts_with($targetPath, 'commissions/')) {
            $parts = explode('/', $targetPath);
            $commissionId = $parts[1] ?? null;
            if ($commissionId && is_numeric($commissionId)) {
                $commission = Commission::with('artistProfile')->find((int) $commissionId);
                if (! $commission || (! $user->isStaff() && ! $user->isAdmin() && $commission->user_id !== $user->id && $commission->artistProfile?->user_id !== $user->id)) {
                    return ApiResponseHelper::errorResponse(
                        'You are not authorized to access deliverables for this commission.',
                        Response::HTTP_FORBIDDEN
                    );
                }
            }
        }

        if (! Storage::disk($disk)->exists($targetPath)) {
            return ApiResponseHelper::errorResponse('File not found in storage.', Response::HTTP_NOT_FOUND);
        }

        $fullPath = Storage::disk($disk)->path($targetPath);
        $realPath = realpath($fullPath);
        $diskRoot = realpath(Storage::disk($disk)->path('')) ?: Storage::disk($disk)->path('');

        if (! $realPath || ! file_exists($realPath) || ! str_starts_with(strtolower($realPath), strtolower($diskRoot))) {
            return ApiResponseHelper::errorResponse('File not found in storage.', Response::HTTP_NOT_FOUND);
        }

        $downloadName = $isThumb
            ? 'thumb_' . ($media->file_name ?: basename($targetPath))
            : ($media->file_name ?: basename($targetPath));

        return response()->download($fullPath, $downloadName, $this->getDownloadCorsHeaders($request));
    }
}
