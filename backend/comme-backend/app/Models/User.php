<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Enum\UserRole;
use App\Notifications\API\V1\User\Auth\ResetPasswordNotification;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Send password reset notification using custom branded email template.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'display_name',
        'email',
        'password',
        'role',
        'avatar',
        'bio'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            // Deliberately NOT in $fillable — this is only ever written by
            // AuthService during login, never accepted directly from a
            // client request, same reasoning as counters like likes_count.
            'known_devices' => 'array',
        ];
    }

    // Relationships
    public function artistProfile(): HasOne
    {
        return $this->hasOne(ArtistProfile::class);
    }

    public function sentCommissionMessages(): HasMany
    {
        return $this->hasMany(CommissionMessage::class, 'sender_id');
    }

    public function receivedCommissionMessages(): HasMany
    {
        return $this->hasMany(CommissionMessage::class, 'recipient_id');
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(CommissionReview::class);
    }

    public function requestedRevisions(): HasMany
    {
        return $this->hasMany(CommissionRevision::class, 'requester_id');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function postLikes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    public function postBookmarks(): HasMany
    {
        return $this->hasMany(PostBookmark::class);
    }

    public function postComments(): HasMany
    {
        return $this->hasMany(PostComment::class);
    }

    public function following(): HasMany
    {
        return $this->hasMany(Follow::class, 'follower_id');
    }

    public function followers(): HasMany
    {
        return $this->hasMany(Follow::class, 'followed_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function sentNotifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'actor_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'user_id');
    }

    public function handledReports(): HasMany
    {
        return $this->hasMany(Report::class, 'handled_by');
    }

    public function artistApplications(): HasMany
    {
        return $this->hasMany(ArtistApplication::class);
    }

    public function latestArtistApplication(): HasOne
    {
        return $this->hasOne(ArtistApplication::class)->latestOfMany();
    }

    // helpers
    public function hasArtistProfile(): bool
    {
        return $this->artistProfile()->exists();
    }

    public function hasPendingArtistApplication(): bool
    {
        return $this->artistApplications()->where('status', \App\Enum\ArtistApplicationStatus::PENDING)->exists();
    }

    public function canApplyForArtistProfile(): bool
    {
        return ! $this->hasArtistProfile() && ! $this->hasPendingArtistApplication();
    }

    public function isArtist(): bool
    {
        return $this->hasArtistProfile();
    }

    public function canAcceptCommissions(): bool
    {
        return $this->artistProfile?->isOpen() ?? false;
    }

    public function isUser(): bool
    {
        return $this->role === UserRole::USER;
    }

    public function isModerator(): bool
    {
        return $this->role === UserRole::MODERATOR;
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function isStaff(): bool
    {
        return $this->isModerator() || $this->isAdmin();
    }
}
