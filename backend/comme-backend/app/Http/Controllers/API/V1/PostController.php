<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Resources\API\V1\PostResource;
use App\Models\Post;
use App\Http\Requests\API\V1\Post\StorePostRequest;
use App\Http\Requests\API\V1\Post\UpdatePostRequest;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * Display a listing of the resource with tag, search, type, and user filtering.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Post::class);

        $user = $request->user();
        $isStaff = $user && ($user->isStaff() || $user->isAdmin());

        $query = Post::with(['user', 'portfolio.media', 'portfolio.thumbnailMedia', 'media', 'tags']);

        // 1. Exclude taken-down posts and posts from suspended authors (except for staff, or the post's own author)
        if (! $isStaff) {
            if ($user) {
                $query->where(function ($q) use ($user) {
                    $q->where(function ($sub) {
                        $sub->where('is_taken_down', false)
                            ->whereDoesntHave('portfolio', fn ($pq) => $pq->where('is_taken_down', true));
                    })->orWhere('user_id', $user->id);
                })
                ->whereHas('user', function ($uq) use ($user) {
                    $uq->whereNull('suspended_at')->orWhere('id', $user->id);
                });
            } else {
                $query->where('is_taken_down', false)
                    ->whereDoesntHave('portfolio', function ($pq) {
                        $pq->where('is_taken_down', true);
                    })
                    ->whereHas('user', function ($uq) {
                        $uq->whereNull('suspended_at');
                    });
            }
        }

        // 2. Tag filtering (by slug or name)
        if ($request->filled('tag')) {
            $tagInput = trim(str_replace('#', '', $request->tag));
            $tagSlug = \Illuminate\Support\Str::slug($tagInput);

            $query->whereHas('tags', function ($q) use ($tagInput, $tagSlug) {
                $q->where('slug', $tagSlug)
                    ->orWhere('name', 'ILIKE', "%{$tagInput}%")
                    ->orWhere('slug', 'ILIKE', "%{$tagSlug}%");
            });
        }

        // 3. Full-text search across content, author, and tags
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('content', 'ILIKE', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('username', 'ILIKE', "%{$search}%")
                            ->orWhere('display_name', 'ILIKE', "%{$search}%");
                    })
                    ->orWhereHas('tags', function ($tq) use ($search) {
                        $tq->where('name', 'ILIKE', "%{$search}%")
                            ->orWhere('slug', 'ILIKE', "%{$search}%");
                    });
            });
        }

        // 4. Type filtering: 'artwork' vs 'posts'
        if ($request->get('type') === 'artwork') {
            $query->where(function ($q) {
                $q->whereNotNull('portfolio_id')
                    ->orWhereHas('user.artistProfile');
            });
        } elseif ($request->get('type') === 'posts') {
            $query->whereNull('portfolio_id');
        }

        // 5. User filtering
        $isTargetOwner = false;
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
            if ($user && (int) $request->user_id === (int) $user->id) {
                $isTargetOwner = true;
            }
        } elseif ($request->filled('username')) {
            $query->whereHas('user', function ($uq) use ($request) {
                $uq->where('username', $request->username);
            });
            if ($user && $request->username === $user->username) {
                $isTargetOwner = true;
            }
        }

        // 6. Visibility scoping (hide private posts from public/unauthorized viewers, keep visible to author and followers)
        if (! $isStaff && ! $isTargetOwner) {
            $query->where(function ($q) use ($user) {
                $q->where('visibility', \App\Enum\PostVisibilityType::PUBLIC);
                if ($user) {
                    $q->orWhere('user_id', $user->id)
                        ->orWhere(function ($fq) use ($user) {
                            $fq->where('visibility', \App\Enum\PostVisibilityType::FOLLOWERS)
                                ->whereHas('user.followers', fn ($fl) => $fl->where('follower_id', $user->id));
                        });
                }
            });
        }

        // 7. Sort Order
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'title_asc':
            case 'name_asc':
            case 'alphabetical':
            case 'az':
            case 'content_asc':
                $query->orderBy('content', 'asc');
                break;
            case 'title_desc':
            case 'name_desc':
            case 'za':
            case 'content_desc':
                $query->orderBy('content', 'desc');
                break;
            case 'oldest':
                $query->oldest();
                break;
            case 'popular':
            case 'most_liked':
                $query->withCount('likes')->orderByDesc('likes_count')->latest();
                break;
            case 'comments':
            case 'most_commented':
                $query->withCount('comments')->orderByDesc('comments_count')->latest();
                break;
            case 'latest':
            default:
                $query->latest();
                break;
        }

        $posts = $query->paginate(20);

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
            'content' => $request->content ?? '',
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

                // Auto faststart MP4 videos for instant streaming
                if ($mediaType === \App\Enum\MediaType::VIDEO && strtolower($file->getClientOriginalExtension()) === 'mp4') {
                    $fullDiskPath = \Illuminate\Support\Facades\Storage::disk('public')->path($path);
                    $scriptPath = base_path('storage/mp4-faststart.cjs');
                    if (file_exists($scriptPath) && file_exists($fullDiskPath)) {
                        @exec('node ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($fullDiskPath) . ' 2>&1');
                        clearstatcache(true, $fullDiskPath);
                    }
                }

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
            new PostResource($post->load(['user', 'portfolio.media', 'portfolio.thumbnailMedia', 'media', 'tags'])),
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
            new PostResource($post->load(['user', 'portfolio.media', 'portfolio.thumbnailMedia', 'media', 'tags'])),
            'Post retrieved successfully.',
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $validated = $request->validated();

        if ($post->is_taken_down && isset($validated['visibility']) && $validated['visibility'] !== \App\Enum\PostVisibilityType::PRIVATE->value) {
            if (! $request->user()?->isStaff()) {
                return ApiResponseHelper::errorResponse(
                    'This post has been taken down by moderators for a policy violation and cannot be made public. Please open a support ticket to submit an appeal.',
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }
        }

        $post->update(\Illuminate\Support\Arr::except($validated, ['tags', 'media', 'delete_media_ids']));

        // Handle deleting specific existing post media files
        if ($request->filled('delete_media_ids')) {
            $deleteIds = is_array($request->delete_media_ids)
                ? $request->delete_media_ids
                : explode(',', (string) $request->delete_media_ids);

            $mediasToDelete = $post->media()->whereIn('id', $deleteIds)->get();
            foreach ($mediasToDelete as $m) {
                if ($m->file_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($m->file_path)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($m->file_path);
                }
                $m->delete();
            }
        }

        // Handle newly uploaded media files
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $index => $file) {
                $path = $file->store('posts/media', 'public');
                $mime = $file->getClientMimeType();
                $mediaType = str_starts_with($mime, 'video/') ? \App\Enum\MediaType::VIDEO : \App\Enum\MediaType::IMAGE;

                // Auto faststart MP4 videos for instant streaming
                if ($mediaType === \App\Enum\MediaType::VIDEO && strtolower($file->getClientOriginalExtension()) === 'mp4') {
                    $fullDiskPath = \Illuminate\Support\Facades\Storage::disk('public')->path($path);
                    $scriptPath = base_path('storage/mp4-faststart.cjs');
                    if (file_exists($scriptPath) && file_exists($fullDiskPath)) {
                        @exec('node ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($fullDiskPath) . ' 2>&1');
                        clearstatcache(true, $fullDiskPath);
                    }
                }

                \App\Models\PostMedia::create([
                    'post_id' => $post->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'media_type' => $mediaType,
                    'mime_type' => $mime,
                    'sort_order' => $post->media()->count() + $index,
                    'alt_text' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                ]);
            }
        }

        // Sync tags if provided
        if ($request->has('tags')) {
            $tagNames = is_array($request->tags) ? $request->tags : explode(',', (string) $request->tags);
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

        // Notify moderation on ticket thread if this post has active reports/tickets
        $actor = $request->user();
        if ($actor) {
            \App\Services\ModerationSyncService::handleContentUpdated($post, $actor);
        }

        return ApiResponseHelper::successResponse(
            new PostResource($post->load(['user', 'portfolio.media', 'portfolio.thumbnailMedia', 'media', 'tags'])),
            'Post updated successfully.',
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post): JsonResponse
    {
        Gate::authorize('delete', $post);

        $actor = request()->user() ?? $post->user;
        if ($actor) {
            \App\Services\ModerationSyncService::handleContentDeleted($post, $actor);
        }

        $post->delete();

        return ApiResponseHelper::successResponse(message: 'Post deleted successfully.');
    }
}
