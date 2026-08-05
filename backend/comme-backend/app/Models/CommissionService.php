<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\ServiceStatus;

class CommissionService extends Model
{
    protected $fillable = [
        'artist_profile_id',
        'thumbnail_media_id',
        'name',
        'description',
        'status',
        'alt_text',
        'deadline'
    ];

    protected function casts(): array
    {
        return [
            'status' => ServiceStatus::class,
        ];
    }

    // Relationships
    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(CommissionServiceMedia::class);
    }

    public function thumbnailMedia(): BelongsTo
    {
        return $this->belongsTo(CommissionServiceMedia::class, 'thumbnail_media_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(CommissionOption::class);
    }

    // Helpers
    public function isOpen(): bool
    {
        return $this->status === ServiceStatus::OPEN;
    }

    public function isClosed(): bool
    {
        return $this->status === ServiceStatus::CLOSED;
    }

    public function isDraft(): bool
    {
        return $this->status === ServiceStatus::DRAFT;
    }
}