<?php

namespace App\Http\Controllers;

use App\Models\ArtistProfile;
use App\Http\Requests\StoreArtistProfileRequest;
use App\Http\Requests\UpdateArtistProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\facades\Gate;

class ArtistProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        Gate::authorize("viewAny", ArtistProfile::class);

        $artistProfiles = ArtistProfile::with('user')->paginate(20);

        return response()->json($artistProfiles);
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

        return response()->json($artistProfile, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ArtistProfile $artistProfile): JsonResponse
    {
        Gate::authorize('view', $artistProfile);

        return response()->json($artistProfile->load('user'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateArtistProfileRequest $request, ArtistProfile $artistProfile): JsonResponse
    {
        $artistProfile->update($request->validated());

        return response()->json($artistProfile);
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
