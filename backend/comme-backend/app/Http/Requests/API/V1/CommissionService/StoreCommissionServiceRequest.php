<?php

namespace App\Http\Requests\API\V1\CommissionService;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use App\Models\CommissionService;
use App\Enum\ServiceStatus;

class StoreCommissionServiceRequest extends FormRequest
{
    /**
     * Triggers CommissionServicePolicy::create($user), which checks
     * $user->hasArtistProfile() — so a buyer with no artist profile gets
     * a 403 before validation even runs.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', CommissionService::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required','string','max:255'],
            'description' => ['required','string'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'thumbnail_media_id' => ['nullable', 'exists:medias,id'],
            'status' => ['sometimes', new Enum(ServiceStatus::class)],
        ];
    }
}