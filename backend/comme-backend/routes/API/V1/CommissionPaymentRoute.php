<?php

use App\Http\Controllers\API\V1\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/commissions/{commission}/payment', [PaymentController::class, 'initiate']);
    Route::post('/commissions/{commission}/payment/simulate', [PaymentController::class, 'simulate']);
    Route::post('/commissions/{commission}/payment/check-status', [PaymentController::class, 'checkStatus']);
    Route::get('/commissions/{commission}/payment/check-status', [PaymentController::class, 'checkStatus']);
});
