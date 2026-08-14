<?php

namespace App\Http\Requests\API\V1\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // always operating on the logged-in user themselves — see controller
    }

    public function rules(): array
    {
        return [
            // ->ignore($this->user()->id) excludes the user's own current
            // row from the uniqueness check — without this, saving the
            // profile without even changing the username would fail,
            // since it would "find" own existing row as a duplicate.
            'username' =>['sometimes', 'string', 'max:255', 'alpha_dash', Rule::unique('users', 'username')->ignore($this->user()->id)],
            'display_name' => ['sometimes', 'string', 'max:255'],
            'avatar' => ['sometimes', 'nullable', 'string'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:1000'],

            // email and role are deliberately absent — email changes need
            // their own flow (re-verification, since otherwise someone
            // could swap to an unverified address while keeping verified
            // status), and role can only ever be changed by an admin.
        ];
    }
}
