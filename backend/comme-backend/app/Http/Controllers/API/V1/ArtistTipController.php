<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Models\ArtistTip;
use App\Models\User;
use App\Services\API\V1\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

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
            ->where('status', 'settled')
            ->latest()
            ->paginate(20);

        return ApiResponseHelper::successResponse($tips, 'Artist tips retrieved successfully.');
    }

    /**
     * Initiate a tip transaction via Midtrans Snap supporting regional currencies.
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

        $tipCurrency = strtoupper(trim((string) $request->get('currency', 'IDR')));
        if (! in_array($tipCurrency, ['IDR', 'USD', 'EUR', 'JPY', 'SGD', 'GBP'], true)) {
            $tipCurrency = 'IDR';
        }

        // Currency-aware minimum validation
        $minAmount = match ($tipCurrency) {
            'IDR' => 10000,
            'JPY' => 100,
            default => 1, // USD, EUR, GBP, SGD min 1.00
        };

        $validated = $request->validate([
            'amount' => ['required', 'numeric', "min:{$minAmount}", 'max:50000000'],
            'currency' => ['nullable', 'string', 'in:IDR,USD,EUR,JPY,SGD,GBP'],
            'message' => ['nullable', 'string', 'max:500'],
            'supporter_name' => ['nullable', 'string', 'max:100'],
            'supporter_email' => ['nullable', 'email', 'max:150'],
        ]);

        $originalAmount = (float) $validated['amount'];

        if ($tipCurrency === 'IDR') {
            $idrAmount = (int) round($originalAmount);
        } else {
            $cachedRates = Cache::get('comme_exchange_rates_v1');
            $rateToIdr = $cachedRates['rates_to_idr'][$tipCurrency] ?? match ($tipCurrency) {
                'USD' => 15873,
                'EUR' => 17241,
                'GBP' => 20408,
                'SGD' => 11764,
                'JPY' => 105,
                default => 1,
            };
            $idrAmount = (int) round($originalAmount * $rateToIdr);
        }

        $currentUser = $request->user();

        $tip = ArtistTip::create([
            'artist_profile_id' => $user->artistProfile->id,
            'user_id' => $currentUser?->id,
            'supporter_name' => $validated['supporter_name'] ?? ($currentUser?->display_name ?: $currentUser?->username ?: 'Generous Supporter'),
            'supporter_email' => $validated['supporter_email'] ?? ($currentUser?->email ?: 'supporter@comme.art'),
            'amount' => $idrAmount,
            'currency' => $tipCurrency,
            'original_amount' => $originalAmount,
            'message' => $validated['message'] ?? null,
            'status' => 'pending',
        ]);

        $snapToken = $midtransService->createTipSnapTransaction($tip);
        $tip->snap_token = $snapToken;
        $tip->saveQuietly();

        return ApiResponseHelper::successResponse([
            'tip_id' => $tip->id,
            'amount' => $tip->amount,
            'currency' => $tip->currency,
            'original_amount' => $tip->original_amount,
            'supporter_name' => $tip->supporter_name,
            'snap_token' => $snapToken,
            'artist' => [
                'username' => $user->username,
                'display_name' => $user->display_name,
            ],
        ], 'Tip payment initialized successfully.', Response::HTTP_CREATED);
    }
}
