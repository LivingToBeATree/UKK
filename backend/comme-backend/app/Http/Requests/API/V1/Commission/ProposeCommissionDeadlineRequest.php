<?php

namespace App\Http\Requests\API\V1\Commission;

use Illuminate\Foundation\Http\FormRequest;

class ProposeCommissionDeadlineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('proposeDeadline', $this->route('commission'));
    }

    public function rules(): array
    {
        return [
            'proposed_deadline' => ['required', 'date', 'after:today'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
