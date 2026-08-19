<?php

use App\Http\Controllers\API\V1\CommissionController;
use App\Http\Controllers\API\V1\CommissionMessageController;
use Illuminate\Support\Facades\Route;

Route::patch('commissions/{commission}/cancel', [CommissionController::class, 'cancel'])
    ->name('commissions.cancel');

Route::patch('commissions/{commission}/deadline', [CommissionController::class, 'updateDeadline'])
    ->name('commissions.update-deadline');

Route::get('commissions/{commission}/messages', [CommissionMessageController::class, 'index']);
Route::post('commissions/{commission}/messages', [CommissionMessageController::class, 'store']);

Route::apiResource('commissions', CommissionController::class)->except(['destroy']);
