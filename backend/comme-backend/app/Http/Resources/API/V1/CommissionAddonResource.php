<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

class CommissionAddonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'additional_price' => (float) $this->additional_price,
            'base_currency' => $this->base_currency ?? 'IDR',
            'regional_prices' => $this->regional_prices,
        ];
    }
}
