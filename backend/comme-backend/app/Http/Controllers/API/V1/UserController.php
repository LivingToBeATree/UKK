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
}
