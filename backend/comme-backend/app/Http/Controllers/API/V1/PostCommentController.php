<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Requests\API\V1\PostComment\StorePostCommentRequest;
use App\Http\Requests\API\V1\PostComment\UpdatePostCommentRequest;
use App\Http\Resources\API\V1\PostCommentResource;
use App\Models\Post;
use App\Models\PostComment;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class PostCommentController extends Controller
{
    /**
     * "Anyone who can view the post can view its comments" — so this
     * checks the *post's* view ability, not a separate comment ability.
     * Only top-level comments are loaded directly; replies come nested
     * via the eager-loaded 'replies' relation.
     */
    public function index(Post $post): JsonResponse
    {
        Gate::authorize('view', $post);

        $allComments = $post->comments()
            ->with(['user', 'likes', 'bookmarks'])
            ->oldest()
            ->get();

        $commentsById = [];
        $rootComments = collect();

        foreach ($allComments as $c) {
            $c->setRelation('replies', collect());
            $commentsById[$c->id] = $c;
        }

        foreach ($allComments as $c) {
            if ($c->parent_comment_id && isset($commentsById[$c->parent_comment_id])) {
                $commentsById[$c->parent_comment_id]->replies->push($c);
            } else if (!$c->parent_comment_id) {
                $rootComments->push($c);
            }
        }

        $sortedRoot = $rootComments->sortByDesc('created_at')->values();

        return ApiResponseHelper::successResponse(
            PostCommentResource::collection($sortedRoot),
            'Comments retrieved successfully.',
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostCommentRequest $request , Post $post): JsonResponse
    {
        $comment = $post->comments()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return ApiResponseHelper::successResponse(
            new PostCommentResource($comment->load(['user', 'replies.user'])),
            'Comment created successfully.',
            Response::HTTP_CREATED,
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(PostComment $comment): JsonResponse
    {
        Gate::authorize('view', $comment);

        return ApiResponseHelper::successResponse(
            new PostCommentResource($comment->load(['user', 'replies.user'])),
            'Comment retrieved successfully.',
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostCommentRequest $request, PostComment $comment): JsonResponse
    {
        $comment->update($request->validated());

        return ApiResponseHelper::successResponse(
            new PostCommentResource($comment->load(['user', 'replies.user'])),
            'Comment updated successfully.',
        );
    }

    /**
     * PostComment uses SoftDeletes, so this ->delete() call sets
     * deleted_at rather than actually removing the row — nothing extra
     * needed here, the model trait handles it.
     */
    public function destroy(PostComment $comment): JsonResponse
    {
        Gate::authorize('delete', $comment);

        $comment->delete();

        return ApiResponseHelper::successResponse(message: 'Comment deleted successfully.');
    }

    /**
     * Toggle like on a comment
     */
    public function toggleLike(PostComment $comment, \Illuminate\Http\Request $request): JsonResponse
    {
        $user = $request->user();
        $existing = \App\Models\PostCommentLike::where('post_comment_id', $comment->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            \App\Models\PostCommentLike::create([
                'post_comment_id' => $comment->id,
                'user_id' => $user->id,
            ]);
            $liked = true;
        }

        $likesCount = $comment->likes()->count();

        return ApiResponseHelper::successResponse([
            'liked' => $liked,
            'is_liked' => $liked,
            'likes_count' => $likesCount,
        ], $liked ? 'Comment liked.' : 'Comment unliked.');
    }

    /**
     * Toggle bookmark on a comment
     */
    public function toggleBookmark(PostComment $comment, \Illuminate\Http\Request $request): JsonResponse
    {
        $user = $request->user();
        $existing = \App\Models\PostCommentBookmark::where('post_comment_id', $comment->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $bookmarked = false;
        } else {
            \App\Models\PostCommentBookmark::create([
                'post_comment_id' => $comment->id,
                'user_id' => $user->id,
            ]);
            $bookmarked = true;
        }

        $bookmarksCount = $comment->bookmarks()->count();

        return ApiResponseHelper::successResponse([
            'bookmarked' => $bookmarked,
            'is_bookmarked' => $bookmarked,
            'bookmarks_count' => $bookmarksCount,
        ], $bookmarked ? 'Comment saved to bookmarks.' : 'Comment removed from bookmarks.');
    }
}
