<?php

namespace App\Http\Requests\API\V1\ArtistProfile;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\ArtistProfile;

class StoreArtistProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ArtistProfile::class) ;
    }

    public function rules(): array
    {
        return [
            'bio' => ['nullable', 'string', 'max:1000'],
            'banner' => ['nullable', 'string'],
            'website' => ['nullable', 'url', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'commission_open' => ['sometimes', 'boolean'],
        ];
    }
}
