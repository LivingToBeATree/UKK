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

        $comments = $post->comments()
            ->whereNull('parent_comment_id')
            ->with(['user', 'replies.user'])
            ->latest()
            ->paginate(20);

        return ApiResponseHelper::successResponse(
            PostCommentResource::collection($comments),
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
            new PostCommentResource($comment),
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
            new PostCommentResource($comment),
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
}
