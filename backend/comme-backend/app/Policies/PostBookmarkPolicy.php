<?php

namespace App\Policies;

use App\Models\PostBookmark;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PostBookmarkPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    public function create(User $user): bool
    {
        return true;
    }
 
    public function delete(User $user, PostBookmark $postBookmark): bool
    {
        return $user->id === $postBookmark->user_id;
    }
}
 