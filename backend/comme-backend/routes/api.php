<?php

use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\EmailVerificationController;
use App\Http\Controllers\API\V1\PasswordResetController;
use App\Http\Controllers\API\V1\PaymentController;
use App\Http\Controllers\API\V1\TwoFactorAuthController;
use App\Http\Controllers\API\V1\UserController;
use Illuminate\Support\Facades\Route;

// Public auth endpoints
Route::post('/register', [AuthController::class, 'initiateRegister'])->middleware('throttle:register');
Route::post('/register/confirm', [AuthController::class, 'confirmRegistration'])->middleware('throttle:register-confirm');
Route::post('/register/resend', [AuthController::class, 'resendRegistrationCode'])->middleware('throttle:register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/login/2fa', [TwoFactorAuthController::class, 'loginWithTwoFactor'])->middleware('throttle:6,1');
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:6,1');
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:6,1');

// Public user profile lookup
Route::get('/users/{username}', [UserController::class, 'show']);

// Midtrans webhooks
Route::post('/midtrans/webhook', [PaymentController::class, 'webhook'])
    ->withoutMiddleware('throttle:api');
Route::post('/midtrans/iris-webhook', [PaymentController::class, 'irisWebhook'])
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
    Route::get('/profile/sessions', [UserController::class, 'getSessions']);
    Route::delete('/profile/sessions/{sessionId}', [UserController::class, 'revokeSession']);
    Route::delete('/account', [UserController::class, 'deleteAccount']);

    // Two-Factor Authentication Management
    Route::post('/profile/2fa/setup', [TwoFactorAuthController::class, 'setup']);
    Route::post('/profile/2fa/confirm', [TwoFactorAuthController::class, 'confirm']);
    Route::get('/profile/2fa/recovery-codes', [TwoFactorAuthController::class, 'getRecoveryCodes']);
    Route::post('/profile/2fa/recovery-codes', [TwoFactorAuthController::class, 'regenerateRecoveryCodes']);
    Route::delete('/profile/2fa', [TwoFactorAuthController::class, 'disable']);
});
