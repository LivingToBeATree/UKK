<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\MediaType;

class PortfolioMedia extends Model
{
    protected $fillable = [
        'portfolio_id',
        'file_name',
        'file_path',
        'media_type',
        'sort_order',
        'alt_text',
        // indicates if this media is the cover image for the portfolio
        'is_thumbnail'
        
    ];

    protected function casts(): array
    {
        return [
            'is_thumbnail' => 'boolean',
            'sort_order' => 'integer',
            'media_type' => MediaType::class,
        ];
    }

    // Relationships
    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }

    // Helpers
    public function isThumbnail(): bool
    {
        return $this->is_thumbnail;
    }
}