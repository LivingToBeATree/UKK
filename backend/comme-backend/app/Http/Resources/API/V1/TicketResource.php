<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'priority' => $this->priority?->value,
            'assigned_at' => $this->assigned_at,
            'closed_at' => $this->closed_at,

            'report' => new ReportResource($this->whenLoaded('report')),
            'assignee' => new UserResource($this->whenLoaded('assignee')),
            'messages' => TicketMessageResource::collection($this->whenLoaded('messages')),
            'moderation_actions' => ModerationActionResource::collection($this->whenLoaded('moderationActions')),
        ];
    }
}
