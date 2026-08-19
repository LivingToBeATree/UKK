<?php

namespace App\Notifications\API\V1\ArtistApplication;

use App\Models\ArtistApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ArtistApplicationRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ArtistApplication $application,
    ) {}

    public function via(mixed $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Update on Your Artist Application')
            ->view('emails.artist-application.rejected', [
                'user' => $notifiable,
                'application' => $this->application,
                'rejectionReason' => $this->application->rejection_reason ?? 'Your application did not meet our current submission criteria.',
            ])
            ->text('emails.artist-application.rejected-text', [
                'user' => $notifiable,
                'application' => $this->application,
                'rejectionReason' => $this->application->rejection_reason ?? 'Your application did not meet our current submission criteria.',
            ]);
    }
}
