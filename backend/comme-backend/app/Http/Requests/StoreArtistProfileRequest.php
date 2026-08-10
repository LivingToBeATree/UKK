<?php

namespace App\Http\Requests;

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
            'commmssion_open' => ['sometimes', 'boolean']
        ];
    }
}