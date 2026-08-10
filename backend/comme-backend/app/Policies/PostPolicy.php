<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use App\Enum\PostVisibilityType;
use Illuminate\Auth\Access\Response;

class PostPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    public function viewAny(User $user): bool
    {
        return true;
    }
 
    public function view(User $user, Post $post): bool
    {
        if ($user->id === $post->user_id) {
            return true;
        }
 
        return match ($post->visibility) {
            PostVisibilityType::PUBLIC => true,
            // FOLLOWERS: confirm the requester actually follows the author.
            PostVisibilityType::FOLLOWERS => $post->user->followers()
                ->where('follower_id', $user->id)
                ->exists(),
            default => false,
        };
    }
 
    public function create(User $user): bool
    {
        return true;
    }
 
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
 
    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
 
    /**
     * Only relevant if soft deletes/moderation restoration is added.
     */
    public function restore(User $user, Post $post): bool
    {
        return false;
    }
 
    public function forceDelete(User $user, Post $post): bool
    {
        return false;
    }
}