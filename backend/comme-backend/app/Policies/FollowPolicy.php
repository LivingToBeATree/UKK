<?php

namespace App\Policies;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FollowPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    /**
     * Following yourself, if that needs blocking, is checked in the
     * controller/Form Request against the target user_id, not here.
     */
    public function create(User $user): bool
    {
        return true;
    }
 
    public function delete(User $user, Follow $follow): bool
    {
        return $user->id === $follow->follower_id;
    }
}
 