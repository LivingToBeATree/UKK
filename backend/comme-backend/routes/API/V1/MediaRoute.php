<?php

use App\Http\Controllers\API\V1\MediaController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('media/{media}', [MediaController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('media', [MediaController::class, 'store']);
        Route::delete('media/{media}', [MediaController::class, 'destroy']);
    });
});
