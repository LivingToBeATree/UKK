<?php

use App\Http\Controllers\API\V1\CommissionServiceController;
use Illuminate\Support\Facades\Route;

Route::get('commission-services', [CommissionServiceController::class, 'index']);
Route::get('commission-services/{commission_service}', [CommissionServiceController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('commission-services', [CommissionServiceController::class, 'store']);
    Route::match(['put', 'patch'], 'commission-services/{commission_service}', [CommissionServiceController::class, 'update']);
    Route::delete('commission-services/{commission_service}', [CommissionServiceController::class, 'destroy']);
});
