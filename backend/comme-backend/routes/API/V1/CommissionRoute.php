<?php

use App\Http\Controllers\API\V1\CommissionController;
use App\Http\Controllers\API\V1\CommissionDeliveryController;
use App\Http\Controllers\API\V1\CommissionDocumentController;
use App\Http\Controllers\API\V1\CommissionMessageController;
use App\Http\Controllers\API\V1\LiveStreamController;
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

    Route::post('commissions/{commission}/request-cancellation', [CommissionController::class, 'requestCancellation'])
        ->name('commissions.request-cancellation');

    Route::post('commissions/{commission}/accept-cancellation', [CommissionController::class, 'acceptCancellation'])
        ->name('commissions.accept-cancellation');

    Route::post('commissions/{commission}/decline-cancellation', [CommissionController::class, 'declineCancellation'])
        ->name('commissions.decline-cancellation');

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

    // Watermarked proof preview and gated original download
    Route::get('commissions/{commission}/proof/{media}', [CommissionDeliveryController::class, 'proof'])
        ->name('commissions.proof');
    Route::get('commissions/{commission}/download-original/{media}', [CommissionDeliveryController::class, 'downloadOriginal'])
        ->name('commissions.download-original');

    // Official printable documents: Invoice and License Certificate
    Route::get('commissions/{commission}/invoice', [CommissionDocumentController::class, 'invoice'])
        ->name('commissions.invoice');
    Route::get('commissions/{commission}/license', [CommissionDocumentController::class, 'license'])
        ->name('commissions.license');

    // Live Server-Sent Events (SSE) stream for commission room
    Route::get('commissions/{commission}/stream', [LiveStreamController::class, 'streamCommission'])
        ->name('commissions.stream');

    Route::apiResource('commissions', CommissionController::class)->except(['destroy']);
});
