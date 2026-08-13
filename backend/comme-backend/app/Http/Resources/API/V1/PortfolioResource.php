<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'visibility' => $this->visibility?->value,
            'starred' => $this->starred,

            'artist_profile_id' => new ArtistProfileResource($this->whenLoaded('artistProfile')),
            'thumbnail_media_id' => new MediaResource($this->whenLoaded('thumbnailMedia')),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
