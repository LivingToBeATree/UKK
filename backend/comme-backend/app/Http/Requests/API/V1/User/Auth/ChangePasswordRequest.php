<?php

namespace App\Http\Requests\API\V1\User\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // 'current_password' is a built-in Laravel rule — it checks the
            // submitted value against the logged-in user's actual hashed
            // password automatically. No manual Hash::check() needed.
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
