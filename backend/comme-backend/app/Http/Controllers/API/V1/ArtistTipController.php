<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Models\ArtistTip;
use App\Models\User;
use App\Services\API\V1\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ArtistTipController extends Controller
{
    /**
     * List recent public tips for an artist.
     */
    public function index(string $username): JsonResponse
    {
        $user = User::where('username', $username)->with('artistProfile')->first();

        if (! $user || ! $user->artistProfile) {
            return ApiResponseHelper::errorResponse('Artist profile not found.', Response::HTTP_NOT_FOUND);
        }

        $tips = ArtistTip::where('artist_profile_id', $user->artistProfile->id)
            ->whereIn('status', ['settled', 'pending'])
            ->latest()
            ->paginate(20);

        return ApiResponseHelper::successResponse($tips, 'Artist tips retrieved successfully.');
    }

    /**
     * Initiate a tip transaction via Midtrans Snap.
     */
    public function store(
        Request $request,
        string $username,
        MidtransService $midtransService
    ): JsonResponse {
        $user = User::where('username', $username)->with('artistProfile.user')->first();

        if (! $user || ! $user->artistProfile) {
            return ApiResponseHelper::errorResponse('Artist profile not found.', Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:10000', 'max:10000000'],
            'message' => ['nullable', 'string', 'max:500'],
            'supporter_name' => ['nullable', 'string', 'max:100'],
            'supporter_email' => ['nullable', 'email', 'max:150'],
        ]);

        $currentUser = $request->user();

        $tip = ArtistTip::create([
            'artist_profile_id' => $user->artistProfile->id,
            'user_id' => $currentUser?->id,
            'supporter_name' => $validated['supporter_name'] ?? ($currentUser?->display_name ?: $currentUser?->username ?: 'Generous Supporter'),
            'supporter_email' => $validated['supporter_email'] ?? ($currentUser?->email ?: 'supporter@comme.art'),
            'amount' => (int) $validated['amount'],
            'message' => $validated['message'] ?? null,
            'status' => 'pending',
        ]);

        $snapToken = $midtransService->createTipSnapTransaction($tip);
        $tip->snap_token = $snapToken;
        $tip->saveQuietly();

        return ApiResponseHelper::successResponse([
            'tip_id' => $tip->id,
            'amount' => $tip->amount,
            'supporter_name' => $tip->supporter_name,
            'snap_token' => $snapToken,
            'artist' => [
                'username' => $user->username,
                'display_name' => $user->display_name,
            ],
        ], 'Tip payment initialized successfully.', Response::HTTP_CREATED);
    }
}
