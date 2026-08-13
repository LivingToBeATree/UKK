<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

class CommissionOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'base_price' => (float) $this->base_price,

            // One level deeper — only appears if the controller eager-loaded
            // 'options.addons', same whenLoaded rule applies at every level.
            'addons' => CommissionAddonResource::collection($this->whenLoaded('addons')),
        ];
    }
}
