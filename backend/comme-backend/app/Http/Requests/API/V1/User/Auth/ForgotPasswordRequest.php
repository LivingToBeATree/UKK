<?php

namespace App\Http\Requests\API\V1\User\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // open to guests — you're not logged in if you forgot your password
    }

    /**
     * Deliberately no 'exists:users,email' rule here. Adding one would let
     * an attacker enumerate which emails have accounts on your platform,
     * just by watching which submissions return a validation error vs a
     * success message. The controller always responds the same way either
     * way — see ForgotPasswordController.
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
        ];
    }
}
