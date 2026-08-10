<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateArtistProfileRequest extends FormRequest
{
    /**
     * $this->route('artist_profile') grabs the same route-bound model
     * instance the controller method receives
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('artist_profile'));
    }
 
    /**
     * 'sometimes' means "only validate this field if it was actually sent"
     */
    public function rules(): array
    {
        return [
            'bio' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'banner' => ['sometimes', 'nullable', 'string'],
            'website' => ['sometimes', 'nullable', 'url', 'max:255'],
            'social_links' => ['sometimes', 'nullable', 'array'],
            'commission_open' => ['sometimes', 'boolean'],
        ];
    }
}