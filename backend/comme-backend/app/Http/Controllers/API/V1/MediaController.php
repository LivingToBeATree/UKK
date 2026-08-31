<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\MediaType;
use App\Http\Helpers\ApiResponseHelper;
use App\Http\Requests\API\V1\StoreMediaRequest;
use App\Http\Resources\API\V1\MediaResource;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Store and upload a new media file.
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

        // Generate sanitized unique filename and store in public uploads
        $fileName = Str::uuid() . '.' . $extension;
        $path = $file->storeAs('uploads/' . date('Y/m'), $fileName, 'public');

        $media = Media::create([
            'file_name' => $originalName,
            'file_path' => $path,
            'media_type' => $mediaType,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'sort_order' => (int) $request->input('sort_order', 0),
            'is_thumbnail' => (bool) $request->input('is_thumbnail', false),
        ]);

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
     * Remove the specified media from storage.
     */
    public function destroy(Media $media): JsonResponse
    {
        if ($media->file_path && Storage::disk('public')->exists($media->file_path)) {
            Storage::disk('public')->delete($media->file_path);
        }

        $media->delete();

        return ApiResponseHelper::successResponse(message: 'Media deleted successfully.');
    }
}
