<?php

use App\Http\Controllers\API\V1\CommissionServiceController;
use Illuminate\Support\Facades\Route;

Route::apiResource('commission-services', CommissionServiceController::class);
