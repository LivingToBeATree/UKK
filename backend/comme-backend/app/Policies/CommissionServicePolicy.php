<?php

namespace App\Policies;

use App\Models\CommissionService;
use App\Models\User;

class CommissionServicePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    public function viewAny(User $user): bool
    {
        return true;
    }
 
    /**
     * Status/availability (open, closed, draft) is enforced by business
     * logic, not authorization.
     */
    public function view(User $user, CommissionService $commissionService): bool
    {
        return true;
    }
 
    public function create(User $user): bool
    {
        return $user->hasArtistProfile();
    }
 
    /**
     * Also gates management of this service's options, addons, media, and
     * tags — check `update` on the parent CommissionService before touching
     * any of those, rather than writing separate policies for them.
     */
    public function update(User $user, CommissionService $commissionService): bool
    {
        return $user->id === $commissionService->artistProfile->user_id;
    }
 
    public function delete(User $user, CommissionService $commissionService): bool
    {
        return $user->id === $commissionService->artistProfile->user_id;
    }
 
    public function restore(User $user, CommissionService $commissionService): bool
    {
        return false;
    }
 
    public function forceDelete(User $user, CommissionService $commissionService): bool
    {
        return false;
    }
}