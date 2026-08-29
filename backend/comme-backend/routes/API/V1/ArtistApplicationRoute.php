<?php

use App\Http\Controllers\API\V1\ArtistApplicationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('artist-applications/my-application', [ArtistApplicationController::class, 'myApplication']);
    Route::post('artist-applications/{artist_application}/approve', [ArtistApplicationController::class, 'approve']);
    Route::post('artist-applications/{artist_application}/reject', [ArtistApplicationController::class, 'reject']);

    Route::apiResource('artist-applications', ArtistApplicationController::class)
        ->only(['index', 'store', 'show']);
});
