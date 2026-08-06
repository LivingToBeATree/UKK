<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Follow extends Model
{
    protected $fillable = [
        'followed_id',
        'following_id',
    ];

    // Relationships
    public function follower()
    {
        return $this->belongsTo(User::class, 'following_id');
    }

    public function followed()
    {
        return $this->belongsTo(User::class, 'followed_id');
    }
}