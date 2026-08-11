<?php

use App\Http\Controllers\API\V1\CommissionReviewController;
use Illuminate\Support\Facades\Route;

Route::get('/artist-profiles/{artist_profile}/reviews', [CommissionReviewController::class, 'index']);
Route::post('/commissions/{commission}/reviews', [CommissionReviewController::class, 'store']);
Route::get('/reviews/{review}', [CommissionReviewController::class, 'show']);
Route::patch('/reviews/{review}', [CommissionReviewController::class, 'update']);
Route::delete('/reviews/{review}', [CommissionReviewController::class,'destroy']);
Route::patch('/reviews/{review}/reply', [CommissionReviewController::class,'reply']);

Route::apiResource('commission-reviews', CommissionReviewController::class);
