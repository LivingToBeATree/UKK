<?php

namespace App\Notifications\API\V1\ArtistApplication;

use App\Models\ArtistApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ArtistApplicationApprovedNotification extends Notification implements ShouldQueue
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
            ->subject('Congratulations! Your Artist Application Has Been Approved')
            ->view('emails.artist-application.approved', [
                'user' => $notifiable,
                'application' => $this->application,
            ])
            ->text('emails.artist-application.approved-text', [
                'user' => $notifiable,
                'application' => $this->application,
            ]);
    }
}
