<?php

use App\Http\Controllers\API\V1\PortfolioController;
use Illuminate\Support\Facades\Route;

Route::apiResource('portfolios', PortfolioController::class);
