<?php

namespace App\Policies;

use App\Models\Media;
use App\Models\User;

class MediaPolicy
{
    public function before(?User $user, string $ability): ?bool
    {
        return $user?->isAdmin() ? true : null;
    }

    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the media metadata or asset.
     * Public media is freely viewable.
     * Private or commission-related media requires authentication and
     * participant/ownership verification.
     */
    public function view(?User $user, Media $media): bool
    {
        if ($media->isPrivate() || str_starts_with((string) $media->file_path, 'commissions/') || str_starts_with((string) $media->file_path, 'private/')) {
            if (! $user) {
                return false;
            }

            if ($user->isStaff() || $user->isAdmin()) {
                return true;
            }

            if ($media->user_id === $user->id) {
                return true;
            }

            // Check commission deliverables or message attachments
            $commissionMedia = \App\Models\CommissionMedia::where('file_path', $media->file_path)->first();
            if ($commissionMedia) {
                $commission = \App\Models\Commission::with('artistProfile')->find($commissionMedia->commission_id);
                if ($commission && ($commission->user_id === $user->id || $commission->artistProfile?->user_id === $user->id)) {
                    return true;
                }
            }

            $messageMedia = \App\Models\CommissionMessageMedia::with('commissionMessage.commission.artistProfile')
                ->where('file_path', $media->file_path)
                ->first();
            if ($messageMedia && $messageMedia->commissionMessage) {
                $commission = $messageMedia->commissionMessage->commission;
                if ($commission && ($commission->user_id === $user->id || $commission->artistProfile?->user_id === $user->id)) {
                    return true;
                }
            }

            return false;
        }

        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function delete(User $user, Media $media): bool
    {
        // Media can only be deleted by the user who uploaded it or an admin
        return $media->user_id === $user->id;
    }
}
