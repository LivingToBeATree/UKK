<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/explore', function () {
    return view('explore');
});

Route::get('/errors', function () {
    return view('errors');
});

// Direct storage file provider with full CORS support and fallback for development & production
Route::get('storage/{path}', function (\Illuminate\Http\Request $request, string $path) {
    $raw = urldecode($path);
    $cleanPath = ltrim(explode('?', $raw)[0], '/');

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
        abort(404, 'File not found in storage: ' . $cleanPath);
    }

    $mimeType = @mime_content_type($fullPath) ?: 'application/octet-stream';
    $headers = [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers' => '*',
        'Access-Control-Expose-Headers' => 'Content-Disposition, Content-Length',
        'Content-Type' => $mimeType,
    ];

    if ($request->has('download') || $request->query('download') === '1') {
        $filename = $request->query('name') ?: basename($fullPath);
        $filename = preg_replace('/[^\w\.\-\s\(\)\[\]]/', '_', $filename);
        return response()->download($fullPath, $filename, $headers);
    }

    return response()->file($fullPath, $headers);
})->where('path', '.*');

