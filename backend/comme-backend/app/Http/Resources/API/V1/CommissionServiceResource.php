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
            'artist_profile_id' => $this->artist_profile_id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status?->value,
            'alt_text' => $this->alt_text,

            'artist_profile' => new ArtistProfileResource($this->whenLoaded('artistProfile')),
            'thumbnail_media' => new MediaResource($this->whenLoaded('thumbnailMedia')),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'options' => CommissionOptionResource::collection($this->whenLoaded('options')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
