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
            'bank_account_number' => 'encrypted',
        ];
    }

    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    /**
     * Return masked account number for secure API serialization.
     * Example: 1234567890 -> ••••••7890
     *
     * Works transparently with the 'encrypted' cast — $this->bank_account_number
     * returns the decrypted plaintext, which we then mask.
     */
    public function getMaskedAccountNumberAttribute(): string
    {
        $number = $this->bank_account_number;
        if (empty($number)) {
            return '';
        }

        $len = strlen($number);
        if ($len <= 4) {
            return str_repeat('•', max(0, $len - 1)) . substr($number, -1);
        }

        return str_repeat('•', $len - 4) . substr($number, -4);
    }
}
