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
            'message' => ['nullable', 'string', 'max:5000'],
            'message_type' => ['nullable', Rule::enum(MessageType::class)],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['file', 'max:51200'],
            'media' => ['nullable', 'array', 'max:10'],
            'media.*' => ['file', 'max:51200'],
            'attachment' => ['nullable', 'file', 'max:51200'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $hasMessage = filled($this->input('message'));
            $hasAttachments = $this->hasFile('attachments') || $this->hasFile('media') || $this->hasFile('attachment');

            if (! $hasMessage && ! $hasAttachments) {
                $validator->errors()->add('message', 'Please provide a text message or attach a file/image.');
            }
        });
    }
}

