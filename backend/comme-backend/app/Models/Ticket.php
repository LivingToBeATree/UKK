<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\TicketPriority;

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
}