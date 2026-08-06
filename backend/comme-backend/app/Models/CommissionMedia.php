<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionMedia extends Media
{
    protected $fillable = [
        'commission_id',
        'file_name',
        'file_path',
        'media_type',
        'file_size',
        'mime_type',
        'sort_order',
    ];

    public function commission(): BelongsTo
    {
        return $this->belongsTo(Commission::class);
    }
}