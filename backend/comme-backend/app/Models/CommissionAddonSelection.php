<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Not to be confused with CommissionAddons model, that model represents what CAN be added to a commission option, 
// this model on the other hand represents what HAS been added to a commission by a client.
class CommissionAddonSelection extends Model
{
    protected $fillable = [
        'commission_id',
        'commission_addon_id',
        // title here serves as a snapshot in case the addon's title changes in the future
        'title',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    public function commission(): BelongsTo
    {
        return $this->belongsTo(Commission::class);
    }

    public function addon(): BelongsTo
    {
        return $this->belongsTo(CommissionAddon::class, 'commission_addon_id');
    }
}