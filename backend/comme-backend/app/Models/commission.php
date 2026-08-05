<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\CommissionStatus;

class Commission extends Model
{
    protected $fillable = [
        'commission_service_id',
        'commission_option_id',
        'artist_profile_id',
        'user_id',
        'status',
        'notes',
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'status' => CommissionStatus::class
        ];
    }

    public function commissionService(): BelongsTo
    {
        return $this->belongsTo(CommissionService::class);
    }

    public function commissionOption(): BelongsTo
    {
        return $this->belongsTo(CommissionOption::class);
    }

    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(CommissionMessage::class);
    }

    public function addonsSelections(): HasMany
    {
        return $this->hasMany(CommissionAddonsSelection::class);
    }
}