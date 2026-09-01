<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostCommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'body' => $this->content,
            'parent_comment_id' => $this->parent_comment_id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'user' => new UserResource($this->whenLoaded('user')),
            // A comment's own replies are the same resource, recursively —
            // this works fine as long as your controller doesn't eager-load
            // infinitely deep (index() only loads one level: 'replies.user').
            'replies' => PostCommentResource::collection($this->whenLoaded('replies')),
        ];
    }
}
