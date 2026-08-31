<?php

namespace App\Http\Requests\API\V1\Portfolio;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use App\Enum\CommissionVisibility;

class UpdatePortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('portfolio'));
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes','string','max:255'],
            'description' => ['sometimes', 'nullable' ,'string'],
            'thumbnail_media_id' => ['sometimes', 'nullable', 'exists:medias,id'],
            'visibility' => ['sometimes', new Enum(CommissionVisibility::class)],
            'starred' => ['sometimes', 'boolean'],
        ];
    }
}
