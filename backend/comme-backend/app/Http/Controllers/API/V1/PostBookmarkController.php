<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Http\Resources\API\V1\PostResource;
use App\Models\Post;
use App\Models\PostBookmark;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostBookmarkController extends Controller
{
    public function toggleBookmark(Request $request, Post $post): JsonResponse
    {
        Gate::authorize('view', $post);

        $currentUser = $request->user();

        $existing = PostBookmark::where('post_id', $post->id)
            ->where('user_id', $currentUser->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $isBookmarked = false;
            $message = 'Post removed from bookmarks.';
        } else {
            PostBookmark::create([
                'post_id' => $post->id,
                'user_id' => $currentUser->id,
            ]);
            $isBookmarked = true;
            $message = 'Post bookmarked successfully.';
        }

        $bookmarksCount = PostBookmark::where('post_id', $post->id)->count();

        return ApiResponseHelper::successResponse(
            [
                'is_bookmarked' => $isBookmarked,
                'bookmarked' => $isBookmarked,
                'bookmarks_count' => $bookmarksCount,
            ],
            $message
        );
    }

    public function userBookmarks(Request $request): JsonResponse
    {
        $posts = Post::whereIn(
            'id',
            $request->user()->postBookmarks()->select('post_id')
        )->with(['user', 'portfolio', 'media', 'tags'])->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            PostResource::collection($posts),
            'Bookmarked posts retrieved successfully.'
        );
    }
}
