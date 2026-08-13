<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Resources\API\V1\CommissionServiceResource;
use App\Models\CommissionService;
use App\Http\Requests\API\V1\CommissionService\StoreCommissionServiceRequest;
use App\Http\Requests\API\V1\CommissionService\UpdateCommissionServiceRequest;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class CommissionServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', CommissionService::class);

        $commissionServices = CommissionService::with('artistProfile')->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            CommissionServiceResource::collection($commissionServices),
            'Commission services retrieved successfully.',
        );
    }

    /**
     * artist_profile_id is never taken from the request body — it's always
     * derived from the logged-in user's own profile, same reasoning as
     * user_id on ArtistProfileController::store(). The policy already
     * guarantees an artistProfile exists here, since create() requires it.
     */
    public function store(StoreCommissionServiceRequest $request): JsonResponse
    {
        $commissionService = CommissionService::create([
            ...$request->validated(),
            'artist_profile_id' => $request->user()->artistProfile->id,
        ]);

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
                $commissionService->load(['artistProfile', 'thumbnailMedia', 'media', 'options.addons', 'tags'])
            ),
            'Commission service retrieved successfully.'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommissionServiceRequest $request, CommissionService $commissionService): JsonResponse
    {
        $commissionService->update($request->validated());

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
