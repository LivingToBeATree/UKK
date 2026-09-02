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
            'commission_service_id' => $this->commission_service_id,
            'commission_option_id' => $this->commission_option_id,
            'artist_profile_id' => $this->artist_profile_id,
            'user_id' => $this->user_id,
            'status' => $this->status?->value ?? $this->status,
            'description' => $this->description,
            'deadline' => $this->deadline instanceof \DateTimeInterface ? $this->deadline->toISOString() : ($this->deadline ? (string) $this->deadline : null),
            'delivered_at' => $this->delivered_at?->toISOString(),
            'review_deadline' => $this->review_deadline?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'total_price' => (float) $this->total_price,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'commission_service' => new CommissionServiceResource($this->whenLoaded('commissionService')),
            'commission_option' => new CommissionOptionResource($this->whenLoaded('commissionOption')),
            'artist_profile' => new ArtistProfileResource($this->whenLoaded('artistProfile')),
            'user' => new UserResource($this->whenLoaded('user')),
            'review' => new CommissionReviewResource($this->whenLoaded('review')),
            'messages' => CommissionMessageResource::collection($this->whenLoaded('messages')),
            'addons_selections' => $this->whenLoaded('addonsSelections'),
            'payout' => $this->whenLoaded('payout', function () {
                return [
                    'id' => $this->payout->id,
                    'amount' => (float) $this->payout->amount,
                    'status' => $this->payout->status?->value ?? $this->payout->status,
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
