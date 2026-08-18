<?php

namespace App\Models;

use App\Enum\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionPayment extends Model
{
    protected $fillable = [
        'commission_id',
        'order_id',
        'midtrans_transaction_id',
        'snap_token',
        'status',
        'payment_type',
        'gross_amount',
        'paid_at',
        'raw_response',
    ];

    protected function casts(): array
    {
        return [
            'status' => PaymentStatus::class,
            'gross_amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'raw_response' => 'array',
        ];
    }

    public function commission(): BelongsTo
    {
        return $this->belongsTo(Commission::class);
    }
}
