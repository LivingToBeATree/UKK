<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isSelf = $request->user()?->id === $this->id;

        return [
            'id' => $this->id,
            'username' => $this->username,
            'display_name' => $this->display_name,
            'role' => $this->role->value,
            'avatar' => $this->avatar,
            'avatar_url' => $this->avatar,
            'banner' => $this->banner ?? $this->artistProfile?->banner,
            'banner_url' => $this->banner ?? $this->artistProfile?->banner,
            'bio' => $this->bio,
            'created_at' => $this->created_at,
            'followers_count' => $this->followers_count ?? $this->followers()->count(),
            'following_count' => $this->following_count ?? $this->following()->count(),
            'posts_count' => $this->posts_count ?? $this->posts()->count(),
            'is_following' => $request->user() ? $this->followers()->where('follower_id', $request->user()->id)->exists() : false,

            // Only visible to the user themselves — never on anyone else's
            // profile, no matter where this resource gets nested.
            'email' => $this->when($isSelf, $this->email),
            'two_factor_enabled' => $this->when($isSelf, $this->hasTwoFactorEnabled()),
            'is_suspended' => (bool) $this->suspended_at,
            'suspended_at' => $this->suspended_at,
            'suspension_reason' => $this->suspension_reason,
            'active_warning' => $this->when($isSelf || ($request->user()?->isStaff()), $this->active_warning),
            'warning_acknowledged_at' => $this->when($isSelf || ($request->user()?->isStaff()), $this->warning_acknowledged_at),
            'has_unacknowledged_warning' => $this->when($isSelf, $this->hasUnacknowledgedWarning()),
            'artist_profile' => $this->relationLoaded('artistProfile')
                ? ($this->artistProfile ? new ArtistProfileResource($this->artistProfile) : null)
                : ($this->artistProfile ? new ArtistProfileResource($this->artistProfile) : null),
        ];
    }
}
