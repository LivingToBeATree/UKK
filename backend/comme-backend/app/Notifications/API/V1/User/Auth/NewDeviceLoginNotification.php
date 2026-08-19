<?php

namespace App\Notifications\API\V1\User\Auth;

use DateTimeInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewDeviceLoginNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $ipAddress,
        public readonly string $userAgent,
        public readonly DateTimeInterface|string $loginTime,
    ) {}

    public function via(mixed $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $timeString = $this->loginTime instanceof DateTimeInterface
            ? $this->loginTime->format('M d, Y H:i:s T')
            : (string) $this->loginTime;

        return (new MailMessage)
            ->subject('Security Alert: New Login to Your Account')
            ->view('emails.auth.new-device', [
                'user' => $notifiable,
                'ipAddress' => $this->ipAddress,
                'userAgent' => $this->userAgent,
                'loginTime' => $timeString,
            ])
            ->text('emails.auth.new-device-text', [
                'user' => $notifiable,
                'ipAddress' => $this->ipAddress,
                'userAgent' => $this->userAgent,
                'loginTime' => $timeString,
            ]);
    }
}
