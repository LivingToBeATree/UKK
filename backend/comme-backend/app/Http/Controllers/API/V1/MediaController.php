<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\MediaType;
use App\Http\Helpers\ApiResponseHelper;
use App\Http\Requests\API\V1\StoreMediaRequest;
use App\Http\Resources\API\V1\MediaResource;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Jobs\ProcessMediaJob;

class MediaController extends Controller
{
    /**
     * Store and upload a new media file.
     * Attaches the authenticated user as the media owner.
     */
    public function store(StoreMediaRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType() ?? 'application/octet-stream';
        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize();

        // Determine MediaType enum
        $mediaType = str_starts_with($mimeType, 'video/')
            ? MediaType::VIDEO
            : MediaType::IMAGE;

        $disk = $request->input('disk', 'public');

        // Generate sanitized unique filename and store in chosen disk
        $fileName = Str::uuid() . '.' . $extension;
        $path = $file->storeAs('uploads/' . date('Y/m'), $fileName, $disk);

        if (! $path) {
            Log::error('Failed to store media file: ' . $originalName);
            return ApiResponseHelper::errorResponse(
                'Failed to write file to storage. Please check disk permissions.',
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        $media = Media::create([
            'user_id' => $request->user()->id,
            'file_name' => $originalName,
            'file_path' => $path,
            'disk' => $disk,
            'media_type' => $mediaType,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'sort_order' => (int) $request->input('sort_order', 0),
            'is_thumbnail' => (bool) $request->input('is_thumbnail', false),
        ]);

        // Dispatch background processing for video fast-start and thumbnail generation
        ProcessMediaJob::dispatch($media->id);

        return ApiResponseHelper::successResponse(
            new MediaResource($media),
            'Media uploaded successfully.',
            Response::HTTP_CREATED
        );
    }

    /**
     * Display the specified media metadata.
     */
    public function show(Media $media): JsonResponse
    {
        return ApiResponseHelper::successResponse(new MediaResource($media));
    }

    /**
     * Download the specified media file directly as an attachment.
     */
    public function download(Request $request, Media $media)
    {
        if (!$media->file_path || !Storage::disk('public')->exists($media->file_path)) {
            return ApiResponseHelper::errorResponse('File not found in storage.', Response::HTTP_NOT_FOUND);
        }

        $fullPath = Storage::disk('public')->path($media->file_path);
        $downloadName = $media->file_name ?: basename($media->file_path);

        return response()->download($fullPath, $downloadName, $this->getDownloadCorsHeaders($request));
    }

    /**
     * Remove the specified media from storage.
     * Strictly authorized via MediaPolicy: only the owner or an admin can delete.
     */
    public function destroy(Media $media): JsonResponse
    {
        Gate::authorize('delete', $media);

        $disk = $media->getDisk();

        if ($media->file_path && Storage::disk($disk)->exists($media->file_path)) {
            Storage::disk($disk)->delete($media->file_path);
        }

        if ($media->thumbnail_path && Storage::disk($disk)->exists($media->thumbnail_path)) {
            Storage::disk($disk)->delete($media->thumbnail_path);
        }

        $media->delete();

        return ApiResponseHelper::successResponse(message: 'Media deleted successfully.');
    }
}
