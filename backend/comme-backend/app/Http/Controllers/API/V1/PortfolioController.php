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

        $query = Portfolio::with(['artistProfile', 'thumbnailMedia', 'media', 'tags'])->latest();

        if ($request->has('artist_profile_id')) {
            $query->where('artist_profile_id', $request->artist_profile_id);
        } elseif ($request->user()?->artistProfile) {
            $query->where('artist_profile_id', $request->user()->artistProfile->id);
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
            new PortfolioResource($portfolio->load(['artistProfile', 'thumbnailMedia', 'media', 'tags'])),
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
            new PortfolioResource($portfolio->load(['artistProfile', 'thumbnailMedia', 'media', 'tags'])),
            'Portfolio retrieved successfully.'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePortfolioRequest $request, Portfolio $portfolio): JsonResponse
    {
        $portfolio->update($request->safe()->except(['media']));

        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $index => $file) {
                $path = $file->store('portfolios/media', 'public');
                $mime = $file->getClientMimeType();
                $mediaType = str_starts_with($mime, 'video/') ? \App\Enum\MediaType::VIDEO : \App\Enum\MediaType::IMAGE;

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

        return ApiResponseHelper::successResponse(
            new PortfolioResource($portfolio->load(['artistProfile', 'thumbnailMedia', 'media', 'tags'])),
            'Portfolio updated successfully.',
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Portfolio $portfolio): JsonResponse
    {
        Gate::authorize('delete', $portfolio);

        $portfolio->delete();

        return ApiResponseHelper::successResponse(message: 'Portfolio deleted successfully.');
    }
}
