<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Http\Requests\API\V1\User\Auth\ChangePasswordRequest;
use App\Http\Requests\API\V1\User\UpdateUserRequest;
use App\Http\Resources\API\V1\UserResource;
use App\Notifications\API\V1\User\Auth\PasswordChangedNotification;
use App\Models\User;
use App\Services\API\V1\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Public user profile lookup by username.
     */
    public function show(string $username): JsonResponse
    {
        $user = User::where('username', $username)
            ->with(['artistProfile'])
            ->withCount(['followers', 'following', 'posts'])
            ->firstOrFail();

        return ApiResponseHelper::successResponse(
            new UserResource($user),
            'User profile retrieved successfully.'
        );
    }

    public function update(UpdateUserRequest $request): JsonResponse
    {
        $request->user()->update($request->validated());

        return ApiResponseHelper::successResponse(
            new UserResource($request->user()),
            'Profile updated successfully.'
        );
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'password' => $request->password,
        ]);

        $user->notify(new PasswordChangedNotification(now(), $request->ip()));

        return ApiResponseHelper::successResponse(message: 'Password changed successfully.');
    }

    /**
     * Deletes every session row for this user except the current one —
     * this assumes SESSION_DRIVER=database (config/session.php), which is
     * very likely true given the users migration already created a
     * `sessions` table. Deleting the row is what actually kills a
     * session; the browser holding that cookie has no way to know it's
     * gone until its next request fails.
     *
     * Also clears known_devices down to just the current one — otherwise
     * they have a device listed as "known" with no actual live session
     * behind it, which is a confusing, inconsistent state to leave things in.
     */

    public function logoutOtherDevices(Request $request, AuthService $authService): JsonResponse
    {
        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        $currentDeviceHash = $authService->hashDevice($request->user(), $request);
        $authService->forgetOtherDevices($request->user(), $currentDeviceHash);

        return ApiResponseHelper::successResponse(message: 'Logged out from all other devices.');
    }

    /**
     * Returns all active database sessions for the authenticated user.
     */
    public function getSessions(Request $request): JsonResponse
    {
        $currentSessionId = $request->session()->getId();
        $sessions = DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('last_activity')
            ->get()
            ->map(function ($s) use ($currentSessionId) {
                return [
                    'id' => $s->id,
                    'ip_address' => $s->ip_address,
                    'user_agent' => $s->user_agent,
                    'last_activity' => date('Y-m-d H:i:s', $s->last_activity),
                    'is_current' => $s->id === $currentSessionId,
                ];
            });

        return ApiResponseHelper::successResponse($sessions, 'Active sessions retrieved.');
    }

    /**
     * Revoke a single active session by ID.
     */
    public function revokeSession(Request $request, string $sessionId): JsonResponse
    {
        $currentSessionId = $request->session()->getId();
        if ($sessionId === $currentSessionId) {
            return ApiResponseHelper::errorResponse('Cannot revoke your current active session here. Use sign out instead.', 400);
        }

        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', $sessionId)
            ->delete();

        return ApiResponseHelper::successResponse(message: 'Session revoked successfully.');
    }

    /**
     * Delete user account (Indonesian UU PDP compliance).
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Clear active sessions
        DB::table('sessions')->where('user_id', $user->id)->delete();

        // Delete user record
        $user->delete();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return ApiResponseHelper::successResponse(message: 'Account deleted successfully.');
    }
}
