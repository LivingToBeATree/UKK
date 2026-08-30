<?php

use App\Http\Controllers\API\V1\ArtistPayoutAccountController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('me/payout-account', [ArtistPayoutAccountController::class, 'show'])
        ->name('artist.payout-account.show');

    Route::put('me/payout-account', [ArtistPayoutAccountController::class, 'update'])
        ->name('artist.payout-account.update');

    Route::delete('me/payout-account', [ArtistPayoutAccountController::class, 'destroy'])
        ->name('artist.payout-account.destroy');
});
