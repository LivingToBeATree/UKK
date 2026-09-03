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
            'bio' => ['required', 'string', 'min:20', 'max:2000'],
            'portfolio_links' => ['nullable', 'array'],
            'portfolio_links.*' => ['required', 'url', 'max:255'],
            'sample_artworks' => ['nullable', 'array', 'max:10'],
            'sample_artworks.*' => ['file', 'image', 'max:15360'],
            'website' => ['nullable', 'url', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'social_links.*' => ['url', 'max:255'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $hasLinks = !empty($this->input('portfolio_links')) && count(array_filter($this->input('portfolio_links'))) > 0;
            $hasFiles = $this->hasFile('sample_artworks');

            if (!$hasLinks && !$hasFiles) {
                $validator->errors()->add('portfolio_links', 'Please provide at least one portfolio link or upload sample artworks.');
            }
        });
    }
}
