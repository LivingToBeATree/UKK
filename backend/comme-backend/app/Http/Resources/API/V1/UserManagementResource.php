<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserManagementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'display_name' => $this->display_name,
            'email' => $this->email,
            'role' => $this->role->value,
            'avatar_url' => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'email_verified' => ! is_null($this->email_verified_at),
            'two_factor_enabled' => $this->hasTwoFactorEnabled(),
            'is_artist' => $this->hasArtistProfile(),
            'commission_open' => $this->artistProfile?->commission_open ?? false,
            'commissions_count' => $this->commissions_count ?? 0,
            'posts_count' => $this->posts_count ?? 0,
            'reports_count' => $this->reports_count ?? 0,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
