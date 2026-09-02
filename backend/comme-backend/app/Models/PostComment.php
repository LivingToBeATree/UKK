<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PostComment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'post_id',
        'user_id',
        'content',
        'parent_comment_id',
    ];

    protected function casts(): array
    {
        return [
            'parent_comment_id' => 'integer',
        ];
    }

    // Relationships
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // self relantionships for nested comments
    public function parent(): BelongsTo
    {
        return $this->belongsTo(PostComment::class, 'parent_comment_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(PostComment::class, 'parent_comment_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(PostCommentLike::class, 'post_comment_id');
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(PostCommentBookmark::class, 'post_comment_id');
    }
}