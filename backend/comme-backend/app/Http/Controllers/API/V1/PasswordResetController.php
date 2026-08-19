<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Http\Requests\API\V1\User\Auth\ForgotPasswordRequest;
use App\Http\Requests\API\V1\User\Auth\ResetPasswordRequest;
use App\Notifications\API\V1\User\Auth\PasswordChangedNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Password::sendResetLink() is Laravel's built-in "password broker" —
     * it generates a token, stores a hash of it in password_reset_tokens,
     * and fires off the ResetPassword notification (whose URL we already
     * pointed at the frontend in AppServiceProvider).
     *
     * The response message is IDENTICAL whether the email exists or not —
     * same reasoning as leaving 'exists:users,email' off the Form Request.
     * A different message per case would let an attacker enumerate real
     * accounts just by trying emails and watching which response they get.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink($request->only('email'));

        return ApiResponseHelper::successResponse(message: 'If that email is registered, a password reset link has been sent.');
    }

    /**
     * Password::reset() validates the token against what was stored by
     * sendResetLink() above, and only calls the closure if it's genuinely
     * valid and not expired.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => $request->password // hashed automatically via the model's cast
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));

                $user->notify(new PasswordChangedNotification(now(), $request->ip()));
            },
        );

        if ($status === Password::PASSWORD_RESET) {
            return ApiResponseHelper::successResponse(message: 'Password reset successfully.');
        }

        // $status here is a translation key like "passwords.token" —
        // __() resolves it to the actual human-readable message.
        return ApiResponseHelper::errorResponse(__($status), Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
