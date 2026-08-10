<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
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
     * Public profile only — private fields are excluded
     * at the resource/serialization layer.
     */
    public function view(User $user, User $model): bool
    {
        return true;
    }

    /**
     * Registration happens as a guest and is handled
     * outside the policy layer.
     */
    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }

    /**
     * Users cannot delete themselves through the normal
     * policy path. Admins bypass this through before().
     */
    public function delete(User $user, User $model): bool
    {
        return false;
    }
}