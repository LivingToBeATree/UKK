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

        // Generate sanitized unique filename and store in public uploads
        $fileName = Str::uuid() . '.' . $extension;
        $path = $file->storeAs('uploads/' . date('Y/m'), $fileName, 'public');

        // Automatically faststart MP4 videos so moov atom is at the front for instant streaming
        if ($mediaType === MediaType::VIDEO && strtolower($extension) === 'mp4') {
            $fullDiskPath = Storage::disk('public')->path($path);
            $scriptPath = base_path('storage/mp4-faststart.cjs');
            if (file_exists($scriptPath) && file_exists($fullDiskPath)) {
                @exec('node ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($fullDiskPath) . ' 2>&1');
                clearstatcache(true, $fullDiskPath);
                $fileSize = filesize($fullDiskPath);
            }
        }

        $media = Media::create([
            'user_id' => $request->user()->id,
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
     * Download the specified media file directly as an attachment.
     */
    public function download(Media $media)
    {
        if (!$media->file_path || !Storage::disk('public')->exists($media->file_path)) {
            return ApiResponseHelper::errorResponse('File not found in storage.', Response::HTTP_NOT_FOUND);
        }

        $fullPath = Storage::disk('public')->path($media->file_path);
        $downloadName = $media->file_name ?: basename($media->file_path);

        return response()->download($fullPath, $downloadName, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }

    /**
     * Download any file from public storage by path or URL query parameter.
     */
    public function downloadByPath(\Illuminate\Http\Request $request)
    {
        $raw = $request->query('path') ?? $request->query('url') ?? '';
        $raw = urldecode($raw);

        // Extract path component if a full URL was provided
        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
            $parsed = parse_url($raw, PHP_URL_PATH) ?? '';
            $raw = $parsed;
        }

        if (str_contains($raw, '/storage/')) {
            $raw = explode('/storage/', $raw)[1];
        }

        $cleanPath = ltrim(explode('?', $raw)[0], '/');

        // Search common storage locations
        $candidates = [
            storage_path('app/public/' . $cleanPath),
            storage_path('app/' . $cleanPath),
            public_path('storage/' . $cleanPath),
            public_path($cleanPath),
        ];

        $fullPath = null;
        foreach ($candidates as $candidate) {
            if (file_exists($candidate) && is_file($candidate)) {
                $fullPath = $candidate;
                break;
            }
        }

        if (!$fullPath) {
            return ApiResponseHelper::errorResponse('File not found in storage: ' . $cleanPath, Response::HTTP_NOT_FOUND);
        }

        $filename = $request->query('name') ?: basename($fullPath);
        $filename = preg_replace('/[^\w\.\-\s\(\)\[\]]/', '_', $filename);

        return response()->download($fullPath, $filename, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers' => '*',
            'Access-Control-Expose-Headers' => 'Content-Disposition, Content-Length',
        ]);
    }

    /**
     * Remove the specified media from storage.
     * Strictly authorized via MediaPolicy: only the owner or an admin can delete.
     */
    public function destroy(Media $media): JsonResponse
    {
        Gate::authorize('delete', $media);

        if ($media->file_path && Storage::disk('public')->exists($media->file_path)) {
            Storage::disk('public')->delete($media->file_path);
        }

        $media->delete();

        return ApiResponseHelper::successResponse(message: 'Media deleted successfully.');
    }
}
