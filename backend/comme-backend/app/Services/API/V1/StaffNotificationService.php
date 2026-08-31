<?php

namespace App\Services\API\V1;

use App\Enum\NotificationType;
use App\Enum\UserRole;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class StaffNotificationService
{
    /**
     * Broadcast an operational alert to all staff members (Admins & Moderators).
     * If no staff users exist, logs a critical error rather than misdirecting to random customer accounts.
     */
    public static function notifyStaff(
        string $title,
        string $message,
        ?Model $notifiable = null,
        NotificationType $type = NotificationType::SYSTEM
    ): int {
        $staffRecipients = User::whereIn('role', [UserRole::ADMIN, UserRole::MODERATOR])->get();

        if ($staffRecipients->isEmpty()) {
            Log::critical("Operational Alert: {$title} — No staff or admin accounts found to receive notification. Payload: {$message}", [
                'notifiable_type' => $notifiable ? get_class($notifiable) : null,
                'notifiable_id' => $notifiable?->getKey(),
            ]);

            return 0;
        }

        $sentCount = 0;

        foreach ($staffRecipients as $staff) {
            Notification::firstOrCreate(
                [
                    'user_id' => $staff->id,
                    'type' => $type,
                    'notifiable_type' => $notifiable ? get_class($notifiable) : null,
                    'notifiable_id' => $notifiable?->getKey(),
                    'title' => $title,
                ],
                [
                    'message' => $message,
                ]
            );
            $sentCount++;
        }

        return $sentCount;
    }
}
