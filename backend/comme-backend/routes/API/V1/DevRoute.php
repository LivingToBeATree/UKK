<?php

use App\Http\Controllers\API\V1\DevController;
use Illuminate\Support\Facades\Route;

Route::prefix('dev')->group(function () {
    Route::get('/users', [DevController::class, 'listUsers']);
    Route::post('/switch-persona', [DevController::class, 'switchPersona']);
});
