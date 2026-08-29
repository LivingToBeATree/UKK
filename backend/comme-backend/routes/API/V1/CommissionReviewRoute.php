<?php

use App\Http\Controllers\API\V1\CommissionReviewController;
use Illuminate\Support\Facades\Route;

Route::get('/artist-profiles/{artist_profile}/reviews', [CommissionReviewController::class, 'index']);
Route::get('/reviews/{review}', [CommissionReviewController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/commissions/{commission}/reviews', [CommissionReviewController::class, 'store']);
    Route::match(['put', 'patch'], '/reviews/{review}', [CommissionReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [CommissionReviewController::class, 'destroy']);
    Route::patch('/reviews/{review}/reply', [CommissionReviewController::class, 'reply']);
});
