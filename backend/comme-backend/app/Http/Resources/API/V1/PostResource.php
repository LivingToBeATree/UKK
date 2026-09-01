<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'visibility' => $this->visibility?->value,
            'commentable' => $this->commentable,
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
            'bookmarks_count' => $this->bookmarks_count,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'user' => new UserResource($this->whenLoaded('user')),
            'portfolio' => new PortfolioResource($this->whenLoaded('portfolio')),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
