<?php

namespace App\Notifications\API\V1\User\Auth;

use DateTimeInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly DateTimeInterface|string $changedAt,
        public readonly ?string $ipAddress = null,
    ) {}

    public function via(mixed $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $timeString = $this->changedAt instanceof DateTimeInterface
            ? $this->changedAt->format('M d, Y H:i:s T')
            : (string) $this->changedAt;

        return (new MailMessage)
            ->subject('Security Alert: Your Password Was Changed')
            ->view('emails.auth.password-changed', [
                'user' => $notifiable,
                'changedAt' => $timeString,
                'ipAddress' => $this->ipAddress ?? 'Unknown IP',
            ])
            ->text('emails.auth.password-changed-text', [
                'user' => $notifiable,
                'changedAt' => $timeString,
                'ipAddress' => $this->ipAddress ?? 'Unknown IP',
            ]);
    }
}
