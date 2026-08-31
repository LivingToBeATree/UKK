<?php

namespace App\Http\Requests\API\V1\User\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class InitiateRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];
        if ($this->has('email')) {
            $merge['email'] = mb_strtolower($this->email);
        }
        if (!$this->has('display_name') && $this->has('username')) {
            $merge['display_name'] = $this->username;
        }
        if (!empty($merge)) {
            $this->merge($merge);
        }
    }

    /**
     * Same rules as the old RegisterRequest — uniqueness is still checked
     * against the real `users` table here, since two different people
     * shouldn't both be allowed to sit in "pending" on the same email or
     * username. confirm() re-checks this again too, to close the race
     * where someone else finishes registering first during the window.
     */
    public function rules(): array
    {
        return [
            'username' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                'unique:users,username',
                Rule::unique('pending_registrations', 'username')
                    ->where(fn ($query) => $query->where('email', '!=', $this->input('email'))),
            ],
            'display_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
