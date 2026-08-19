<?php

namespace App\Http\Requests\API\V1\ArtistApplication;

use App\Models\ArtistApplication;
use Illuminate\Foundation\Http\FormRequest;

class StoreArtistApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ArtistApplication::class);
    }

    public function rules(): array
    {
        return [
            'bio' => ['required', 'string', 'max:2000'],
            'portfolio_links' => ['required', 'array', 'min:1'],
            'portfolio_links.*' => ['required', 'url', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'social_links.*' => ['url', 'max:255'],
        ];
    }
}
