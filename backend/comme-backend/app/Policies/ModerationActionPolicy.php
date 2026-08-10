<?php

namespace App\Policies;

// NOTE: ModerationAction doesn't exist as a model/migration in your codebase
// yet — this policy is written against the spec, ready for whenever you add
// it (fields per spec: type — WARNING, REMOVE_CONTENT, RESTORE_CONTENT,
// SUSPEND_USER, UNSUSPEND_USER — plus a required ticket_id).

use App\Models\ModerationAction;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ModerationActionPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    public function viewAny(User $user): bool
    {
        return $user->isStaff();
    }
 
    public function view(User $user, ModerationAction $moderationAction): bool
    {
        return $user->isStaff();
    }
 
    /**
     * Whether the action is valid for the ticket's current state (e.g. no
     * duplicate SUSPEND_USER) is business logic, not authorization.
     */
    public function create(User $user): bool
    {
        return $user->isStaff();
    }
 
    // No update/delete — moderation actions are an immutable audit log.
}