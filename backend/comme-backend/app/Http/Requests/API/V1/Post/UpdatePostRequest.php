<?php

namespace App\Http\Requests\API\V1\Post;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use App\Enum\PostVisibilityType;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('post'));
    }

    public function rules(): array
    {
        return [
            'content' => ['sometiems', 'string'],
            'visibility' => ['sometimes', new Enum(PostVisibilityType::class)],
            'commentable' => ['sometimes', 'boolean'],

            // portfolio_id intentionally not editable after creation —
            // change it by deleting and re-creating the post instead.
        ];
    }
}
