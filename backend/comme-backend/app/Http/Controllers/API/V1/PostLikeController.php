<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\NotificationType;
use App\Http\Helpers\ApiResponseHelper;
use App\Models\Notification as InAppNotification;
use App\Models\Post;
use App\Models\PostLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostLikeController extends Controller
{
    public function toggleLike(Request $request, Post $post): JsonResponse
    {
        Gate::authorize('view', $post);

        $currentUser = $request->user();

        $existing = PostLike::where('post_id', $post->id)
            ->where('user_id', $currentUser->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $isLiked = false;
            $message = 'Post unliked successfully.';
        } else {
            PostLike::create([
                'post_id' => $post->id,
                'user_id' => $currentUser->id,
            ]);
            $isLiked = true;
            $message = 'Post liked successfully.';

            // Notify post author if not self-like
            if ($post->user_id !== $currentUser->id) {
                InAppNotification::create([
                    'user_id' => $post->user_id,
                    'actor_id' => $currentUser->id,
                    'type' => NotificationType::POST_LIKE,
                    'title' => 'New Like',
                    'message' => "{$currentUser->display_name} liked your post.",
                    'notifiable_type' => Post::class,
                    'notifiable_id' => $post->id,
                ]);
            }
        }

        $likesCount = PostLike::where('post_id', $post->id)->count();

        return ApiResponseHelper::successResponse(
            [
                'is_liked' => $isLiked,
                'likes_count' => $likesCount,
            ],
            $message
        );
    }
}
