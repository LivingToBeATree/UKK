<?php

namespace App\Http\Controllers\API\V1;

use App\Models\ArtistProfile;
use App\Http\Requests\API\V1\ArtistProfile\StoreArtistProfileRequest;
use App\Http\Requests\API\V1\ArtistProfile\UpdateArtistProfileRequest;
use App\Http\Resources\API\V1\ArtistProfileResource;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class ArtistProfileController extends Controller
{
    /**
     * Display a listing of the resource with search, tag, and sort order support.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize("viewAny", ArtistProfile::class);

        $query = ArtistProfile::with(['user', 'services', 'portfolios.thumbnailMedia']);

        // Exclude suspended users
        $query->whereHas('user', function ($uq) {
            $uq->whereNull('suspended_at');
        });

        // Search query across artist username, display_name, bio, location, skills
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('bio', 'ILIKE', "%{$search}%")
                  ->orWhere('location', 'ILIKE', "%{$search}%")
                  ->orWhere('skills', 'ILIKE', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('username', 'ILIKE', "%{$search}%")
                        ->orWhere('display_name', 'ILIKE', "%{$search}%");
                  });
            });
        }

        // Tag / skill filter
        if ($request->filled('tag')) {
            $tag = trim(str_replace('#', '', $request->tag));
            $query->where(function ($q) use ($tag) {
                $q->where('skills', 'ILIKE', "%{$tag}%")
                  ->orWhere('bio', 'ILIKE', "%{$tag}%")
                  ->orWhereHas('services.tags', function ($tq) use ($tag) {
                      $tq->where('name', 'ILIKE', "%{$tag}%")
                         ->orWhere('slug', 'ILIKE', "%{$tag}%");
                  });
            });
        }

        // Sorting / Sort Order
        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'oldest':
                $query->oldest();
                break;
            case 'name_asc':
            case 'alphabetical':
                $query->join('users', 'artist_profiles.user_id', '=', 'users.id')
                      ->orderBy('users.display_name', 'asc')
                      ->select('artist_profiles.*');
                break;
            case 'name_desc':
                $query->join('users', 'artist_profiles.user_id', '=', 'users.id')
                      ->orderBy('users.display_name', 'desc')
                      ->select('artist_profiles.*');
                break;
            case 'reviews':
                $query->withCount('reviews')->orderByDesc('reviews_count');
                break;
            case 'rating':
                $query->withAvg('reviews', 'rating')->orderByDesc('reviews_avg_rating');
                break;
            case 'newest':
            case 'latest':
            default:
                $query->latest();
                break;
        }

        $artistProfiles = $query->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            ArtistProfileResource::collection($artistProfiles),
            'Artist profiles retrieved successfully.'
        );
    }

    /**
     * No Gate::authorize() call here — StoreArtistProfileRequest's own
     * authorize() method already ran and would have thrown a 403 before
     * this method body ever executes. One authorization check, not two.
     */
    public function store(StoreArtistProfileRequest $request): JsonResponse
    {
        $artistProfile = ArtistProfile::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return ApiResponseHelper::successResponse(
            new ArtistProfileResource($artistProfile->load('user')),
            'Artist profile created successfully.',
            Response::HTTP_CREATED,
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(ArtistProfile $artistProfile): JsonResponse
    {
        Gate::authorize('view', $artistProfile);

        return ApiResponseHelper::successResponse(
            new ArtistProfileResource($artistProfile->load('user')),
            'Artist profile retrieved successfully.',
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateArtistProfileRequest $request, ArtistProfile $artistProfile): JsonResponse
    {
        $artistProfile->update($request->validated());

        return ApiResponseHelper::successResponse(
            new ArtistProfileResource($artistProfile->load('user')),
            'Artist profile updated successfully.',
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ArtistProfile $artistProfile): JsonResponse
    {
        Gate::authorize('delete', $artistProfile);

        $artistProfile->delete();

        return ApiResponseHelper::successResponse(message: 'Artist profile deleted successfully.');
    }
}
