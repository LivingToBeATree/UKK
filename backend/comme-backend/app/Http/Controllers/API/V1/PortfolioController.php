<?php

namespace App\Http\Controllers\API\V1;

use App\Models\Portfolio;
use App\Http\Requests\API\V1\Portfolio\StorePortfolioRequest;
use App\Http\Requests\API\V1\Portfolio\UpdatePortfolioRequest;
use App\Http\Resources\API\V1\PortfolioResource;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
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

        return ApiResponseHelper::successResponse(
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
            ...$request->validated(),
            'artist_profile_id' => $request->user()->artistProfile->id,
        ]);

        return ApiResponseHelper::successResponse(
            new PortfolioResource($portfolio),
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
        $portfolio->update($request->validated());

        return ApiResponseHelper::successResponse(
            new PortfolioResource($portfolio),
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
