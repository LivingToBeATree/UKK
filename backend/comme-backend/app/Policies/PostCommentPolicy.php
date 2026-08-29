<?php

namespace App\Policies;

use App\Models\PostComment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PostCommentPolicy
{
    public function before(?User $user, string $ability): ?bool
    {
        return $user?->isAdmin() ? true : null;
    }
 
    public function view(?User $user, PostComment $postComment): bool
    {
        return true;
    }
 
    public function create(User $user): bool
    {
        return true;
    }
 
    public function update(User $user, PostComment $postComment): bool
    {
        return $user->id === $postComment->user_id;
    }
 
    /**
     * Comment author, the post's owner, or staff can remove a comment.
     * Moderator access is granted explicitly here, per the global rule
     * that moderators don't get a blanket bypass.
     */
    public function delete(User $user, PostComment $postComment): bool
    {
        return $user->id === $postComment->user_id
            || $user->id === $postComment->post->user_id
            || $user->isStaff();
    }
}