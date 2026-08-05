<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\MediaType;

class PostMedia extends Model
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

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'sort_order' => 'integer',
            'media_type' => MediaType::class,
        ];
    }
}