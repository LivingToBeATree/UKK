<?php

namespace App\Http\Controllers\API\V1;

use App\Models\Post;
use App\Http\Requests\API\V1\Post\StorePostRequest;
use App\Http\Requests\API\V1\Post\UpdatePostRequest;
use Illuminate\Http\JsonResponse;
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

        return response()->json($posts);
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

        return response()->json($post);
    }

    /**
     * PostPolicy::view() checks visibility (public / followers / private)
     * or ownership, same idea as Portfolio's view check.
     */
    public function show(Post $post): JsonResponse
    {
        Gate::authorize('view', $post);

        return response()->json($post->load(['user', 'portofolio', 'media', 'tags']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $post->update($request->validated());

        return response()->json($post);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post): JsonResponse
    {
        Gate::authorize('delete', $post);

        $post->delete();

        return response()->json(null, 204);
    }
}
