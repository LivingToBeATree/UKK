<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Enum\CommissionVisibility;

class Portfolio extends Model
{
    protected $fillable = [
        'artist_profile_id',
        'thumbnail_media_id',
        'title',
        'description',
        'visibility',
        'is_taken_down',
        'taken_down_reason',
        'starred',
    ];

    protected function casts(): array
    {
        return [
            'visibility' => CommissionVisibility::class,
            'is_taken_down' => 'boolean',
            'starred' => 'boolean',
            'views' => 'integer',
            'likes' => 'integer',
            'bookmarks' => 'integer',
        ];
    }

    // Relationships
    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    public function thumbnailMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'thumbnail_media_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(PortfolioMedia::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }
}