<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
    public function commission()
    {
        return $this->belongsTo(Commission::class);
    }

    public function artistProfile()
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}