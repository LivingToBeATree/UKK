<?php

namespace App\Http\Requests\API\V1\Commission;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCommissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('commission'));
    }

    /**
     * Deliberately narrow — general update() is for the artist's routine
     * description adjustments only. Status transitions must occur through
     * dedicated lifecycle endpoints (accept, decline, deliver, confirm, etc.).
     */
    public function rules(): array
    {
        return [
            'description' => ['required', 'string'],
        ];
    }
}
