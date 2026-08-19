<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\ArtistApplicationStatus;
use App\Http\Helpers\ApiResponseHelper;
use App\Http\Requests\API\V1\ArtistApplication\RejectArtistApplicationRequest;
use App\Http\Requests\API\V1\ArtistApplication\StoreArtistApplicationRequest;
use App\Http\Resources\API\V1\ArtistApplicationResource;
use App\Http\Resources\API\V1\ArtistProfileResource;
use App\Models\ArtistApplication;
use App\Services\API\V1\ArtistApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class ArtistApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', ArtistApplication::class);

        $query = ArtistApplication::with(['user', 'reviewer'])->latest();

        if ($request->filled('status')) {
            $status = ArtistApplicationStatus::tryFrom($request->query('status'));
            if ($status) {
                $query->where('status', $status);
            }
        }

        $applications = $query->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            ArtistApplicationResource::collection($applications),
            'Artist applications retrieved successfully.'
        );
    }

    public function store(
        StoreArtistApplicationRequest $request,
        ArtistApplicationService $service,
    ): JsonResponse {
        $application = $service->submit($request->user(), $request->validated());

        return ApiResponseHelper::successResponse(
            new ArtistApplicationResource($application->load('user')),
            'Artist application submitted successfully.',
            Response::HTTP_CREATED,
        );
    }

    public function show(ArtistApplication $artistApplication): JsonResponse
    {
        Gate::authorize('view', $artistApplication);

        return ApiResponseHelper::successResponse(
            new ArtistApplicationResource($artistApplication->load(['user', 'reviewer'])),
            'Artist application retrieved successfully.'
        );
    }

    public function myApplication(Request $request): JsonResponse
    {
        $application = $request->user()
            ->latestArtistApplication()
            ->with(['user', 'reviewer'])
            ->first();

        if (! $application) {
            return ApiResponseHelper::successResponse(
                null,
                'No artist application found.'
            );
        }

        return ApiResponseHelper::successResponse(
            new ArtistApplicationResource($application),
            'Latest artist application retrieved successfully.'
        );
    }

    public function approve(
        Request $request,
        ArtistApplication $artistApplication,
        ArtistApplicationService $service,
    ): JsonResponse {
        Gate::authorize('approve', $artistApplication);

        $profile = $service->approve($artistApplication, $request->user());

        return ApiResponseHelper::successResponse(
            new ArtistProfileResource($profile->load('user')),
            'Artist application approved and profile created successfully.'
        );
    }

    public function reject(
        RejectArtistApplicationRequest $request,
        ArtistApplication $artistApplication,
        ArtistApplicationService $service,
    ): JsonResponse {
        Gate::authorize('reject', $artistApplication);

        $application = $service->reject(
            $artistApplication,
            $request->user(),
            $request->validated('rejection_reason'),
        );

        return ApiResponseHelper::successResponse(
            new ArtistApplicationResource($application->load(['user', 'reviewer'])),
            'Artist application rejected successfully.'
        );
    }
}
