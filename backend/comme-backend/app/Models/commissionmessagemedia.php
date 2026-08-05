<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommissionMessage extends Model
{
    protected $fillable = [
        'commission_service_id',
        'user_id',
        'message',
    ];

    // Relationships
    public function commissionMessage()
    {
        return $this->belongsTo(CommissionMessage::class);
    }
}