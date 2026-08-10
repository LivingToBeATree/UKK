<?php

namespace App\Http\Controllers;

use App\Enum\UserRole;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'username' => $request->username,
            'display_name' => $request->display_name,
            'email' => $request->email,
            'password'=> $request->password,
            'role' => $request->role
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            return response()->json(['message'=> 'Invalid Credential'], 401);
        }

        $request->session()->regenerate();

        return response()->json(['user'=> Auth::user()]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerate();

        return response()->json(['message'=> 'Logged out']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user'=> $request->user()]);
    }
}