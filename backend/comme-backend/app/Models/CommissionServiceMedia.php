<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\MediaType;

class CommissionServiceMedia extends Model
{
    protected $fillable = [
        'commission_service_id',
        'file_name',
        'file_path',
        'media_type',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'media_type' => MediaType::class,
        ];
    }

    // Relationships
    public function commissionService(): BelongsTo
    {
        return $this->belongsTo(CommissionService::class);
    }
}