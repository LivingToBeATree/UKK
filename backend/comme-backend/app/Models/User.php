<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;                                                                                                                                                                                                                                                                                                                                  
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Enum\UserRole;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

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

    // helpers
    public function hasArtistProfile(): bool
    {
        return $this->artistProfile()->exists();
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