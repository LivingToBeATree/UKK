<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommissionOption extends Model
{
    protected $fillable = [
        'commission_service_id',
        'title',
        'description',
        'base_price',
        'base_currency',
        'pricing_mode',
        'regional_prices',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'regional_prices' => 'array',
        ];
    }

    // Relationships
    public function commissionService(): BelongsTo
    {
        return $this->belongsTo(CommissionService::class);
    }

    public function addons(): HasMany
    {
        return $this->hasMany(CommissionAddon::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }
}