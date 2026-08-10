<?php

namespace App\Policies;

use App\Models\PostLike;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PostLikePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    /**
     * Whether the target post is actually accessible is checked via
     * PostPolicy::view($user, $post) before this is called.
     */
    public function create(User $user): bool
    {
        return true;
    }
 
    public function delete(User $user, PostLike $postLike): bool
    {
        return $user->id === $postLike->user_id;
    }
}
 