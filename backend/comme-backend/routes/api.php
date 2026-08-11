<?php

use App\Http\Controllers\API\V1\AuthController;
use Illuminate\Support\Facades\Route;

// Public — no auth required to register or log in.
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Every resource's routes live in its own file under routes/API/V1/ —
    // add a new *.php file there and it's picked up automatically, no
    // need to touch this file again.
    foreach (glob(__DIR__ . '/API/V1/*.php') as $resourceRoutes) {
        require $resourceRoutes;
    }
});
