<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Enum\PostVisibilityType;

class Post extends Model
{
    protected $fillable = [
        'user_id',
        'portfolio_id',
        'content',
        'visibility',
        'commentable',
        'likes_count',
        'comments_count',
        'bookmarks_count',
    ];

    protected function casts(): array
    {
        return [
            'visibility' => PostVisibilityType::class,
            'commentable' => 'boolean',
            'likes_count' => 'integer',
            'comments_count' => 'integer',
            'bookmarks_count' => 'integer',
        ];
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(PostMedia::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(PostBookmark::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(PostComment::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }
}
