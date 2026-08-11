<?php

namespace App\Http\Requests\API\V1\PostComment;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\PostComment;

class UpdatePostCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('comment'));
    }

    /**
     * Only content is editable — post_id and parent_comment_id are fixed
     * at creation, same reasoning as Post's portfolio_id being locked
     * after creation.
     */
    public function rules(): array
    {
        return [
            'content' => ['required','string'],
        ];
    }
}
