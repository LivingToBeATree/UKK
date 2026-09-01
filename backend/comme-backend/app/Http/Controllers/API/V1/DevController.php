<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\UserRole;
use App\Http\Helpers\ApiResponseHelper;
use App\Http\Resources\API\V1\UserResource;
use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class DevController extends Controller
{
    /**
     * Ensure this controller only responds in local/debug/dev environments.
     */
    protected function checkEnvironment(): void
    {
        if (! app()->environment('local', 'testing') && ! config('app.debug')) {
            abort(Response::HTTP_FORBIDDEN, 'Dev tools are only available in local/debug mode.');
        }
    }

    /**
     * List all database users for 1-click dev switching.
     */
    public function listUsers(): JsonResponse
    {
        $this->checkEnvironment();

        $users = User::with('artistProfile')->latest()->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'username' => $u->username,
                'display_name' => $u->display_name,
                'email' => $u->email,
                'role' => $u->role->value,
                'avatar' => $u->avatar,
                'has_artist_profile' => (bool) $u->artistProfile,
            ];
        });

        return ApiResponseHelper::successResponse(
            $users,
            'Database users retrieved successfully.'
        );
    }

    /**
     * 1-Click Dev Switch to Persona / User without requiring password authentication.
     * Auto-creates the user if they don't exist yet.
     */
    public function switchPersona(Request $request): JsonResponse
    {
        $this->checkEnvironment();

        $userId = $request->input('user_id');
        $email = $request->input('email');
        $role = $request->input('role');
        $name = $request->input('name') ?? $request->input('display_name');
        $username = $request->input('username');

        $user = null;

        if ($userId) {
            $user = User::find($userId);
        } elseif ($email) {
            $user = User::where('email', $email)->first();
        }

        if (! $user && $email) {
            $roleEnum = match (strtolower((string) $role)) {
                'admin' => UserRole::ADMIN,
                'moderator' => UserRole::MODERATOR,
                default => UserRole::USER,
            };

            $generatedUsername = $username ?: explode('@', (string) $email)[0];
            $baseUsername = preg_replace('/[^a-zA-Z0-9_]/', '_', $generatedUsername);
            $finalUsername = $baseUsername;
            $counter = 1;
            while (User::where('username', $finalUsername)->exists()) {
                $finalUsername = "{$baseUsername}_{$counter}";
                $counter++;
            }

            $user = User::create([
                'email' => $email,
                'username' => $finalUsername,
                'display_name' => $name ?: ucfirst(str_replace('_', ' ', $finalUsername)),
                'password' => Hash::make('password'),
                'role' => $roleEnum,
                'email_verified_at' => now(),
            ]);

            if (strtolower((string) $role) === 'artist' || strtolower((string) $email) === 'artist@comme.test') {
                ArtistProfile::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'bio' => 'Verified digital creator with listed services, portfolio, and active commission slots.',
                        'commission_open' => true,
                    ]
                );
            }
        }

        if (! $user) {
            return ApiResponseHelper::errorResponse('User not found and could not be provisioned.', Response::HTTP_NOT_FOUND);
        }

        // Login as the user
        Auth::guard('web')->login($user, true);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $user->load('artistProfile');

        return ApiResponseHelper::successResponse(
            new UserResource($user),
            "Switched to persona {$user->email} ({$user->display_name}) successfully."
        );
    }
}
