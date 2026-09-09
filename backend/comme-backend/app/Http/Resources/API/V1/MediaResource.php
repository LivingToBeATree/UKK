<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $mediaType = $this->media_type?->value ?? $this->media_type;
        $isVideo = $mediaType === 'video'
            || str_contains($this->mime_type ?? '', 'video')
            || (bool) preg_match('/\.(mp4|webm|mov|mkv)$/i', $this->file_path ?? '');

        $isValidPath = !empty($this->file_path) && $this->file_path !== '0';
        $url = $isValidPath
            ? ($isVideo ? url('/api/media/stream/' . $this->file_path) : Storage::disk('public')->url($this->file_path))
            : null;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'file_name' => $this->file_name,
            'file_path' => $this->file_path,
            'url' => $url,
            'media_type' => $mediaType,
            'file_size' => $this->file_size,
            'mime_type' => $this->mime_type,
            'sort_order' => $this->sort_order,
            'is_thumbnail' => (bool) $this->is_thumbnail,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
