<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommissionMessage extends Model
{
    protected $fillable = [
        'commission_id',
        'sender_id',
        'user_id',
        'message',
    ];

    protected function casts(): array
    {
        return [

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
        return $this->belongsTo(User::class, 'user_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(CommissionMessageMedia::class);
    }
} 