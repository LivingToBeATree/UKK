<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArtistTip extends Model
{
    protected $table = 'artist_tips';

    protected $fillable = [
        'artist_profile_id',
        'user_id',
        'supporter_name',
        'supporter_email',
        'amount',
        'message',
        'status',
        'snap_token',
        'transaction_id',
        'payment_type',
        'settled_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'artist_profile_id' => 'integer',
            'user_id' => 'integer',
            'settled_at' => 'datetime',
        ];
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
