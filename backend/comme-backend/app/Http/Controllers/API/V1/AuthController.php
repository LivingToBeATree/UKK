<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\UserRole;
use App\Http\Requests\API\V1\User\Auth\LoginRequest;
use App\Http\Requests\API\V1\User\Auth\RegisterRequest;
use App\Http\Resources\API\V1\UserResource;
use App\Models\User;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
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

        return ApiResponseHelper::successResponse(
            new UserResource($user),
            'Registered successfully.',
            Response::HTTP_CREATED,
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            return ApiResponseHelper::errorResponse('Invalid credentials.', Response::HTTP_UNAUTHORIZED);
        }

        $request->session()->regenerate();

        return ApiResponseHelper::successResponse(new UserResource(Auth::user()), 'Logged in successfully.');
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
