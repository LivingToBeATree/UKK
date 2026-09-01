<?php

namespace App\Http\Controllers\API\V1;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class MediaStreamController extends Controller
{
    /**
     * Stream media with full HTTP 206 Partial Content (Byte-Range requests) support.
     * Allows browsers to smoothly seek/scrub forward and backward without resetting to 0.
     */
    public function stream(Request $request, string $path): BinaryFileResponse
    {
        // Sanitize path against directory traversal
        $cleanPath = ltrim(str_replace(['..', '\\'], ['', '/'], $path), '/');

        if (! Storage::disk('public')->exists($cleanPath)) {
            abort(Response::HTTP_NOT_FOUND, 'Media file not found.');
        }

        $fullPath = Storage::disk('public')->path($cleanPath);
        $mime = Storage::disk('public')->mimeType($cleanPath) ?: 'application/octet-stream';

        $response = new BinaryFileResponse($fullPath, 200, [
            'Content-Type' => $mime,
            'Accept-Ranges' => 'bytes',
        ], false, 'inline');

        $response->setAutoEtag();

        return $response;
    }
}
