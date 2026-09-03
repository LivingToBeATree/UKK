<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModerationLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type instanceof \App\Enum\ModerationActionType ? $this->type->value : (string) $this->type,
            'notes' => $this->notes,
            'actor' => $this->user ? [
                'id' => $this->user->id,
                'username' => $this->user->username,
                'display_name' => $this->user->display_name,
                'role' => $this->user->role instanceof \App\Enum\UserRole ? $this->user->role->value : (string) $this->user->role,
                'avatar_url' => $this->user->avatar ? asset('storage/' . $this->user->avatar) : null,
            ] : null,
            'ticket' => $this->ticket ? [
                'id' => $this->ticket->id,
                'priority' => $this->ticket->priority instanceof \App\Enum\TicketPriority ? $this->ticket->priority->value : (string) $this->ticket->priority,
                'status' => $this->ticket->closed_at ? 'closed' : 'open',
            ] : null,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
