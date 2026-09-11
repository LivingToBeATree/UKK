<?php

use App\Http\Controllers\API\V1\ArtistProfileController;
use App\Http\Controllers\API\V1\CommissionQueueController;
use Illuminate\Support\Facades\Route;

Route::get('artist-profiles', [ArtistProfileController::class, 'index']);
Route::get('artist-profiles/{artist_profile}', [ArtistProfileController::class, 'show']);
Route::get('artist-profiles/{artist_profile}/queue', [CommissionQueueController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('artist-profiles', [ArtistProfileController::class, 'store']);
    Route::match(['put', 'patch'], 'artist-profiles/{artist_profile}', [ArtistProfileController::class, 'update']);
    Route::delete('artist-profiles/{artist_profile}', [ArtistProfileController::class, 'destroy']);
});
