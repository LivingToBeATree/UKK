<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class NotificationPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    public function view(User $user, Notification $notification): bool
    {
        return $user->id === $notification->user_id;
    }
 
    /**
     * Notifications are created by application events/services, not
     * directly by users.
     */
    public function create(User $user): bool
    {
        return false;
    }
 
    /**
     * Covers marking a notification read/unread.
     */
    public function update(User $user, Notification $notification): bool
    {
        return $user->id === $notification->user_id;
    }
 
    public function delete(User $user, Notification $notification): bool
    {
        return $user->id === $notification->user_id;
    }
}
 