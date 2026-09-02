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
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class CommissionServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', CommissionService::class);

        $commissionServices = CommissionService::with(['artistProfile.user', 'thumbnailMedia', 'media', 'options.addons', 'tags'])->paginate(20);

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

        return ApiResponseHelper::successResponse(
            new CommissionServiceResource($commissionService->load(['artistProfile', 'thumbnailMedia', 'media', 'options.addons', 'tags'])),
            'Commission service updated successfully.',
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CommissionService $commissionService): JsonResponse
    {
        Gate::authorize('delete', $commissionService);

        $commissionService->delete();

        return ApiResponseHelper::successResponse(message: 'Commission service deleted successfully.');
    }
}
