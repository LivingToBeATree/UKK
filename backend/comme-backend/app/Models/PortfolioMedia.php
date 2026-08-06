<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioMedia extends Media
{
    protected $fillable = [
        'portfolio_id',
        'file_name',
        'file_path',
        'file_size',
        'media_type',
        'mime_type',
        'sort_order',
        'alt_text',
        // indicates if this media is the cover image for the portfolio
        'is_thumbnail'
    ];

    // Relationships
    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }
}