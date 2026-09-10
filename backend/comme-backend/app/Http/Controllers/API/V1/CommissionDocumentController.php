<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\CommissionStatus;
use App\Http\Helpers\ApiResponseHelper;
use App\Models\Commission;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CommissionDocumentController extends Controller
{
    /**
     * Display a clean, printable official invoice for the commission.
     */
    public function invoice(Request $request, Commission $commission): Response|\Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponseHelper::errorResponse('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
        }

        // Authorization check: buyer, artist, or staff
        $isParticipant = $user->id === $commission->user_id
            || $user->id === $commission->artistProfile?->user_id
            || $user->isStaff()
            || $user->isAdmin();

        if (! $isParticipant) {
            return ApiResponseHelper::errorResponse(
                'You are not authorized to view invoice documents for this commission.',
                Response::HTTP_FORBIDDEN
            );
        }

        $commission->load(['user', 'artistProfile.user', 'service', 'commissionService', 'addonsSelections', 'payment', 'payout']);

        $hasCommercial = $commission->addonsSelections->contains(function ($addon) {
            return str_contains(strtolower($addon->title ?? ''), 'commercial');
        });

        // Generate deterministic receipt identifier
        $receiptHash = strtoupper(substr(md5("comme-receipt-{$commission->id}-{$commission->created_at}"), 0, 8));
        $receiptNumber = "REC-COM-{$commission->id}-{$receiptHash}";

        return response()->view('documents.invoice', [
            'commission' => $commission,
            'receiptNumber' => $receiptNumber,
            'user' => $user,
            'hasCommercialRights' => $hasCommercial,
            'autoPrint' => $request->boolean('print'),
        ]);
    }

    /**
     * Display the official Certificate of Authenticity & Commercial License.
     */
    public function license(Request $request, Commission $commission): Response|\Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponseHelper::errorResponse('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
        }

        // Authorization check: buyer, artist, or staff
        $isParticipant = $user->id === $commission->user_id
            || $user->id === $commission->artistProfile?->user_id
            || $user->isStaff()
            || $user->isAdmin();

        if (! $isParticipant) {
            return ApiResponseHelper::errorResponse(
                'You are not authorized to view license documents for this commission.',
                Response::HTTP_FORBIDDEN
            );
        }

        $statusValue = $commission->status instanceof CommissionStatus ? $commission->status->value : $commission->status;
        if ($statusValue !== 'completed' && ! ($user->isStaff() || $user->isAdmin())) {
            return ApiResponseHelper::errorResponse(
                'Commercial license agreements are only available once the commission has been completed.',
                Response::HTTP_FORBIDDEN
            );
        }

        $commission->load(['user', 'artistProfile.user', 'service', 'commissionService', 'addonsSelections']);

        $hasCommercial = $commission->addonsSelections->contains(function ($addon) {
            return str_contains(strtolower($addon->title ?? ''), 'commercial');
        });

        $licenseHash = strtoupper(substr(sha1("comme-license-{$commission->id}-{$commission->created_at}"), 0, 12));
        $licenseNumber = "LIC-COM-{$commission->id}-{$licenseHash}";

        return response()->view('documents.license', [
            'commission' => $commission,
            'licenseNumber' => $licenseNumber,
            'user' => $user,
            'hasCommercialRights' => $hasCommercial,
            'autoPrint' => $request->boolean('print'),
        ]);
    }
}
