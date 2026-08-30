<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Http\Requests\API\V1\Artist\UpdatePayoutAccountRequest;
use App\Models\ArtistPayoutAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ArtistPayoutAccountController extends Controller
{
    /**
     * Get masked payout account for authenticated artist.
     */
    public function show(Request $request): JsonResponse
    {
        $artistProfile = $request->user()->artistProfile;

        if (!$artistProfile) {
            return ApiResponseHelper::errorResponse(
                'User is not registered as an artist.',
                Response::HTTP_FORBIDDEN
            );
        }

        $account = $artistProfile->payoutAccount;

        if (!$account) {
            return ApiResponseHelper::successResponse(
                null,
                'No payout account configured yet.'
            );
        }

        return ApiResponseHelper::successResponse(
            [
                'id' => $account->id,
                'bank_name' => $account->bank_name,
                'bank_account_name' => $account->bank_account_name,
                'bank_account_number' => $account->masked_account_number,
                'is_active' => $account->is_active,
                'updated_at' => $account->updated_at,
            ],
            'Payout account retrieved successfully.'
        );
    }

    /**
     * Set or update active payout account.
     *
     * Uses a transaction with lockForUpdate on the artist profile to
     * enforce the invariant: at most 1 active payout account per artist.
     */
    public function update(UpdatePayoutAccountRequest $request): JsonResponse
    {
        $account = DB::transaction(function () use ($request) {
            $artistProfile = $request->user()->artistProfile()
                ->lockForUpdate()
                ->firstOrFail();

            // Deactivate all previous active accounts
            ArtistPayoutAccount::where('artist_profile_id', $artistProfile->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            return ArtistPayoutAccount::create([
                'artist_profile_id' => $artistProfile->id,
                'bank_name' => strtoupper($request->bank_name),
                'bank_account_name' => $request->bank_account_name,
                'bank_account_number' => $request->bank_account_number,
                'is_active' => true,
            ]);
        });

        return ApiResponseHelper::successResponse(
            [
                'id' => $account->id,
                'bank_name' => $account->bank_name,
                'bank_account_name' => $account->bank_account_name,
                'bank_account_number' => $account->masked_account_number,
                'is_active' => $account->is_active,
                'updated_at' => $account->updated_at,
            ],
            'Payout account successfully saved.'
        );
    }

    /**
     * Remove active payout account.
     */
    public function destroy(Request $request): JsonResponse
    {
        $artistProfile = $request->user()->artistProfile;

        if (!$artistProfile) {
            return ApiResponseHelper::errorResponse('Forbidden', Response::HTTP_FORBIDDEN);
        }

        ArtistPayoutAccount::where('artist_profile_id', $artistProfile->id)->delete();

        return ApiResponseHelper::successResponse(
            null,
            'Payout account removed successfully.'
        );
    }
}
