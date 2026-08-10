<?php

namespace App\Policies;

use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ArtistProfilePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    public function viewAny(User $user): bool
    {
        return true;
    }
 
    public function view(User $user, ArtistProfile $artistProfile): bool
    {
        return true;
    }
 
    /**
     * Ownership ("for themselves, not another user") is enforced by always
     * setting user_id from auth()->id() in the controller, not here.
     */
    public function create(User $user): bool
    {
        return ! $user->hasArtistProfile();
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
 