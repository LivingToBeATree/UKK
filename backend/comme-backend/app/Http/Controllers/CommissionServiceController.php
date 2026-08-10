<?php

namespace App\Http\Controllers;

use App\Models\CommissionService;
use App\Http\Requests\StoreCommissionServiceRequest;
use App\Http\Requests\UpdateCommissionServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\facades\Gate;

class CommissionServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', CommissionService::class);

        $commissionServices = CommissionService::with('artistProfile')->paginate(20);

        return response()->json($commissionServices);
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

        return response()->json($commissionService, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CommissionService $commissionService): JsonResponse
    {
        Gate::authorize('view', $commissionService);

        return response()->json($commissionService->load(['artistProfile', 'options', 'tags']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommissionServiceRequest $request, CommissionService $commissionService): JsonResponse
    {
        $commissionService->update($request->validated());

        return response()->json($commissionService);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CommissionService $commissionService): JsonResponse
    {
        Gate::authorize('delete', $commissionService);

        $commissionService->delete();

        return response()->json(null, 204);
    }
}
