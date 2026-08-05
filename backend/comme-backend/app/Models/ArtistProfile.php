<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArtistProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'banner',
        'commission_open',
        'website',
        'social_links',
    ];

    protected $casts = [
        'commission_open' => 'boolean',
        'social_links' => 'array',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function portfolio(): HasMany
    {
        return $this->hasMany(Portfolio::class);
    }

    public function CommissionServices(): HasMany
    {
        return $this->hasMany(CommissionService::class);
    }

    // Helpers
    public function isOpen(): bool
    {
        return $this->commission_open;
    }
}