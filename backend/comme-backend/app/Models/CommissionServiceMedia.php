<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionServiceMedia extends Media
{
    protected $fillable = [
        'commission_service_id',
        'file_name',
        'file_path',
        'file_size',
        'media_type',
        'mime_type',
        'sort_order',
    ];

    // Relationships
    public function commissionService(): BelongsTo
    {
        return $this->belongsTo(CommissionService::class);
    }
}