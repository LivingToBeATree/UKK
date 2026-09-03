<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $thumbnail = null;
        if ($this->relationLoaded('media') && $this->media && $this->media->isNotEmpty()) {
            $thumbnail = $this->media->firstWhere('is_thumbnail', true) ?? $this->media->first();
        } elseif ($this->relationLoaded('thumbnailMedia') && $this->thumbnailMedia) {
            $thumbnail = $this->thumbnailMedia;
        }

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'thumbnail_media_id' => $this->thumbnail_media_id,
            'visibility' => $this->visibility?->value,
            'is_taken_down' => (bool) $this->is_taken_down,
            'taken_down_reason' => $this->when($request->user()?->id === $this->artistProfile?->user_id || $request->user()?->isStaff(), $this->taken_down_reason),
            'starred' => (bool) $this->starred,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'artist_profile' => new ArtistProfileResource($this->whenLoaded('artistProfile')),
            'thumbnail_media' => $thumbnail ? new MediaResource($thumbnail) : null,
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
