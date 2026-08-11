<?php

namespace App\Http\Requests\API\V1\PostComment;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\PostComment;

class StorePostCommentRequest extends FormRequest
{
    /**
     * Triggers PostCommentPolicy::create($user) — currently just "any
     * authenticated user." Whether the specific target Post actually
     * allows comments is checked below in withValidator(), not here,
     * since that's a business-state check, not a permission check.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', PostComment::class);
    }

    public function rules(): array
    {
        return [
            'content' => ['required','string'],
            'parent_comment_id' => ['nullable','exists:post_comments,id'],

            // post_id is never a rule here — it comes from the route
            // ({post} in the URL), never the request body. See controller.
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $post = $this->route('post');

            if (! $post->commentable) {
                $validator->errors()->add('content', 'This post does not accept comments.');
            }

            // A reply's parent must belong to the *same* post — otherwise
            // someone could reply to a comment on a completely different post.
            if ($this->parent_comment_id) {
                $parent = PostComment::find($this->parent_comment_id);

                if ($parent && $parent->post_id !== $post->id) {
                    $validator->errors()->add('parent_comment_id', 'That comment does not belong to this post.');
                }
            }
        });
    }
}
