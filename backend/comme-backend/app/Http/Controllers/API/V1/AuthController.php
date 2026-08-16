<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\UserRole;
use App\Http\Requests\API\V1\User\Auth\LoginRequest;
use App\Http\Requests\API\V1\User\Auth\RegisterRequest;
use App\Http\Resources\API\V1\UserResource;
use App\Models\User;
use App\Services\API\V1\AuthService;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    /**
     * Laravel automatically supplies AuthService here via its service
     * container — no manual instantiation, no registration needed in a
     * provider. Any plain class with a simple constructor can just be
     * type-hinted like this on a controller method, same as the Form
     * Requests you're already used to.
     */
    public function register(RegisterRequest $request, AuthService $authService): JsonResponse
    {
        $user = User::create([
            'username' => $request->username,
            'display_name' => $request->display_name,
            'email' => $request->email,
            'password'=> $request->password,
            'role' => UserRole::USER,

        ]);

        event(new Registered($user));

        Auth::login($user);
        $request->session()->regenerate();

        $authService->rememberDevice($user, $authService->hashDevice($user, $request), $request);

        return ApiResponseHelper::successResponse(
            new UserResource($user),
            'Registered successfully.',
            Response::HTTP_CREATED,
        );
    }

    public function login(LoginRequest $request, AuthService $authService): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            return ApiResponseHelper::errorResponse('Invalid credentials.', Response::HTTP_UNAUTHORIZED);
        }

        $request->session()->regenerate();

        $user = Auth::user();
        $deviceHash = $authService->hashDevice($user, $request);
        $isNewDevice = ! $authService->isDeviceKnown($user, $deviceHash);

        $authService->rememberDevice($user, $deviceHash, $request);

        // $isNewDevice is available here to trigger a
        // "new device login" notification later — deliberately not built yet.

        return ApiResponseHelper::successResponse(new UserResource($user), 'Logged in successfully.');
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerate();

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
