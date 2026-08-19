<?php

namespace App\Http\Requests\API\V1\CommissionMessage;

use App\Enum\MessageType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCommissionMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorized in controller
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:2000'],
            'message_type' => ['nullable', Rule::enum(MessageType::class)],
        ];
    }
}
