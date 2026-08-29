<?php

use App\Http\Controllers\API\V1\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('reports', ReportController::class)->except(['destroy']);
});
