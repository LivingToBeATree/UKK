<?php

namespace App\Http\Requests\API\V1\Post;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use App\Enum\PostVisibilityType;
use App\Models\Portfolio;
use App\Models\Post;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Post::class);
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string'],
            'portfolio_id' => ['nullable','exists:portfolio,id'],
            'visibility' => ['sometimes', new Enum(PostVisibilityType::class)],
            'commentable' => ['sometimes', 'boolean'],

            // likes_count / comments_count / bookmarks_count are absent —
            // those move only through the like/comment/bookmark actions
            // themselves, never set directly on the post.
        ];
    }


    /**
     * A cross-field check that doesn't fit cleanly into a single rule:
     * if a portfolio_id is given, it must belong to *this* user's own
     * artist profile — otherwise anyone could attach someone else's
     * portfolio piece to their own post.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! $this->portfolio_id) {
                return;
            }

            $portfolio = Portfolio::find($this->portfolio_id);

            if ($portfolio && $portfolio->artistProfile->user_id !== $this->user()->id) {
                $validator->errors()->add('portfolio_id', 'You can only attach your own portfolio pieces');
            }
        });
    }
}
