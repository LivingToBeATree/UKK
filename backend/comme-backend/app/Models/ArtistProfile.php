<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ArtistProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'banner',
        'commission_open',
        'website',
        'social_links',
    ];

    protected function casts(): array
    {
        return [
            'commission_open' => 'boolean',
            'social_links' => 'array',
        ];
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function portfolios(): HasMany
    {
        return $this->hasMany(Portfolio::class);
    }

    public function commissionServices(): HasMany
    {
        return $this->hasMany(CommissionService::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(CommissionReview::class);
    }

    public function payoutAccount(): HasOne
    {
        return $this->hasOne(ArtistPayoutAccount::class)->where('is_active', true)->latestOfMany();
    }

    public function payoutAccounts(): HasMany
    {
        return $this->hasMany(ArtistPayoutAccount::class);
    }

    public function followers(): HasMany
    {
        return $this->user->followers();
    }

    // Helpers
    public function isOpen(): bool
    {
        return $this->commission_open;
    }
}