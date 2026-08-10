<?php

namespace App\Policies;

use App\Models\Portfolio;
use App\Models\User;
use App\Enum\CommissionVisibility;
use Illuminate\Auth\Access\Response;

class PortfolioPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    public function viewAny(User $user): bool
    {
        return true;
    }
 
    public function view(User $user, Portfolio $portfolio): bool
    {
        if ($user->id === $portfolio->artistProfile->user_id) {
            return true;
        }
 
        return match ($portfolio->visibility) {
            CommissionVisibility::PUBLIC => true,
            // RESTRICTED/ENLISTED need an allow-list this schema doesn't
            // track yet — treat as owner-only until that's added.
            default => false,
        };
    }
 
    public function create(User $user): bool
    {
        return $user->hasArtistProfile();
    }
 
    public function update(User $user, Portfolio $portfolio): bool
    {
        return $user->id === $portfolio->artistProfile->user_id;
    }
 
    public function delete(User $user, Portfolio $portfolio): bool
    {
        return $user->id === $portfolio->artistProfile->user_id;
    }
 
    /**
     * Only relevant once/if soft deletes are added to portfolios.
     */
    public function restore(User $user, Portfolio $portfolio): bool
    {
        return false;
    }
 
    public function forceDelete(User $user, Portfolio $portfolio): bool
    {
        return false;
    }
}