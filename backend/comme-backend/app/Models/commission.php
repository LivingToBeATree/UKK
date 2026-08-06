<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Enums\CommissionStatus;

class Commission extends Model
{
    protected $fillable = [
        'commission_service_id',
        'commission_option_id',
        'artist_profile_id',
        'user_id',
        'status',
        'description',
        'deadline',
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
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
        return $this->hasMany(CommissionAddonSelection::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(CommissionMedia::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(CommissionReview::class);
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(CommissionRevision::class);
    }
}