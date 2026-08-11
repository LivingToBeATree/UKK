<?php

namespace App\Http\Requests\API\V1\Commission;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use App\Enum\CommissionStatus;

class UpdateCommissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('commission'));
    }

    /**
     * Deliberately narrow — general update() is for the artist's routine
     * management only. deadline and cancellation each have their own
     * dedicated ability/endpoint (see updateDeadline() and cancel() on
     * the controller), since those carry different authorization rules.
     */
    public function rules(): array
    {
        return [
            'description' => ['sometimes', 'string'],
            'status' => ['sometimes', new Enum(CommissionStatus::class)],
        ];
    }
}
