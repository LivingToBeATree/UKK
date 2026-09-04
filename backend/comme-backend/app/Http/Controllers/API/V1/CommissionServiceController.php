<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Resources\API\V1\CommissionServiceResource;
use App\Models\CommissionService;
use App\Models\CommissionServiceMedia;
use App\Enum\MediaType;
use App\Http\Requests\API\V1\CommissionService\StoreCommissionServiceRequest;
use App\Http\Requests\API\V1\CommissionService\UpdateCommissionServiceRequest;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class CommissionServiceController extends Controller
{
    /**
     * Display a listing of the resource with tag, search, artist, and status filtering.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', CommissionService::class);

        $query = CommissionService::with(['artistProfile.user', 'thumbnailMedia', 'media', 'options.addons', 'tags']);

        // 1. Tag filtering
        if ($request->filled('tag')) {
            $tagInput = trim(str_replace('#', '', $request->tag));
            $tagSlug = \Illuminate\Support\Str::slug($tagInput);

            $query->whereHas('tags', function ($q) use ($tagInput, $tagSlug) {
                $q->where('slug', $tagSlug)
                    ->orWhere('name', 'ILIKE', "%{$tagInput}%")
                    ->orWhere('slug', 'ILIKE', "%{$tagSlug}%");
            });
        }

        // 2. Search query across title, description, artist, and tags
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%")
                    ->orWhereHas('artistProfile.user', function ($uq) use ($search) {
                        $uq->where('username', 'ILIKE', "%{$search}%")
                            ->orWhere('display_name', 'ILIKE', "%{$search}%");
                    })
                    ->orWhereHas('tags', function ($tq) use ($search) {
                        $tq->where('name', 'ILIKE', "%{$search}%")
                            ->orWhere('slug', 'ILIKE', "%{$search}%");
                    });
            });
        }

        // 3. Artist filter
        if ($request->filled('artist_profile_id')) {
            $query->where('artist_profile_id', $request->artist_profile_id);
        }

        // 4. Status filter (open / closed)
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // 5. Price filtering
        if ($request->filled('min_price')) {
            $query->whereHas('options', function ($oq) use ($request) {
                $oq->where('base_price', '>=', (float) $request->min_price);
            });
        }
        if ($request->filled('max_price')) {
            $query->whereHas('options', function ($oq) use ($request) {
                $oq->where('base_price', '<=', (float) $request->max_price);
            });
        }

        // 6. Sorting / Sort Order
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'oldest':
                $query->oldest();
                break;
            case 'price_asc':
            case 'price_low':
                $query->withMin('options', 'base_price')
                    ->orderBy('options_min_base_price', 'asc');
                break;
            case 'price_desc':
            case 'price_high':
                $query->withMax('options', 'base_price')
                    ->orderBy('options_max_base_price', 'desc');
                break;
            case 'title_asc':
            case 'name_asc':
            case 'alphabetical':
            case 'az':
                $query->orderBy('name', 'asc');
                break;
            case 'title_desc':
            case 'name_desc':
            case 'za':
                $query->orderBy('name', 'desc');
                break;
            case 'latest':
            default:
                $query->latest();
                break;
        }

        $commissionServices = $query->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            CommissionServiceResource::collection($commissionServices),
            'Commission services retrieved successfully.',
        );
    }

    /**
     * Store a newly created commission service in storage.
     */
    public function store(StoreCommissionServiceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $optionsData = $validated['options'] ?? null;
        unset($validated['options'], $validated['media']);

        $commissionService = CommissionService::create([
            ...$validated,
            'artist_profile_id' => $request->user()->artistProfile->id,
        ]);

        // 1. Process showcase and reference media uploads
        if ($request->hasFile('media')) {
            $firstMediaId = null;
            foreach ($request->file('media') as $index => $file) {
                $path = $file->store('commission_services/media', 'public');
                $mime = $file->getClientMimeType();
                $mediaType = str_starts_with($mime, 'video/') ? MediaType::VIDEO : MediaType::IMAGE;

                $serviceMedia = CommissionServiceMedia::create([
                    'commission_service_id' => $commissionService->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'media_type' => $mediaType,
                    'mime_type' => $mime,
                    'sort_order' => $index,
                ]);

                if ($index === 0) {
                    $firstMediaId = $serviceMedia->id;
                }
            }

            if ($firstMediaId && empty($commissionService->thumbnail_media_id)) {
                $commissionService->update(['thumbnail_media_id' => $firstMediaId]);
            }
        }

        // 2. Process Service Packages/Options & Add-ons
        if (! empty($optionsData) && is_array($optionsData)) {
            foreach ($optionsData as $opt) {
                $option = $commissionService->options()->create([
                    'title' => $opt['title'] ?? 'Standard Package',
                    'description' => $opt['description'] ?? null,
                    'base_price' => $opt['base_price'] ?? 0,
                ]);

                if (! empty($opt['addons']) && is_array($opt['addons'])) {
                    foreach ($opt['addons'] as $addon) {
                        if (! empty($addon['title'])) {
                            $option->addons()->create([
                                'title' => $addon['title'],
                                'description' => $addon['description'] ?? null,
                                'additional_price' => $addon['additional_price'] ?? 0,
                            ]);
                        }
                    }
                }
            }
        }

        // 3. Process Tags
        if ($request->has('tags')) {
            $tagNames = is_array($request->tags) ? $request->tags : explode(',', (string) $request->tags);
            $tagIds = [];
            foreach ($tagNames as $name) {
                $cleanName = trim(str_replace('#', '', (string) $name));
                if (! empty($cleanName)) {
                    $tag = \App\Models\Tag::firstOrCreate(
                        ['name' => $cleanName],
                        ['slug' => \Illuminate\Support\Str::slug($cleanName)]
                    );
                    $tagIds[] = $tag->id;
                }
            }
            $commissionService->tags()->sync($tagIds);
        }

        return ApiResponseHelper::successResponse(
            new CommissionServiceResource($commissionService->load(['artistProfile', 'thumbnailMedia', 'media', 'options.addons', 'tags'])),
            'Commission service created successfully.',
            Response::HTTP_CREATED,
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(CommissionService $commissionService): JsonResponse
    {
        Gate::authorize('view', $commissionService);

        return ApiResponseHelper::successResponse(
            new CommissionServiceResource(
                $commissionService->load(['artistProfile.user', 'thumbnailMedia', 'media', 'options.addons', 'tags'])
            ),
            'Commission service retrieved successfully.'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommissionServiceRequest $request, CommissionService $commissionService): JsonResponse
    {
        $validated = $request->validated();
        $optionsData = $validated['options'] ?? null;
        unset($validated['options'], $validated['media']);

        $commissionService->update($validated);

        // Process new showcase/reference media uploads if provided
        if ($request->hasFile('media')) {
            $currentMaxOrder = $commissionService->media()->max('sort_order') ?? -1;
            foreach ($request->file('media') as $index => $file) {
                $path = $file->store('commission_services/media', 'public');
                $mime = $file->getClientMimeType();
                $mediaType = str_starts_with($mime, 'video/') ? MediaType::VIDEO : MediaType::IMAGE;

                $serviceMedia = CommissionServiceMedia::create([
                    'commission_service_id' => $commissionService->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'media_type' => $mediaType,
                    'mime_type' => $mime,
                    'sort_order' => $currentMaxOrder + 1 + $index,
                ]);

                if (empty($commissionService->thumbnail_media_id)) {
                    $commissionService->update(['thumbnail_media_id' => $serviceMedia->id]);
                }
            }
        }

        // Sync options & addons if provided
        if ($optionsData !== null && is_array($optionsData)) {
            $commissionService->options()->delete();
            foreach ($optionsData as $opt) {
                $option = $commissionService->options()->create([
                    'title' => $opt['title'] ?? 'Standard Package',
                    'description' => $opt['description'] ?? null,
                    'base_price' => $opt['base_price'] ?? 0,
                ]);

                if (! empty($opt['addons']) && is_array($opt['addons'])) {
                    foreach ($opt['addons'] as $addon) {
                        if (! empty($addon['title'])) {
                            $option->addons()->create([
                                'title' => $addon['title'],
                                'description' => $addon['description'] ?? null,
                                'additional_price' => $addon['additional_price'] ?? 0,
                            ]);
                        }
                    }
                }
            }
        }

        // Sync tags if provided
        if ($request->has('tags')) {
            $tagNames = is_array($request->tags) ? $request->tags : explode(',', (string) $request->tags);
            $tagIds = [];
            foreach ($tagNames as $name) {
                $cleanName = trim(str_replace('#', '', (string) $name));
                if (! empty($cleanName)) {
                    $tag = \App\Models\Tag::firstOrCreate(
                        ['name' => $cleanName],
                        ['slug' => \Illuminate\Support\Str::slug($cleanName)]
                    );
                    $tagIds[] = $tag->id;
                }
            }
            $commissionService->tags()->sync($tagIds);
        }

        $actor = $request->user();
        if ($actor) {
            \App\Services\ModerationSyncService::handleContentUpdated($commissionService, $actor);
        }

        return ApiResponseHelper::successResponse(
            new CommissionServiceResource($commissionService->load(['artistProfile', 'thumbnailMedia', 'media', 'options.addons', 'tags'])),
            'Commission service updated successfully.'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CommissionService $commissionService): JsonResponse
    {
        Gate::authorize('delete', $commissionService);

        $actor = request()->user() ?? $commissionService->artistProfile?->user;
        if ($actor) {
            \App\Services\ModerationSyncService::handleContentDeleted($commissionService, $actor);
        }

        $commissionService->delete();

        return ApiResponseHelper::successResponse(message: 'Commission service deleted successfully.');
    }
}
