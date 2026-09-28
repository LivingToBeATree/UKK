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
        $raw = urldecode($path);

        // Directory traversal defense: reject null bytes, directory climbs, and path separators
        if (str_contains($raw, "\0") || str_contains($raw, '..') || str_contains($raw, '\\')) {
            abort(Response::HTTP_NOT_FOUND, 'Invalid media stream path.');
        }

        $cleanPath = ltrim(explode('?', $raw)[0], '/');

        // Prevent streaming of protected deliverables or private media
        if (str_starts_with($cleanPath, 'commissions/') || str_starts_with($cleanPath, 'private/')) {
            abort(Response::HTTP_FORBIDDEN, 'Protected media stream is restricted to authorized endpoints.');
        }

        $allowedBase = realpath(storage_path('app/public'));
        $fullCandidate = storage_path('app/public/' . $cleanPath);
        $real = realpath($fullCandidate);

        if (! $real || ! is_file($real) || ! $allowedBase || ! str_starts_with($real, $allowedBase . DIRECTORY_SEPARATOR)) {
            abort(Response::HTTP_NOT_FOUND, 'Media file not found.');
        }

        $mime = @mime_content_type($real) ?: 'application/octet-stream';

        $response = new BinaryFileResponse($real, 200, [
            'Content-Type' => $mime,
            'Accept-Ranges' => 'bytes',
        ], false, 'inline');

        $response->setAutoEtag();

        return $response;
    }
}
