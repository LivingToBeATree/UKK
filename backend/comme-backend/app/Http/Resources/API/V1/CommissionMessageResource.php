<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

class CommissionMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'commission_id' => $this->commission_id,
            'sender_id' => $this->sender_id,
            'recipient_id' => $this->recipient_id,
            'user_id' => $this->sender_id,
            'message' => $this->message,
            'message_type' => $this->message_type?->value,
            'created_at' => $this->created_at?->toISOString() ?? (string) $this->created_at,

            'user' => new UserResource($this->whenLoaded('user', fn () => $this->user, $this->whenLoaded('sender'))),
            'sender' => new UserResource($this->whenLoaded('sender', fn () => $this->sender, $this->whenLoaded('user'))),
            'recipient' => new UserResource($this->whenLoaded('recipient')),
            'media' => MediaResource::collection($this->whenLoaded('media')),
        ];
    }
}
