<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ReportPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }
 
    public function viewAny(User $user): bool
    {
        return $user->isStaff();
    }
 
    /**
     * Assumes any staff member can view any report (shared moderation
     * queue), not just whoever it's assigned to — adjust to
     * $user->id === $report->handled_by if you want it assignee-only.
     */
    public function view(User $user, Report $report): bool
    {
        return $user->id === $report->user_id
            || $user->isStaff();
    }
 
    /**
     * Whether the reported entity is actually eligible to be reported is
     * checked in the controller/Form Request. The reporter identity is
     * always set from auth()->id(), never from client input.
     */
    public function create(User $user): bool
    {
        return true;
    }
 
    /**
     * Reporters cannot edit their own report after submitting it —
     * moderation-field updates (status, handled_by, etc.) are staff-only.
     */
    public function update(User $user, Report $report): bool
    {
        return $user->isStaff();
    }
 
    public function delete(User $user, Report $report): bool
    {
        return false;
    }
}
 