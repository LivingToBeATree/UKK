<?php

namespace App\Http\Controllers\API\V1;

use App\Models\ArtistProfile;
use App\Http\Requests\API\V1\ArtistProfile\StoreArtistProfileRequest;
use App\Http\Requests\API\V1\ArtistProfile\UpdateArtistProfileRequest;
use App\Http\Resources\API\V1\ArtistProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ArtistProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        Gate::authorize("viewAny", ArtistProfile::class);

        $artistProfiles = ArtistProfile::with('user')->paginate(20);

        return response()->json(ArtistProfileResource::collection($artistProfiles));
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

        return response()->json(new ArtistProfileResource($artistProfile), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ArtistProfile $artistProfile): JsonResponse
    {
        Gate::authorize('view', $artistProfile);

        return response()->json(new ArtistProfileResource($artistProfile->load('user')));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateArtistProfileRequest $request, ArtistProfile $artistProfile): JsonResponse
    {
        $artistProfile->update($request->validated());

        return response()->json(new ArtistProfileResource($artistProfile));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ArtistProfile $artistProfile): JsonResponse
    {
        Gate::authorize('delete', $artistProfile);

        $artistProfile->delete();

        return response()->json(null, 204);
    }
}
