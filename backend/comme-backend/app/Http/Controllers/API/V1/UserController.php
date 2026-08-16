<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Http\Requests\API\V1\User\Auth\ChangePasswordRequest;
use App\Http\Requests\API\V1\User\UpdateUserRequest;
use App\Http\Resources\API\V1\UserResource;
use App\Services\API\V1\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * No route-model-binding parameter at all — this only ever operates
     * on $request->user(), never an arbitrary user by ID. There's no
     * "edit someone else's profile" endpoint, so there's nothing to
     * authorize beyond just being logged in.
     */

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
        $request->user()->update([
            'password' => $request->password,
        ]);

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
