<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\VisibilityType;

class Portfolios extends Model
{
    protected $fillable = [
        'artist_profile_id',
        'thumbnail_media_id',
        'title',
        'description',
        'visibility',
        'starred',
    ];

    protected function casts(): array
    {
        return [
            'visibility' => VisibilityType::class,
            'starred' => 'boolean',
            'views' => 'integer',
            'likes' => 'integer',
            'bookmarks' => 'integer'
        ];
    }

    // Relationships
    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    public function thumbnailMedia(): BelongsTo
    {
        return $this->belongsTo(PortfolioMedia::class, 'thumbnail_media_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(PortfolioMedia::class);
    }
}