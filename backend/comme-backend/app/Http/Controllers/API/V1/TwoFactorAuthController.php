<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Http\Resources\API\V1\UserResource;
use App\Models\User;
use App\Services\API\V1\AuthService;
use App\Services\API\V1\TwoFactorAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class TwoFactorAuthController extends Controller
{
    /**
     * Start 2FA setup: Generates secret & standard otpauth QR code URL.
     */
    public function setup(Request $request, TwoFactorAuthService $service): JsonResponse
    {
        $user = $request->user();

        if ($user->hasTwoFactorEnabled()) {
            return ApiResponseHelper::errorResponse(
                'Two-factor authentication is already enabled on your account.',
                Response::HTTP_BAD_REQUEST
            );
        }

        $secret = $service->generateSecretKey();
        $user->two_factor_secret = $secret;
        $user->two_factor_confirmed_at = null;
        $user->save();

        return ApiResponseHelper::successResponse([
            'secret' => $secret,
            'qr_code_url' => $service->getQrCodeUrl($user, $secret),
        ], 'Two-factor setup initialized.');
    }

    /**
     * Confirm 2FA setup: Validates initial 6-digit code and creates 8 recovery codes.
     */
    public function confirm(Request $request, TwoFactorAuthService $service): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if (empty($user->two_factor_secret)) {
            return ApiResponseHelper::errorResponse(
                'Two-factor setup has not been initialized. Please start setup first.',
                Response::HTTP_BAD_REQUEST
            );
        }

        if (! $service->verifyKey($user->two_factor_secret, $request->code)) {
            return ApiResponseHelper::errorResponse(
                'Invalid 6-digit verification code. Ensure your device time is synchronized.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $recoveryCodes = $service->generateRecoveryCodes();
        $user->two_factor_recovery_codes = $recoveryCodes;
        $user->two_factor_confirmed_at = now();
        $user->save();

        return ApiResponseHelper::successResponse([
            'recovery_codes' => $recoveryCodes,
            'two_factor_enabled' => true,
        ], 'Two-factor authentication enabled successfully.');
    }

    /**
     * View existing recovery backup codes (requires current password).
     */
    public function getRecoveryCodes(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        if (! $user->hasTwoFactorEnabled()) {
            return ApiResponseHelper::errorResponse(
                'Two-factor authentication is not enabled on your account.',
                Response::HTTP_BAD_REQUEST
            );
        }

        return ApiResponseHelper::successResponse([
            'recovery_codes' => $user->two_factor_recovery_codes ?? [],
        ], 'Recovery codes retrieved.');
    }

    /**
     * Regenerate 8 new recovery backup codes (requires current password).
     */
    public function regenerateRecoveryCodes(Request $request, TwoFactorAuthService $service): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        if (! $user->hasTwoFactorEnabled()) {
            return ApiResponseHelper::errorResponse(
                'Two-factor authentication is not enabled on your account.',
                Response::HTTP_BAD_REQUEST
            );
        }

        $recoveryCodes = $service->generateRecoveryCodes();
        $user->two_factor_recovery_codes = $recoveryCodes;
        $user->save();

        return ApiResponseHelper::successResponse([
            'recovery_codes' => $recoveryCodes,
        ], 'Recovery codes regenerated successfully.');
    }

    /**
     * Disable 2FA (requires current password).
     */
    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        $user->two_factor_secret = null;
        $user->two_factor_recovery_codes = null;
        $user->two_factor_confirmed_at = null;
        $user->save();

        return ApiResponseHelper::successResponse(
            message: 'Two-factor authentication disabled successfully.'
        );
    }

    /**
     * Public challenge endpoint: Verify 2FA code during login.
     */
    public function loginWithTwoFactor(
        Request $request,
        TwoFactorAuthService $twoFactorService,
        AuthService $authService
    ): JsonResponse {
        $request->validate([
            'two_factor_token' => ['required', 'string'],
            'code' => ['required', 'string'],
        ]);

        $cached = Cache::get("2fa_challenge_{$request->two_factor_token}");

        if (! $cached || ! isset($cached['user_id'])) {
            return ApiResponseHelper::errorResponse(
                'Two-factor challenge expired or invalid. Please log in again.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $user = User::find($cached['user_id']);
        if (! $user || ! $user->hasTwoFactorEnabled()) {
            return ApiResponseHelper::errorResponse(
                'Invalid user account or two-factor is not enabled.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if ($user->isSuspended()) {
            Cache::forget("2fa_challenge_{$request->two_factor_token}");
            return ApiResponseHelper::errorResponse(
                '🚫 Account Suspended: Your account has been suspended due to violations of our Community Guidelines. If you believe this is a mistake, contact support.',
                Response::HTTP_FORBIDDEN
            );
        }

        $code = trim($request->code);
        $verified = false;

        if (strlen($code) === 6 && ctype_digit($code)) {
            // TOTP Code
            $verified = $twoFactorService->verifyKey($user->two_factor_secret, $code);
        } else {
            // Recovery Backup Code
            $verified = $twoFactorService->verifyAndConsumeRecoveryCode($user, $code);
        }

        if (! $verified) {
            return ApiResponseHelper::errorResponse(
                'The provided two-factor code or recovery code is invalid.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        // Challenge passed: Burn the challenge token & authenticate session
        Cache::forget("2fa_challenge_{$request->two_factor_token}");

        Auth::login($user, $cached['remember'] ?? false);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $authService->rememberDevice($user, $authService->hashDevice($user, $request), $request);

        return ApiResponseHelper::successResponse(
            new UserResource($user),
            'Signed in successfully with two-factor authentication.',
            Response::HTTP_OK
        );
    }
}
