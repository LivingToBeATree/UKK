<?php

namespace App\Http\Requests\API\V1\Artist;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePayoutAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->artistProfile()->exists();
    }

    public function rules(): array
    {
        return [
            'bank_name' => ['required', 'string', 'max:50'],
            'bank_account_name' => ['required', 'string', 'max:100'],
            'bank_account_number' => ['required', 'string', 'max:50', 'regex:/^[0-9]+$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'bank_account_number.regex' => 'The bank account number must only contain digits.',
        ];
    }
}
