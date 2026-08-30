<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArtistPayoutAccount extends Model
{
    protected $fillable = [
        'artist_profile_id',
        'bank_name',
        'bank_account_name',
        'bank_account_number',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    /**
     * Return masked account number for secure API serialization
     * Example: 1234567890 -> ••••••7890
     */
    public function getMaskedAccountNumberAttribute(): string
    {
        $len = strlen($this->bank_account_number);
        if ($len <= 4) {
            return str_repeat('•', max(0, $len - 1)) . substr($this->bank_account_number, -1);
        }

        return str_repeat('•', $len - 4) . substr($this->bank_account_number, -4);
    }
}
