<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommissionServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status?->value,
            'alt_text' => $this->alt_text,

            'artist_profile_id' => new ArtistProfileResource($this->whenLoaded('aristProfile')),
            'thumbnail_media_id' => new MediaResource($this->whenLoaded('thumbnailMedia')),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'option' => $this->whenLoaded('options'),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
