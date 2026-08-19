<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\NotificationType;
use App\Http\Helpers\ApiResponseHelper;
use App\Http\Resources\API\V1\UserResource;
use App\Models\Follow;
use App\Models\Notification as InAppNotification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class FollowController extends Controller
{
    public function toggle(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        if ($currentUser->id === $user->id) {
            throw new UnprocessableEntityHttpException('You cannot follow yourself.');
        }

        $existing = Follow::where('follower_id', $currentUser->id)
            ->where('followed_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $isFollowing = false;
            $message = 'User unfollowed successfully.';
        } else {
            Follow::create([
                'follower_id' => $currentUser->id,
                'followed_id' => $user->id,
            ]);
            $isFollowing = true;
            $message = 'User followed successfully.';

            InAppNotification::create([
                'user_id' => $user->id,
                'actor_id' => $currentUser->id,
                'type' => NotificationType::FOLLOW,
                'title' => 'New Follower',
                'message' => "{$currentUser->display_name} started following you.",
                'notifiable_type' => User::class,
                'notifiable_id' => $currentUser->id,
            ]);
        }

        $followersCount = Follow::where('followed_id', $user->id)->count();

        return ApiResponseHelper::successResponse(
            [
                'is_following' => $isFollowing,
                'followers_count' => $followersCount,
            ],
            $message
        );
    }

    public function followers(User $user): JsonResponse
    {
        $followers = User::whereIn(
            'id',
            Follow::where('followed_id', $user->id)->select('follower_id')
        )->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            UserResource::collection($followers),
            'Followers retrieved successfully.'
        );
    }

    public function following(User $user): JsonResponse
    {
        $following = User::whereIn(
            'id',
            Follow::where('follower_id', $user->id)->select('followed_id')
        )->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            UserResource::collection($following),
            'Following list retrieved successfully.'
        );
    }
}
