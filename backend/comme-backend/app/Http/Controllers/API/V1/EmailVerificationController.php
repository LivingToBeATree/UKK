<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmailVerificationController extends Controller
{
    /**
     * EmailVerificationRequest is a special Laravel-provided Form Request —
     * its authorize() automatically checks that the {id}/{hash} in the URL
     * actually match the currently authenticated user, and the 'signed'
     * route middleware (added in routes) checks the URL's signature wasn't
     * tampered with. Both checks happen before this method body even runs.
     */
    public function verify(EmailVerificationRequest $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return ApiResponseHelper::successResponse(message: 'Email already verified.');
        };

        $request->fulfill(); // marks email_verified_at + fires the Verified event

        return ApiResponseHelper::successResponse(message: 'Email verified successfully.');
    }

    public function resend(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return ApiResponseHelper::successResponse(message: 'Email already verified.');
        }

        $request->user()->sendEmailVerificationNotification();

        return ApiResponseHelper::successResponse(message: 'Verification link sent.');
    }
}
