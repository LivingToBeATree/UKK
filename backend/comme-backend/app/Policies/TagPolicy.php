<?php

namespace App\Policies;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TagPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    public function viewAny(User $user): bool
    {
        return true;
    }
 
    public function view(User $user, Tag $tag): bool
    {
        return true;
    }
 
    public function create(User $user): bool
    {
        return $user->isStaff();
    }
 
    public function update(User $user, Tag $tag): bool
    {
        return $user->isStaff();
    }
 
    public function delete(User $user, Tag $tag): bool
    {
        return $user->isStaff();
    }
}
 