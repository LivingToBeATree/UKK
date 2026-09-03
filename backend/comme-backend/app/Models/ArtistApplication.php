<?php

namespace App\Models;

use App\Enum\ArtistApplicationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArtistApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'portfolio_links',
        'sample_artworks',
        'website',
        'social_links',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ArtistApplicationStatus::class,
            'portfolio_links' => 'array',
            'sample_artworks' => 'array',
            'social_links' => 'array',
            'reviewed_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Helpers
    public function isPending(): bool
    {
        return $this->status === ArtistApplicationStatus::PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === ArtistApplicationStatus::APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === ArtistApplicationStatus::REJECTED;
    }
}
