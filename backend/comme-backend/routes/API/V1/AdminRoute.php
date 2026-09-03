<?php

use App\Http\Controllers\API\V1\AdminController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::patch('/users/{user}/role', [AdminController::class, 'updateUserRole']);
    Route::get('/moderation-logs', [AdminController::class, 'moderationLogs']);
});
