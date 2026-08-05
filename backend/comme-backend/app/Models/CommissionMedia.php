<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\MediaType;

class CommissionMedia extends Model
{
    protected $fillable = [
        'commission_id',
        'file_name',
        'file_path',
        'media_type',
        'file_size',
        'mime_type',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'media_type' => MediaType::class,
            'file_size' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function commission(): BelongsTo
    {
        return $this->belongsTo(Commission::class);
    }
}