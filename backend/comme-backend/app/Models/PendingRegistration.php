<?php

namespace App\Models;

use App\Enum\UserRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;

class PendingRegistration extends Model
{
    use MassPrunable;

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

    /**
     * Determine the prunable model query for abandoned pending registrations.
     */
    public function prunable(): Builder
    {
        return static::where('expires_at', '<=', now());
    }
}
