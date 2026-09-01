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

        return ApiResponseHelper::paginatedResponse(
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
            'content' => $request->content,
            'portfolio_id' => $request->portfolio_id,
            'visibility' => $request->visibility ?? \App\Enum\PostVisibilityType::PUBLIC,
            'commentable' => $request->boolean('commentable', true),
            'user_id' => $request->user()->id,
        ]);

        // Handle uploaded media files (Images, GIFs, Videos)
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $index => $file) {
                $path = $file->store('posts/media', 'public');
                $mime = $file->getClientMimeType();
                $mediaType = str_starts_with($mime, 'video/') ? \App\Enum\MediaType::VIDEO : \App\Enum\MediaType::IMAGE;

                \App\Models\PostMedia::create([
                    'post_id' => $post->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'media_type' => $mediaType,
                    'mime_type' => $mime,
                    'sort_order' => $index,
                    'alt_text' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                ]);
            }
        }

        // Handle tags
        if ($request->has('tags')) {
            $tagNames = is_array($request->tags) ? $request->tags : explode(',', $request->tags);
            $tagIds = [];
            foreach ($tagNames as $name) {
                $cleanName = trim(str_replace('#', '', (string) $name));
                if (!empty($cleanName)) {
                    $tag = \App\Models\Tag::firstOrCreate(
                        ['name' => $cleanName],
                        ['slug' => \Illuminate\Support\Str::slug($cleanName)]
                    );
                    $tagIds[] = $tag->id;
                }
            }
            $post->tags()->sync($tagIds);
        }

        return ApiResponseHelper::successResponse(
            new PostResource($post->load(['user', 'portfolio', 'media', 'tags'])),
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
            new PostResource($post->load(['user', 'portfolio', 'media', 'tags'])),
            'Post updated successfully.',
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
