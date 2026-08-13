<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommissionReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'title' => $this->title,
            'comment' => $this->comment,
            'recommended' => $this->recommended,
            'artist_reply' => $this->artist_reply,
            'artist_replied_at' => $this->artist_replied_at,

            'user' => new UserResource($this->whenLoaded('user')),
            'artist_profile' => new ArtistProfileResource($this->whenLoaded('artistProfile')),
        ];
    }
}
