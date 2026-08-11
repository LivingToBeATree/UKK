<?php

namespace App\Http\Controllers\API\V1;

use App\Models\CommissionReview;
use App\Models\ArtistProfile;
use App\Models\Commission;
use App\Http\Requests\API\V1\CommissionReview\StoreCommissionReviewRequest;
use App\Http\Requests\API\V1\CommissionReview\UpdateCommissionReviewRequest;
use App\Http\Requests\API\V1\CommissionReview\ReplyCommissionReviewRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class CommissionReviewController extends Controller
{
    /**
     * Reviews are public by design (CommissionReviewPolicy::view() always
     * returns true) — no Gate call here on purpose. Nested under
     * ArtistProfile rather than Commission, since this is meant to power
     * an artist's public reputation listing, not a private commission
     * thread. Deliberately a different parent than store() uses below.
     */
    public function index(ArtistProfile $artistProfile): JsonResponse
    {
        Gate::authorize('viewAny', CommissionReview::class);

        $reviews = $artistProfile->reviews()
            ->with('user')
            ->latets()
            ->paginate(20);

        return response()->json($reviews);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCommissionReviewRequest $request, Commission $commission): JsonResponse
    {
        $review = CommissionReview::create([
            ...$request->validated(),
            'commission_id' => $commission->id,
            'artist_profile_id' => $commission->artist_profile_id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($review, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CommissionReview $review): JsonResponse
    {
        Gate::authorize('view', $review);

        return response()->json($review->load(['user', 'artistProfile']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommissionReviewRequest $request, CommissionReview $review): JsonResponse
    {
        $review->update($request->validated());

        return response()->json($review);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CommissionReview $review): JsonResponse
    {
        Gate::authorize('delete', $review);

        $review->delete();

        return response()->json(null, 204);
    }

    /**
     * artist_reply and artist_replied_at are always set together here —
     * this is the one place in the whole app that touches either field,
     * so they can never drift out of sync with each other.
     */
    public function reply(ReplyCommissionReviewRequest $request, CommissionReview $review): JsonResponse
    {
        $review->update([
            'artist_reply' => $request->artist_reply,
            'artist_replied_at' => now(),
        ]);

        return response()->json($review);
    }
}
