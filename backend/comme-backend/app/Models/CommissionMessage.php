<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enum\MessageType;

class CommissionMessage extends Model
{
    protected $fillable = [
        'commission_id',
        'sender_id',
        'recipient_id',
        'message',
        'message_type',
    ];

    protected function casts(): array
    {
        return [
        'message_type'=> MessageType::class,
        ];
    }

    // Relationships
    public function commission(): BelongsTo
    {
        return $this->belongsTo(Commission::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(CommissionMessageMedia::class);
    }
} 