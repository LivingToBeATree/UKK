<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostCommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'post_id' => $this->post_id,
            'content' => $this->content,
            'body' => $this->content,
            'parent_comment_id' => $this->parent_comment_id,
            'likes_count' => $this->likes()->count(),
            'is_liked' => $user ? $this->likes()->where('user_id', $user->id)->exists() : false,
            'bookmarks_count' => $this->bookmarks()->count(),
            'is_bookmarked' => $user ? $this->bookmarks()->where('user_id', $user->id)->exists() : false,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'user' => new UserResource($this->whenLoaded('user')),
            // A comment's own replies are the same resource, recursively
            'replies' => PostCommentResource::collection($this->whenLoaded('replies')),
        ];
    }
}
