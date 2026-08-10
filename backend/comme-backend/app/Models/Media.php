<?php

namespace App\Models;

use App\Enum\MediaType;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $table = 'medias';
    
    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'sort_order' => 'integer',
            'is_thumbnail' => 'boolean',
            'media_type' => MediaType::class,
        ];
    }

    // Helpers
    public function isImage(): bool
    {
        return $this->media_type === MediaType::IMAGE;
    }

    public function isVideo(): bool
    {
        return $this->media_type === MediaType::VIDEO;
    }

    public function isThumbnail(): bool
    {
        return (bool) ($this->is_thumbnail ?? false);
    }

    public function filename(): string
    {
        return pathinfo($this->file_name, PATHINFO_FILENAME);
    }

    public function isUploadComplete(): bool
    {
        return !empty($this->file_path);
    }
}
