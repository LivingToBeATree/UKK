<?php

namespace App\Services\API\V1;

use App\Enum\UserRole;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Notifications\API\V1\User\Auth\RegistrationCodeNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

class RegistrationService
{
    private const CODE_TTL_MINUTES = 15;

    /**
     * Nothing is written to users here. The registration data sits in a
     * temporary table until confirm() receives the matching inbox code.
     */
    public function initiate(array $data): void
    {
        $email = mb_strtolower($data['email']);
        $code = (string) random_int(100000, 999999);

        PendingRegistration::updateOrCreate(['email' => $email], [
            'username' => $data['username'],
            'display_name' => $data['display_name'],
            'email' => $email,
            'password' => Hash::make($data['password']),
            'role' => UserRole::USER,
            'code' => Hash::make($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
        ]);

        Notification::route('mail', $email)->notify(new RegistrationCodeNotification($code, self::CODE_TTL_MINUTES));
    }

    public function confirm(string $email, string $code): ?User
    {
        return DB::transaction(function () use ($email, $code): ?User {
            $pending = PendingRegistration::query()
                ->where('email', mb_strtolower($email))
                ->lockForUpdate()
                ->first();

            if (! $pending || $pending->expires_at->isPast()) {
                $pending?->delete();

                return null;
            }

            if (! Hash::check($code, $pending->code)) {
                $pending->increment('attempts');

                if ($pending->attempts >= 5) {
                    $pending->delete();
                }

                return null;
            }

            if (User::where('email', $pending->email)->exists() || User::where('username', $pending->username)->exists()) {
                $pending->delete();

                return null;
            }

            $user = User::forceCreate([
                'username' => $pending->username,
                'display_name' => $pending->display_name,
                'email' => $pending->email,
                'password' => $pending->password,
                'role' => $pending->role,
                'email_verified_at' => now(),
            ]);

            $pending->delete();

            event(new Registered($user));

            return $user;
        });
    }
}
