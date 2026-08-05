<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\RevisionItemType;

class CommissionRevisionItem extends Model
{
    protected $fillable = [
        'commission_revision_id',
        'type',
        'old_value',
        'new_value',
    ];

    protected function casts(): array
    {
        return [
            'type' => RevisionItemType::class,
        ];
    }

    // Relationships
    public function revision(): BelongsTo
    {
        return $this->belongsTo(CommissionRevision::class);
    }
}