<?php

namespace App\Http\Requests\API\V1\Commission;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCommissionDeadlineRequest extends FormRequest
{
    /**
     * Checked against CommissionPolicy::updateDeadline(), not update() —
     * a separate ability since your spec calls this out as its own action.
     */
    public function authorize(): bool
    {
        return $this->user()->can('updateDeadline', $this->route('commission'));
    }

    public function rules(): array
    {
        return [
            'deadline' => ['required', 'date', 'after:today']
        ];
    }
}