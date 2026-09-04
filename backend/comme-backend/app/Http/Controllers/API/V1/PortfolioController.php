<?php

namespace App\Http\Controllers\API\V1;

use App\Models\Portfolio;
use App\Models\PortfolioMedia;
use App\Http\Requests\API\V1\Portfolio\StorePortfolioRequest;
use App\Http\Requests\API\V1\Portfolio\UpdatePortfolioRequest;
use App\Http\Resources\API\V1\PortfolioResource;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Portfolio::class);

        $user = $request->user();
        $isStaff = $user && ($user->isStaff() || $user->isAdmin());

        $query = Portfolio::with(['artistProfile.user', 'thumbnailMedia', 'media', 'tags']);

        // 1. Exclude taken-down portfolios and suspended artists from public views (except staff or artist owner)
        if (! $isStaff) {
            if ($user) {
                $query->where(function ($q) use ($user) {
                    $q->where('is_taken_down', false)
                      ->orWhereHas('artistProfile', fn ($aq) => $aq->where('user_id', $user->id));
                })
                ->whereHas('artistProfile.user', function ($uq) use ($user) {
                    $uq->whereNull('suspended_at')->orWhere('id', $user->id);
                });
            } else {
                $query->where('is_taken_down', false)
                    ->whereHas('artistProfile.user', function ($uq) {
                        $uq->whereNull('suspended_at');
                    });
            }
        }

        if ($request->filled('tag')) {
            $tagInput = trim(str_replace('#', '', $request->tag));
            $tagSlug = \Illuminate\Support\Str::slug($tagInput);

            $query->whereHas('tags', function ($q) use ($tagInput, $tagSlug) {
                $q->where('slug', $tagSlug)
                    ->orWhere('name', 'ILIKE', "%{$tagInput}%")
                    ->orWhere('slug', 'ILIKE', "%{$tagSlug}%");
            });
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%")
                    ->orWhereHas('tags', function ($tq) use ($search) {
                        $tq->where('name', 'ILIKE', "%{$search}%");
                    });
            });
        }

        $isArtistOwner = false;
        if ($request->has('artist_profile_id')) {
            $query->where('artist_profile_id', $request->artist_profile_id);
            if ($user && $user->artistProfile && (int) $request->artist_profile_id === (int) $user->artistProfile->id) {
                $isArtistOwner = true;
            }
        } elseif ($request->user()?->artistProfile) {
            $query->where('artist_profile_id', $request->user()->artistProfile->id);
            $isArtistOwner = true;
        }

        // Hide private artworks unless viewed by artist owner or staff
        if (! $isStaff && ! $isArtistOwner) {
            $query->where('visibility', \App\Enum\CommissionVisibility::PUBLIC);
        }

        // Sorting / Sort Order
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'oldest':
                $query->oldest();
                break;
            case 'title_asc':
            case 'alphabetical':
                $query->orderBy('title', 'asc');
                break;
            case 'title_desc':
                $query->orderBy('title', 'desc');
                break;
            case 'starred':
                $query->orderByDesc('starred')->latest();
                break;
            case 'latest':
            default:
                $query->latest();
                break;
        }

        $portfolios = $query->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            PortfolioResource::collection($portfolios),
            'Portfolios retrieved successfully.',
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePortfolioRequest $request): JsonResponse
    {
        $portfolio = Portfolio::create([
            ...$request->safe()->except(['media', 'starred', 'post_as_artwork']),
            'starred' => $request->boolean('starred', false),
            'artist_profile_id' => $request->user()->artistProfile->id,
        ]);

        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $index => $file) {
                $path = $file->store('portfolios/media', 'public');
                $mime = $file->getClientMimeType();
                $mediaType = str_starts_with($mime, 'video/') ? \App\Enum\MediaType::VIDEO : \App\Enum\MediaType::IMAGE;

                // Auto-faststart if mp4
                if ($mediaType === \App\Enum\MediaType::VIDEO && strtolower($file->getClientOriginalExtension()) === 'mp4') {
                    $fullDiskPath = Storage::disk('public')->path($path);
                    $scriptPath = base_path('storage/mp4-faststart.cjs');
                    if (file_exists($scriptPath) && file_exists($fullDiskPath)) {
                        @exec('node ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($fullDiskPath) . ' 2>&1');
                        clearstatcache(true, $fullDiskPath);
                    }
                }

                PortfolioMedia::create([
                    'portfolio_id' => $portfolio->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'media_type' => $mediaType,
                    'mime_type' => $mime,
                    'sort_order' => $index,
                    'alt_text' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'is_thumbnail' => $index === 0,
                ]);
            }
        }

        // When "post as an artwork" is enabled, also publish as a Post on community feed
        if ($request->boolean('post_as_artwork', false)) {
            $visibility = match ($request->input('post_visibility')) {
                'followers' => \App\Enum\PostVisibilityType::FOLLOWERS,
                'private' => \App\Enum\PostVisibilityType::PRIVATE,
                default => \App\Enum\PostVisibilityType::PUBLIC,
            };

            $post = \App\Models\Post::create([
                'user_id' => $request->user()->id,
                'portfolio_id' => $portfolio->id,
                'content' => $request->filled('post_content')
                    ? $request->input('post_content')
                    : ($portfolio->description ?: $portfolio->title),
                'visibility' => $visibility,
                'commentable' => $request->boolean('post_commentable', true),
            ]);

            // Sync tags if provided
            if ($request->has('post_tags')) {
                $tagNames = is_array($request->post_tags) ? $request->post_tags : explode(',', (string) $request->post_tags);
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
                if (!empty($tagIds)) {
                    $post->tags()->sync($tagIds);
                    $portfolio->tags()->sync($tagIds);
                }
            }
        }

        return ApiResponseHelper::successResponse(
            new PortfolioResource($portfolio->load(['artistProfile.user', 'thumbnailMedia', 'media', 'tags'])),
            'Portfolio created successfully.',
            Response::HTTP_CREATED,
        );
    }

    /**
     * PortfolioPolicy::view() checks visibility (public/private/restricted/
     * enlisted) or ownership — a request for someone else's private piece
     * fails here with a 403 before any data is returned.
     */
    public function show(Portfolio $portfolio): JsonResponse
    {
        Gate::authorize('view', $portfolio);

        return ApiResponseHelper::successResponse(
            new PortfolioResource($portfolio->load(['artistProfile.user', 'thumbnailMedia', 'media', 'tags'])),
            'Portfolio retrieved successfully.'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePortfolioRequest $request, Portfolio $portfolio): JsonResponse
    {
        $validated = $request->safe()->except(['media', 'tags', 'delete_media_ids']);

        if ($portfolio->is_taken_down && isset($validated['visibility']) && $validated['visibility'] !== \App\Enum\CommissionVisibility::PRIVATE->value) {
            if (! $request->user()?->isStaff()) {
                return ApiResponseHelper::errorResponse(
                    'This artwork has been taken down by moderators for a policy violation and cannot be made public. Please open a support ticket to submit an appeal.',
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }
        }

        $portfolio->update($validated);

        // Handle deleting specific existing media files
        if ($request->filled('delete_media_ids')) {
            $deleteIds = is_array($request->delete_media_ids)
                ? $request->delete_media_ids
                : explode(',', (string) $request->delete_media_ids);
            
            $mediasToDelete = $portfolio->media()->whereIn('id', $deleteIds)->get();
            foreach ($mediasToDelete as $m) {
                if ($m->file_path && Storage::disk('public')->exists($m->file_path)) {
                    Storage::disk('public')->delete($m->file_path);
                }
                $m->delete();
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
            $portfolio->tags()->sync($tagIds);

            // Also sync companion post tags if exists
            $companionPost = \App\Models\Post::where('portfolio_id', $portfolio->id)->first();
            if ($companionPost) {
                $companionPost->tags()->sync($tagIds);
                if (isset($validated['title']) || isset($validated['description'])) {
                    $companionPost->update([
                        'content' => $portfolio->description ?: $portfolio->title,
                    ]);
                }
            }
        }

        // Upload additional/new media files
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $index => $file) {
                $path = $file->store('portfolios/media', 'public');
                $mime = $file->getClientMimeType();
                $mediaType = str_starts_with($mime, 'video/') ? \App\Enum\MediaType::VIDEO : \App\Enum\MediaType::IMAGE;

                // Auto-faststart if mp4
                if ($mediaType === \App\Enum\MediaType::VIDEO && strtolower($file->getClientOriginalExtension()) === 'mp4') {
                    $fullDiskPath = Storage::disk('public')->path($path);
                    $scriptPath = base_path('storage/mp4-faststart.cjs');
                    if (file_exists($scriptPath) && file_exists($fullDiskPath)) {
                        @exec('node ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($fullDiskPath) . ' 2>&1');
                        clearstatcache(true, $fullDiskPath);
                    }
                }

                PortfolioMedia::create([
                    'portfolio_id' => $portfolio->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'media_type' => $mediaType,
                    'mime_type' => $mime,
                    'sort_order' => $portfolio->media()->count() + $index,
                    'alt_text' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'is_thumbnail' => $portfolio->media()->where('is_thumbnail', true)->doesntExist() && $index === 0,
                ]);
            }
        }

        // Ensure at least one media is thumbnail if media exist
        if ($portfolio->media()->exists() && ! $portfolio->media()->where('is_thumbnail', true)->exists()) {
            $first = $portfolio->media()->orderBy('sort_order')->first();
            if ($first) {
                $first->update(['is_thumbnail' => true]);
            }
        }

        // Notify moderation on ticket thread if this portfolio has active reports/tickets
        $actor = $request->user();
        if ($actor) {
            \App\Services\ModerationSyncService::handleContentUpdated($portfolio, $actor);
        }

        return ApiResponseHelper::successResponse(
            new PortfolioResource($portfolio->load(['artistProfile.user', 'thumbnailMedia', 'media', 'tags'])),
            'Portfolio updated successfully.',
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Portfolio $portfolio): JsonResponse
    {
        Gate::authorize('delete', $portfolio);

        $actor = request()->user() ?? $portfolio->artistProfile?->user;
        if ($actor) {
            \App\Services\ModerationSyncService::handleContentDeleted($portfolio, $actor);
        }

        // If this portfolio has a companion post, delete and sync it too
        $companionPost = \App\Models\Post::where('portfolio_id', $portfolio->id)->first();
        if ($companionPost) {
            if ($actor) {
                \App\Services\ModerationSyncService::handleContentDeleted($companionPost, $actor);
            }
            $companionPost->delete();
        }

        $portfolio->delete();

        return ApiResponseHelper::successResponse(message: 'Portfolio deleted successfully.');
    }
}
