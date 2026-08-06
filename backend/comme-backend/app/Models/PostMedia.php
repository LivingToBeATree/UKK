<?php

namespace App\Models;

class PostMedia extends Media
{
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

}