<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use Illuminate\Auth\Access\Response;
 
class TicketMessagePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    public function view(User $user, TicketMessage $ticketMessage): bool
    {
        return $user->isStaff()
            || $user->id === $ticketMessage->ticket->report->user_id;
    }
 
    /**
     * No TicketMessage instance yet — pass the target Ticket:
     *   $this->authorize('create', [TicketMessage::class, $ticket]);
     */
    public function create(User $user, Ticket $ticket): bool
    {
        return $user->isStaff()
            || $user->id === $ticket->report->user_id;
    }
}
 