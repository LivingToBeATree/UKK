<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Enum\CommissionStatus;
use App\Traits\HasSlug;

class Commission extends Model
{
    use HasSlug;

    protected $fillable = [
        'slug',
        'commission_service_id',
        'commission_option_id',
        'artist_profile_id',
        'user_id',
        'status',
        'description',
        'deadline',
        'proposed_deadline',
        'deadline_proposal_note',
        'delivered_at',
        'review_deadline',
        'completed_at',
        'total_price',
        'cancellation_requested_by',
        'cancellation_reason',
        'cancellation_requested_at',
    ];

    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
            'status' => CommissionStatus::class,
            'deadline' => 'date',
            'proposed_deadline' => 'date',
            'delivered_at' => 'datetime',
            'review_deadline' => 'datetime',
            'completed_at' => 'datetime',
            'cancellation_requested_at' => 'datetime',
        ];
    }

    public function commissionService(): BelongsTo
    {
        return $this->belongsTo(CommissionService::class);
    }

    public function service(): BelongsTo
    {
        return $this->commissionService();
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

    public function cancellationRequester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancellation_requested_by');
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

    public function payment(): HasOne
    {
        return $this->hasOne(CommissionPayment::class)->latestOfMany();
    }

    public function payments(): HasMany
    {
        return $this->hasMany(CommissionPayment::class);
    }

    public function payout(): HasOne
    {
        return $this->hasOne(CommissionPayout::class)->latestOfMany();
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(CommissionPayout::class);
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(CommissionRevision::class);
    }

    public function getSlugSource(): string
    {
        $buyer = $this->user?->username ?? User::where('id', $this->user_id)->value('username') ?? 'order';
        $service = $this->commissionService?->name ?? CommissionService::where('id', $this->commission_service_id)->value('name') ?? 'commission';
        return "{$buyer}-{$service}";
    }
}
