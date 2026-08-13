<?php

namespace App\Http\Controllers\API\V1;

use App\Models\Portfolio;
use App\Http\Requests\API\V1\Portfolio\StorePortfolioRequest;
use App\Http\Requests\API\V1\Portfolio\UpdatePortfolioRequest;
use App\Http\Resources\API\V1\PortfolioResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class PortfolioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', Portfolio::class);

        $portfolios = Portfolio::with(['artistProfile', 'thumbnailMedia'])->paginate(20);

        return response()->json(new PortfolioResource($portfolios));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePortfolioRequest $request): JsonResponse
    {
        $portfolio = Portfolio::create([
            ...$request->validated(),
            'artist_profile_id' => $request->user()->artistProfile->id,
        ]);

        return response()->json(new PortfolioResource($portfolio), 201);
    }

    /**
     * PortfolioPolicy::view() checks visibility (public/private/restricted/
     * enlisted) or ownership — a request for someone else's private piece
     * fails here with a 403 before any data is returned.
     */
    public function show(Portfolio $portfolio): JsonResponse
    {
        Gate::authorize('view', $portfolio);

        return response()->json(new PortfolioResource($portfolio->load(['artistProfile', 'thumbnailMedia', 'media', 'tags'])));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePortfolioRequest $request, Portfolio $portfolio): JsonResponse
    {
        $portfolio->update($request->validated());

        return response()->json(new PortfolioResource($portfolio));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Portfolio $portfolio): JsonResponse
    {
        Gate::authorize('delete', $portfolio);

        $portfolio->delete();

        return response()->json(null, 204);
    }
}
