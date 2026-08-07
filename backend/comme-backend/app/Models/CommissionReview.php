<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionReview extends Model
{
    protected $fillable = [
        'commission_id',
        'artist_profile_id',
        'user_id',
        'rating',
        'title',
        'comment',
        'recommended',
        'artist_reply',
        'artist_replied_at',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'recommended' => 'boolean',
            'artist_replied_at' => 'datetime',
        ];
    }

    // Relationships
    public function commission(): BelongsTo
    {
        return $this->belongsTo(Commission::class);
    }

    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}