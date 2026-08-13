<?php

namespace App\Http\Resources\API\V1;

use App\Http\Resources\API\V1\CommissionServiceResource;
use App\Http\Resources\API\V1\PortfolioResource;
use App\Http\Resources\API\V1\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArtistProfileResource extends JsonResource
{
    /**
     * whenLoaded('user') only includes the relationship if the controller
     * actually eager-loaded it (via ->load('user') or ->with('user')).
     * If it wasn't loaded, this key is omitted from the JSON entirely
     * instead of silently firing an extra query per resource.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'bio' => $this->bio,
            'banner' => $this->banner,
            'website' => $this->website,
            'social_links' => $this->social_links,
            'commission_open' => $this->commission_open,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'user' => new UserResource($this->whenLoaded('user')),
            'commission_services' => CommissionServiceResource::collection($this->whenLoaded('commissionServices')),
            'portfolios' => PortfolioResource::collection($this->whenLoaded('portfolios')),
        ];
    }
}
