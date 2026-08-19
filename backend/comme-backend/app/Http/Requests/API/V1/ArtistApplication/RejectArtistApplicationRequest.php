<?php

namespace App\Http\Requests\API\V1\ArtistApplication;

use Illuminate\Foundation\Http\FormRequest;

class RejectArtistApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorized via Gate::authorize in controller
    }

    public function rules(): array
    {
        return [
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
