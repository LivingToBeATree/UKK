<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionMessageMedia extends Media
{
    protected $fillable = [
        'commission_message_id',
        'file_name',
        'file_path',
        'file_size',
        'media_type',
        'mime_type',
        'sort_order',
    ];

    // Relationships
    public function commissionMessage(): BelongsTo
    {
        return $this->belongsTo(CommissionMessage::class);
    }
}