<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Resources\API\V1\PostResource;
use App\Models\Post;
use App\Http\Requests\API\V1\Post\StorePostRequest;
use App\Http\Requests\API\V1\Post\UpdatePostRequest;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', Post::class);

        $posts = Post::with(['user', 'portfolio'])->paginate(20);

        return ApiResponseHelper::successResponse(
            PostResource::collection($posts),
            'Posts retrieved successfully.',
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        $post = Post::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return ApiResponseHelper::successResponse(
            new PostResource($post),
            'Post created successfully.',
            Response::HTTP_CREATED,
        );
    }

    /**
     * PostPolicy::view() checks visibility (public / followers / private)
     * or ownership, same idea as Portfolio's view check.
     */
    public function show(Post $post): JsonResponse
    {
        Gate::authorize('view', $post);

        return ApiResponseHelper::successResponse(
            new PostResource($post->load(['user', 'portfolio', 'media', 'tags'])),
            'Post retrieved successfully.',
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $post->update($request->validated());

        return ApiResponseHelper::successResponse(
            new PostResource($post),
            'Post retrieved successfully.',
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post): JsonResponse
    {
        Gate::authorize('delete', $post);

        $post->delete();

        return ApiResponseHelper::successResponse(message: 'Post deleted successfully.');
    }
}
