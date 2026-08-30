<?php

namespace App\Models;

use App\Enum\PayoutStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionPayout extends Model
{
    protected $fillable = [
        'commission_id',
        'artist_profile_id',
        'amount',
        'status',
        'reference',
        'midtrans_payout_id',
        'bank_name',
        'bank_account_name',
        'bank_account_number',
        'requested_at',
        'completed_at',
        'failed_at',
        'failure_reason',
        'retry_count',
        'raw_response',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => PayoutStatus::class,
            'requested_at' => 'datetime',
            'completed_at' => 'datetime',
            'failed_at' => 'datetime',
            'retry_count' => 'integer',
            'raw_response' => 'array',
            'bank_account_number' => 'encrypted',
        ];
    }

    public function commission(): BelongsTo
    {
        return $this->belongsTo(Commission::class);
    }

    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }
}
