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
            'content' => ['sometimes', 'string'],
            'visibility' => ['sometimes', new Enum(PostVisibilityType::class)],
            'commentable' => ['sometimes', 'boolean'],
            'portfolio_id' => ['sometimes', 'nullable', 'exists:portfolios,id'],
            'tags' => ['sometimes', 'nullable'],
            'tags.*' => ['string', 'max:50'],
            'media' => ['nullable', 'array', 'max:10'],
            'media.*' => ['file', 'mimes:jpeg,png,jpg,gif,webp,mp4,mov', 'max:25600'],
            'delete_media_ids' => ['sometimes', 'nullable'],
            'delete_media_ids.*' => ['integer'],
        ];
    }
}
