<?php

namespace App\Policies;

use App\Models\Commission;
use App\Models\CommissionReview;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CommissionReviewPolicy
{
    public function before(?User $user, string $ability): ?bool
    {
        return $user?->isAdmin() ? true : null;
    }

    /**
     * Visibility rules for reviews (e.g. only on completed commissions)
     * are enforced by the query/business logic, not this policy.
     */
    public function view(?User $user, CommissionReview $commissionReview): bool
    {
        return true;
    }

    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * There's no CommissionReview instance yet — pass the target Commission
     * so we can check it's actually this user's commission:
     *   $this->authorize('create', [CommissionReview::class, $commission]);
     * Whether the commission qualifies (e.g. must be completed) is checked
     * in the controller/Form Request, not here.
     */
    public function create(User $user, Commission $commission): bool
    {
        return $user->id === $commission->user_id;
    }

    public function update(User $user, CommissionReview $commissionReview): bool
    {
        return $user->id === $commissionReview->user_id;
    }

    public function delete(User $user, CommissionReview $commissionReview): bool
    {
        return $user->id === $commissionReview->user_id;
    }

    public function artistReply(User $user, CommissionReview $commissionReview): bool
    {
        return $user->id === $commissionReview->artistProfile->user_id;
    }
}

