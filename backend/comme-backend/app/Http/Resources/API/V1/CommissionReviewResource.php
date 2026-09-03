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
            'commission_id' => $this->commission_id,
            'artist_profile_id' => $this->artist_profile_id,
            'user_id' => $this->user_id,
            'rating' => $this->rating,
            'title' => $this->title,
            'comment' => $this->comment,
            'recommended' => $this->recommended,
            'artist_reply' => $this->artist_reply,
            'artist_replied_at' => $this->artist_replied_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'user' => new UserResource($this->whenLoaded('user')),
            'artist_profile' => new ArtistProfileResource($this->whenLoaded('artistProfile')),
            'commission' => $this->whenLoaded('commission', function () {
                return [
                    'id' => $this->commission->id,
                    'service' => $this->commission->commissionService ? [
                        'id' => $this->commission->commissionService->id,
                        'name' => $this->commission->commissionService->name,
                    ] : null,
                    'option' => $this->commission->commissionOption ? [
                        'id' => $this->commission->commissionOption->id,
                        'title' => $this->commission->commissionOption->title,
                    ] : null,
                ];
            }),
        ];
    }
}
