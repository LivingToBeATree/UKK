<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enum\TicketPriority;

class Ticket extends Model
{
    protected $fillable = [
        'report_id',
        'assigned_to',
        'priority',
        'assigned_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'priority' => TicketPriority::class,
            'assigned_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    // Relations
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function moderationActions(): HasMany
    {
        return $this->hasMany(ModerationAction::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }
}