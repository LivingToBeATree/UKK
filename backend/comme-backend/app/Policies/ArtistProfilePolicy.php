<?php

namespace App\Policies;

use App\Models\ArtistProfile;
use App\Models\User;

class ArtistProfilePolicy
{
    public function before(?User $user, string $ability): ?bool
    {
        return $user?->isAdmin() ? true : null;
    }
 
    public function viewAny(?User $user): bool
    {
        return true;
    }
 
    public function view(?User $user, ArtistProfile $artistProfile): bool
    {
        return true;
    }
 
    /**
     * Direct creation of artist profiles without an application is reserved
     * for staff / admin roles. Regular users must apply through ArtistApplication.
     */
    public function create(User $user): bool
    {
        return $user->isStaff();
    }
 
    public function update(User $user, ArtistProfile $artistProfile): bool
    {
        return $user->id === $artistProfile->user_id;
    }
 
    public function delete(User $user, ArtistProfile $artistProfile): bool
    {
        return $user->id === $artistProfile->user_id;
    }
}
 