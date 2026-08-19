<?php

namespace App\Policies;

use App\Models\ArtistApplication;
use App\Models\User;

class ArtistApplicationPolicy
{
    /**
     * NOTE: No before() hook here deliberately.
     * approve() and reject() each enforce isPending() — a before() returning
     * true for admins would bypass that guard and allow a second approval on
     * an already-reviewed application, which could create duplicate ArtistProfiles.
     * Admins are still covered via the isStaff() check inside each method.
     */

    public function viewAny(User $user): bool
    {
        return $user->isStaff();
    }

    public function view(User $user, ArtistApplication $artistApplication): bool
    {
        return $user->isStaff() || $user->id === $artistApplication->user_id;
    }

    public function create(User $user): bool
    {
        return $user->canApplyForArtistProfile();
    }

    public function approve(User $user, ArtistApplication $artistApplication): bool
    {
        return $user->isStaff() && $artistApplication->isPending();
    }

    public function reject(User $user, ArtistApplication $artistApplication): bool
    {
        return $user->isStaff() && $artistApplication->isPending();
    }
}
