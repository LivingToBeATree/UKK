<?php

use App\Http\Controllers\API\V1\PortfolioController;
use Illuminate\Support\Facades\Route;

Route::get('portfolios', [PortfolioController::class, 'index']);
Route::get('portfolios/{portfolio}', [PortfolioController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('portfolios', [PortfolioController::class, 'store']);
    Route::match(['put', 'patch'], 'portfolios/{portfolio}', [PortfolioController::class, 'update']);
    Route::delete('portfolios/{portfolio}', [PortfolioController::class, 'destroy']);
});
