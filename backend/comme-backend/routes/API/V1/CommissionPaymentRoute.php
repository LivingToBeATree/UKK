<?php

use App\Http\Controllers\API\V1\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/commissions/{commission}/payment', [PaymentController::class, 'initiate']);
});
