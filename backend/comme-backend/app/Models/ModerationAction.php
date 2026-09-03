<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enum\ModerationActionType;

class ModerationAction extends Model
{
    protected $fillable = [
        'ticket_id',
        'user_id',
        'type',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'type' => ModerationActionType::class,
        ];
    }

    // Relationships
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}