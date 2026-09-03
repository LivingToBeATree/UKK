<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Http\Requests\API\V1\User\Auth\ConfirmRegistrationRequest;
use App\Http\Requests\API\V1\User\Auth\InitiateRegistrationRequest;
use App\Http\Requests\API\V1\User\Auth\LoginRequest;
use App\Http\Resources\API\V1\UserResource;
use App\Notifications\API\V1\User\Auth\NewDeviceLoginNotification;
use App\Services\API\V1\AuthService;
use App\Services\API\V1\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Laravel automatically supplies RegistrationService here via its service
     * container — no manual instantiation, no registration needed in a
     * provider. Any plain class with a simple constructor can just be
     * type-hinted like this on a controller method, same as the Form
     * Requests you're already used to.
     */
    public function initiateRegister(InitiateRegistrationRequest $request, RegistrationService $registrationService): JsonResponse
    {
        $registrationService->initiate($request->validated());

        return ApiResponseHelper::successResponse(
            message: 'Registration code sent. Confirm the code to create your account.',
            statusCode: Response::HTTP_ACCEPTED,
        );
    }

    public function resendRegistrationCode(Request $request, RegistrationService $registrationService): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $registrationService->resend($request->email);

        return ApiResponseHelper::successResponse(
            message: 'A new verification code has been sent to your email.',
            statusCode: Response::HTTP_OK,
        );
    }

    public function confirmRegistration(
        ConfirmRegistrationRequest $request,
        RegistrationService $registrationService,
        AuthService $authService,
    ): JsonResponse {
        $user = $registrationService->confirm($request->email, $request->code);

        if (! $user) {
            return ApiResponseHelper::errorResponse('Invalid or expired registration code.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        Auth::login($user);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $authService->rememberDevice($user, $authService->hashDevice($user, $request), $request);

        return ApiResponseHelper::successResponse(
            new UserResource($user),
            'Registered successfully.',
            Response::HTTP_CREATED,
        );
    }

    public function login(LoginRequest $request, AuthService $authService): JsonResponse
    {
        if (! Auth::guard('web')->attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            return ApiResponseHelper::errorResponse('Invalid credentials.', Response::HTTP_UNAUTHORIZED);
        }

        $user = Auth::guard('web')->user();

        if ($user->isSuspended()) {
            Auth::guard('web')->logout();
            return ApiResponseHelper::errorResponse(
                '🚫 Account Suspended: Your account has been suspended due to violations of our Community Guidelines. If you believe this is a mistake, contact support.',
                Response::HTTP_FORBIDDEN
            );
        }

        // If Two-Factor Authentication is enabled, require TOTP verification before issuing session
        if ($user->hasTwoFactorEnabled()) {
            Auth::guard('web')->logout();

            $challengeToken = Str::random(40);
            Cache::put("2fa_challenge_{$challengeToken}", [
                'user_id' => $user->id,
                'remember' => $request->boolean('remember'),
            ], now()->addMinutes(5));

            return ApiResponseHelper::successResponse([
                'requires_2fa' => true,
                'two_factor_token' => $challengeToken,
            ], 'Two-factor authentication code required.');
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $deviceHash = $authService->hashDevice($user, $request);
        $isNewDevice = ! $authService->isDeviceKnown($user, $deviceHash);

        $authService->rememberDevice($user, $deviceHash, $request);

        if ($isNewDevice) {
            $user->notify(new NewDeviceLoginNotification(
                ipAddress: $request->ip() ?? '127.0.0.1',
                userAgent: $request->userAgent() ?? 'Unknown Device',
                loginTime: now(),
            ));
        }

        return ApiResponseHelper::successResponse(new UserResource($user), 'Logged in successfully.');
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerate();
        }

        return ApiResponseHelper::successResponse(message: 'Logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        return ApiResponseHelper::successResponse(
            new UserResource($request->user()),
            'Current user retrieved successfully.'
        );
    }
}
