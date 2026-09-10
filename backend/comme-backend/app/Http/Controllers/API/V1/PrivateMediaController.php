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

        // 1. Authorization check
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

        if (! Storage::disk($disk)->exists($targetPath)) {
            return ApiResponseHelper::errorResponse('File not found in storage.', Response::HTTP_NOT_FOUND);
        }

        $fullPath = Storage::disk($disk)->path($targetPath);
        $downloadName = $isThumb
            ? 'thumb_' . ($media->file_name ?: basename($targetPath))
            : ($media->file_name ?: basename($targetPath));

        return response()->download($fullPath, $downloadName, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }
}
