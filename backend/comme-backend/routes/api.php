<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ArtistProfileController;
use App\Http\Controllers\CommissionServiceController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class,'register']);
Route::post('/login', [AuthController::class,'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class,'logout']);
    Route::get('/me', [AuthController::class,'me']);
});

Route::apiResource('artist-profiles', ArtistProfileController::class);
Route::apiResource('commmission-services', CommissionServiceController::class);