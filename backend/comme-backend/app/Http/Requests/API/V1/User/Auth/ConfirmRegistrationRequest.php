<?php

namespace App\Http\Requests\API\V1\User\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'code' => ['required', 'string', 'digits:6'],
        ];
    }
}
