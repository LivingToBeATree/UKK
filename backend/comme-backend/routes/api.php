<?php

use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\EmailVerificationController;
use App\Http\Controllers\API\V1\PasswordResetController;
use App\Http\Controllers\API\V1\PaymentController;
use App\Http\Controllers\API\V1\UserController;
use Illuminate\Support\Facades\Route;

// Public auth endpoints
Route::post('/register', [AuthController::class, 'initiateRegister'])->middleware('throttle:register');
Route::post('/register/confirm', [AuthController::class, 'confirmRegistration'])->middleware('throttle:register-confirm');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:6,1');
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:6,1');

// Public user profile lookup
Route::get('/users/{username}', [UserController::class, 'show']);

// Midtrans webhook
Route::post('/midtrans/webhook', [PaymentController::class, 'webhook'])
    ->withoutMiddleware('throttle:api');

// Every resource's routes live in its own file under routes/API/V1/
foreach (glob(__DIR__ . '/API/V1/*.php') as $resourceRoutes) {
    require $resourceRoutes;
}

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // 'signed' checks the URL's expiry+signature weren't tampered with;
    // 'verification.verify' is the exact route name AppServiceProvider's
    // VerifyEmail::createUrlUsing() targeted when building the emailed link.
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1');

    Route::patch('/profile', [UserController::class, 'update']);
    Route::put('/profile/password', [UserController::class, 'changePassword']);
    Route::post('/logout-other-devices', [UserController::class, 'logoutOtherDevices']);
});
