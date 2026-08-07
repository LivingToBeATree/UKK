<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostMedia extends Media
{
    protected $table = 'post_medias';

    protected $fillable = [
        'post_id',
        'file_name',
        'file_path',
        'file_size',
        'media_type',
        'mime_type',
        'sort_order',
        'alt_text',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
