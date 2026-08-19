<?php

namespace App\Models;

use App\Enum\UserRole;
use Illuminate\Database\Eloquent\Model;

class PendingRegistration extends Model
{
    protected $fillable = [
        'username',
        'display_name',
        'email',
        'password',
        'role',
        'code',
        'attempts',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'expires_at' => 'datetime',
        ];
    }
}
