<?php

use App\Http\Controllers\API\V1\CommissionController;
use App\Http\Controllers\API\V1\CommissionMessageController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Explicit lifecycle state transitions
    Route::post('commissions/{commission}/accept', [CommissionController::class, 'accept'])
        ->name('commissions.accept');

    Route::post('commissions/{commission}/decline', [CommissionController::class, 'decline'])
        ->name('commissions.decline');

    Route::post('commissions/{commission}/deliver', [CommissionController::class, 'deliver'])
        ->name('commissions.deliver');

    Route::post('commissions/{commission}/confirm', [CommissionController::class, 'confirm'])
        ->name('commissions.confirm');

    Route::post('commissions/{commission}/request-revision', [CommissionController::class, 'requestRevision'])
        ->name('commissions.request-revision');

    Route::patch('commissions/{commission}/cancel', [CommissionController::class, 'cancel'])
        ->name('commissions.cancel');

    Route::patch('commissions/{commission}/deadline', [CommissionController::class, 'updateDeadline'])
        ->name('commissions.update-deadline');

    Route::post('commissions/{commission}/propose-deadline', [CommissionController::class, 'proposeDeadline'])
        ->name('commissions.propose-deadline');

    Route::post('commissions/{commission}/accept-deadline', [CommissionController::class, 'acceptDeadline'])
        ->name('commissions.accept-deadline');

    Route::post('commissions/{commission}/decline-deadline', [CommissionController::class, 'declineDeadline'])
        ->name('commissions.decline-deadline');

    Route::get('commissions/{commission}/messages', [CommissionMessageController::class, 'index']);
    Route::post('commissions/{commission}/messages', [CommissionMessageController::class, 'store']);

    Route::apiResource('commissions', CommissionController::class)->except(['destroy']);
});
