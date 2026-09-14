<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommissionAddon extends Model
{
    protected $fillable = [
        'commission_option_id',
        'title',
        'description',
        'additional_price',
        'base_currency',
        'regional_prices',
    ];

    protected function casts(): array
    {
        return [
            'additional_price' => 'decimal:2',
            'regional_prices' => 'array',
        ];
    }

    // Relationships
    public function commissionOption(): BelongsTo
    {
        return $this->belongsTo(CommissionOption::class);
    }

    public function selections(): HasMany
    {
        return $this->hasMany(CommissionAddonSelection::class, 'commission_addon_id');
    }
}