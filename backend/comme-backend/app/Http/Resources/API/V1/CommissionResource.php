<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status?->value,
            'description' => $this->description,
            'deadline' => $this->deadline,
            'delivered_at' => $this->delivered_at?->toISOString(),
            'review_deadline' => $this->review_deadline?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            // Laravel's decimal cast returns a string ("150.00"), not a
            // number — (float) here so the frontend gets a real number
            // it can do math on directly, not something it has to parseFloat() itself.
            'total_price' => (float) $this->total_price,

            'commission_service' => new CommissionServiceResource($this->whenLoaded('commissionService')),
            'commission_option' => new CommissionOptionResource($this->whenLoaded('commissionOption')),
            'artist_profile' => new ArtistProfileResource($this->whenLoaded('artistProfile')),
            'user' => new UserResource($this->whenLoaded('user')),
            'review' => new CommissionReviewResource($this->whenLoaded('review')),
            'messages' => CommissionMessageResource::collection($this->whenLoaded('messages')),
            'payout' => $this->whenLoaded('payout', function () {
                return [
                    'id' => $this->payout->id,
                    'amount' => (float) $this->payout->amount,
                    'status' => $this->payout->status?->value,
                    'reference' => $this->payout->reference,
                    'bank_name' => $this->payout->bank_name,
                    'bank_account_name' => $this->payout->bank_account_name,
                    'bank_account_number' => str_repeat('•', max(0, strlen($this->payout->bank_account_number) - 4)) . substr($this->payout->bank_account_number, -4),
                    'requested_at' => $this->payout->requested_at?->toISOString(),
                    'completed_at' => $this->payout->completed_at?->toISOString(),
                ];
            }),
        ];
    }
}
