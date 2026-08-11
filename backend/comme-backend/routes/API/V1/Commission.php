<?php

use App\Http\Controllers\API\V1\CommissionController;
use Illuminate\Support\Facades\Route;

Route::patch('commissions/{commission}/cancel', [CommissionController::class, 'cancel'])
    ->name('commissions.cancel');

Route::patch('commissions/{commission}/deadline', [CommissionController::class, 'updateDeadline'])
    ->name('commissions.update-deadline');

Route::apiResource('commissions', CommissionController::class)->except(['destroy']);
