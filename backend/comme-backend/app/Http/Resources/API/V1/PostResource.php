<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'content' => $this->content,
            'visibility' => $this->visibility?->value,
            'commentable' => $this->commentable,
            'likes_count' => $this->likes()->count(),
            'comments_count' => $this->comments()->count(),
            'bookmarks_count' => $this->bookmarks()->count(),
            'is_liked' => $user ? $this->likes()->where('user_id', $user->id)->exists() : false,
            'is_bookmarked' => $user ? $this->bookmarks()->where('user_id', $user->id)->exists() : false,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'user' => new UserResource($this->whenLoaded('user')),
            'portfolio' => new PortfolioResource($this->whenLoaded('portfolio')),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
