<?php

namespace App\Policies;

use App\Models\Commission;
use App\Models\User;

class CommissionPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    /**
     * The query itself must still be scoped to commissions involving the
     * current user — this only gates access to the listing endpoint.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Also gates access to this commission's messages, message media,
     * revisions, revision items, media, and addon selections.
     */
    public function view(User $user, Commission $commission): bool
    {
        return $user->id === $commission->user_id
            || $user->id === $commission->artistProfile->user_id;
    }

    /**
     * Whether the target service is actually open/valid is handled by
     * business logic, not this policy.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * General management — client should not arbitrarily update the whole
     * commission. More specific actions have their own abilities below.
     */
    public function update(User $user, Commission $commission): bool
    {
        return $user->id === $commission->artistProfile->user_id;
    }

    public function accept(User $user, Commission $commission): bool
    {
        return $user->id === $commission->artistProfile->user_id;
    }

    public function decline(User $user, Commission $commission): bool
    {
        return $user->id === $commission->artistProfile->user_id;
    }

    public function markDelivered(User $user, Commission $commission): bool
    {
        return $user->id === $commission->artistProfile->user_id;
    }

    public function confirmCompletion(User $user, Commission $commission): bool
    {
        return $user->id === $commission->user_id;
    }

    public function requestRevision(User $user, Commission $commission): bool
    {
        return $user->id === $commission->user_id;
    }

    /**
     * Only the buyer pays — whether the commission is actually in a
     * payable status (e.g. ACCEPTED, not already paid) is a business-state
     * check, handled in the controller, not here.
     */
    public function initiatePayment(User $user, Commission $commission): bool
    {
        return $user->id === $commission->user_id;
    }

    public function updateDeadline(User $user, Commission $commission): bool
    {
        return $user->id === $commission->artistProfile?->user_id;
    }

    public function proposeDeadline(User $user, Commission $commission): bool
    {
        return $user->id === $commission->artistProfile?->user_id;
    }

    public function acceptDeadline(User $user, Commission $commission): bool
    {
        return $user->id === $commission->user_id;
    }

    public function declineDeadline(User $user, Commission $commission): bool
    {
        return $user->id === $commission->user_id
            || $user->id === $commission->artistProfile?->user_id;
    }

    /**
     * Whether cancellation is currently allowed (based on status) is
     * handled by business logic, not this policy.
     */
    public function cancel(User $user, Commission $commission): bool
    {
        return $user->id === $commission->user_id
            || $user->id === $commission->artistProfile->user_id;
    }

    public function requestCancellation(User $user, Commission $commission): bool
    {
        $statusVal = $commission->status instanceof \App\Enum\CommissionStatus 
            ? $commission->status->value 
            : (string) $commission->status;

        return ($user->id === $commission->user_id || $user->id === $commission->artistProfile?->user_id)
            && in_array($statusVal, ['accepted', 'in_progress', 'waiting_for_client', 'revision'])
            && is_null($commission->cancellation_requested_by);
    }

    public function acceptCancellation(User $user, Commission $commission): bool
    {
        if (!$commission->cancellation_requested_by) {
            return false;
        }

        $isCounterpart = ($commission->cancellation_requested_by === $commission->user_id)
            ? $user->id === $commission->artistProfile?->user_id
            : $user->id === $commission->user_id;

        return $isCounterpart || $user->isStaff();
    }

    public function declineCancellation(User $user, Commission $commission): bool
    {
        if (!$commission->cancellation_requested_by) {
            return false;
        }

        return $user->id === $commission->user_id
            || $user->id === $commission->artistProfile?->user_id
            || $user->isStaff();
    }

    /**
     * Never delete directly — cancellation preserves commission history
     * instead.
     */
    public function delete(User $user, Commission $commission): bool
    {
        return false;
    }

    public function restore(User $user, Commission $commission): bool
    {
        return false;
    }

    public function forceDelete(User $user, Commission $commission): bool
    {
        return false;
    }
}
