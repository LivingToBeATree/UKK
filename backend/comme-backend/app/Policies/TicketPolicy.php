<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TicketPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    public function viewAny(User $user): bool
    {
        return true;
    }
 
    public function view(User $user, Ticket $ticket): bool
    {
        return $user->isStaff()
            || ($ticket->report && $user->id === $ticket->report->user_id);
    }
 
    /**
     * Tickets are normally created automatically from a Report, not
     * directly by users.
     */
    public function create(User $user): bool
    {
        return false;
    }
 
    public function update(User $user, Ticket $ticket): bool
    {
        return $user->isStaff();
    }
 
    /**
     * Preserve moderation history — tickets are never deleted normally.
     */
    public function delete(User $user, Ticket $ticket): bool
    {
        return false;
    }
}