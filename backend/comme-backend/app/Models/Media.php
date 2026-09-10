<?php

namespace App\Models;

use App\Enum\MediaType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    protected $table = 'medias';

    protected $fillable = [
        'user_id',
        'file_name',
        'file_path',
        'disk',
        'media_type',
        'file_size',
        'thumbnail_path',
        'mime_type',
        'sort_order',
        'is_thumbnail',
    ];
    
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'file_size' => 'integer',
            'sort_order' => 'integer',
            'is_thumbnail' => 'boolean',
            'media_type' => MediaType::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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

    public function isPrivate(): bool
    {
        return in_array($this->disk, ['private', 'local'], true);
    }

    public function getDisk(): string
    {
        return $this->disk ?: 'public';
    }

    public function thumbnailUrl(): ?string
    {
        if (empty($this->thumbnail_path)) {
            return null;
        }

        if ($this->isPrivate()) {
            return route('api.v1.media.private.download', ['media' => $this->id, 'type' => 'thumb']);
        }

        return \Illuminate\Support\Facades\Storage::disk($this->getDisk())->url($this->thumbnail_path);
    }
}
