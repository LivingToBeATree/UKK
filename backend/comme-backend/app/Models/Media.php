<?php

namespace App\Models;

use App\Enums\MediaType;
use Illuminate\Database\Eloquent\Model;

abstract class Media extends Model
{
    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'sort_order' => 'integer',
            'is_thumbnail' => 'boolean',
            'media_type' => MediaType::class,
        ];
    }

    public function isThumbnail(): bool
    {
        return (bool) ($this->is_thumbnail ?? false);
    }
}
