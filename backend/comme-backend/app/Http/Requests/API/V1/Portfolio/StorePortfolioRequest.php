<?php

namespace App\Http\Requests\API\V1\Portfolio;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use App\Models\Portfolio;
use App\Enum\CommissionVisibility;

class StorePortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Portfolio::class);
    }

    public function rules(): array
    {
        return [
            'title' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'thumbnail_media_id' => ['nullable', 'exists:medias,id'],
            'visibility' => ['sometimes', new Enum(CommissionVisibility::class)],
            'starred' => ['sometimes', 'boolean'],

            // views, likes, and bookmarks are deliberately absent — those
            // are counters incremented by their own actions (viewing,
            // liking, bookmarking a piece), never set directly by the owner.
        ];
    }
}
