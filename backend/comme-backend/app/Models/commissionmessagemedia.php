<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\MediaType;

class CommissionMessageMedia extends Model
{
    protected $fillable = [
        'commission_message_id',
        'file_name',
        'file_path',
        'media_type'
    ];

    protected function casts(): array
    {
        return [
            'media_type' => MediaType::class,
        ];
    }

    // Relationships
    public function commissionMessage(): BelongsTo
    {
        return $this->belongsTo(CommissionMessage::class);
    }
}