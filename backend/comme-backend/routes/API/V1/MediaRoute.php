<?php

use App\Http\Controllers\API\V1\MediaController;
use App\Http\Controllers\API\V1\MediaStreamController;
use Illuminate\Support\Facades\Route;

// Public media stream with HTTP 206 Byte-Range support for video seeking
Route::get('media/stream/{path}', [MediaStreamController::class, 'stream'])->where('path', '.*');

Route::get('media/download-file', [MediaController::class, 'downloadByPath']);
Route::get('media/{media}/download', [MediaController::class, 'download']);
Route::get('media/{media}', [MediaController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('media', [MediaController::class, 'store']);
    Route::delete('media/{media}', [MediaController::class, 'destroy']);
});
