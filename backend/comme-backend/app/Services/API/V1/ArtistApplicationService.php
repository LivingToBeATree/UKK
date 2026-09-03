<?php

namespace App\Services\API\V1;

use App\Enum\ArtistApplicationStatus;
use App\Enum\NotificationType;
use App\Models\ArtistApplication;
use App\Models\ArtistProfile;
use App\Models\Notification as InAppNotification;
use App\Models\User;
use App\Notifications\API\V1\ArtistApplication\ArtistApplicationApprovedNotification;
use App\Notifications\API\V1\ArtistApplication\ArtistApplicationRejectedNotification;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class ArtistApplicationService
{
    public function submit(User $user, array $data, array $sampleFiles = []): ArtistApplication
    {
        try {
            return DB::transaction(function () use ($user, $data, $sampleFiles): ArtistApplication {
                $sampleArtworks = [];
                foreach ($sampleFiles as $file) {
                    if ($file && $file->isValid()) {
                        $path = $file->store('artist_applications/samples', 'public');
                        $sampleArtworks[] = [
                            'url' => asset('storage/' . $path),
                            'file_path' => $path,
                            'file_name' => $file->getClientOriginalName(),
                            'file_size' => $file->getSize() ?: 0,
                            'mime_type' => $file->getClientMimeType() ?: 'image/jpeg',
                        ];
                    }
                }

                $application = ArtistApplication::create([
                    'user_id' => $user->id,
                    'bio' => $data['bio'] ?? null,
                    'portfolio_links' => $data['portfolio_links'] ?? [],
                    'sample_artworks' => !empty($sampleArtworks) ? $sampleArtworks : null,
                    'website' => $data['website'] ?? null,
                    'social_links' => $data['social_links'] ?? [],
                    'status' => ArtistApplicationStatus::PENDING,
                    'submitted_at' => now(),
                ]);

                // Notify staff members via in-app notification
                $staffUsers = User::whereIn('role', ['admin', 'moderator'])->get();
                foreach ($staffUsers as $staff) {
                    InAppNotification::create([
                        'user_id' => $staff->id,
                        'actor_id' => $user->id,
                        'type' => NotificationType::ARTIST_APPLICATION_SUBMITTED,
                        'title' => 'New Artist Application',
                        'message' => "{$user->display_name} has submitted an application for artist review.",
                        'notifiable_type' => ArtistApplication::class,
                        'notifiable_id' => $application->id,
                    ]);
                }

                return $application;
            });
        } catch (UniqueConstraintViolationException) {
            // Two concurrent submissions raced past the PHP canApplyForArtistProfile()
            // check; the partial unique index (user_id WHERE status='pending') caught the
            // second one. Return a 409 so the client can handle it gracefully.
            throw new ConflictHttpException('You already have a pending artist application.');
        }
    }

    public function approve(ArtistApplication $application, User $reviewer): ArtistProfile
    {
        return DB::transaction(function () use ($application, $reviewer): ArtistProfile {
            // Second line of defence (DB unique constraint is the first):
            // refuse the operation cleanly if the user somehow already has a profile.
            if ($application->user->hasArtistProfile()) {
                throw new \LogicException(
                    "User [{$application->user_id}] already has an artist profile. Cannot approve application [{$application->id}]."
                );
            }

            $application->update([
                'status' => ArtistApplicationStatus::APPROVED,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            $profile = ArtistProfile::create([
                'user_id' => $application->user_id,
                'bio' => $application->bio,
                'website' => $application->website,
                'social_links' => $application->social_links,
                'commission_open' => true,
            ]);

            $applicant = $application->user;

            $applicant->notify(new ArtistApplicationApprovedNotification($application));

            InAppNotification::create([
                'user_id' => $applicant->id,
                'actor_id' => $reviewer->id,
                'type' => NotificationType::ARTIST_APPLICATION_APPROVED,
                'title' => 'Artist Application Approved',
                'message' => 'Congratulations! Your application to become a verified artist has been approved.',
                'notifiable_type' => ArtistProfile::class,
                'notifiable_id' => $profile->id,
            ]);

            return $profile;
        });
    }

    public function reject(ArtistApplication $application, User $reviewer, string $reason): ArtistApplication
    {
        return DB::transaction(function () use ($application, $reviewer, $reason): ArtistApplication {
            $application->update([
                'status' => ArtistApplicationStatus::REJECTED,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'rejection_reason' => $reason,
            ]);

            $applicant = $application->user;

            $applicant->notify(new ArtistApplicationRejectedNotification($application));

            InAppNotification::create([
                'user_id' => $applicant->id,
                'actor_id' => $reviewer->id,
                'type' => NotificationType::ARTIST_APPLICATION_REJECTED,
                'title' => 'Artist Application Update',
                'message' => 'Your artist application was not approved. Feedback: ' . $reason,
                'notifiable_type' => ArtistApplication::class,
                'notifiable_id' => $application->id,
            ]);

            return $application;
        });
    }
}
