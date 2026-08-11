<?php

namespace App\Http\Requests\API\V1\CommissionService;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use App\Enum\ServiceStatus;


class UpdateCommissionServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('commission_service'));
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes','string','max:255'],
            'description' => ['sometimes','string'],
            'alt_text' => ['sometimes', 'nullable', 'string', 'max:255'],
            'thumbnail_media_id' => ['sometimes', 'nullable', 'exists:medias,id'],
            'status' => ['sometimes', new Enum(ServiceStatus::class)],
        ];
    }
}