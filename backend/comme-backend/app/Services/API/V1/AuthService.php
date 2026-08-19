<?php

namespace App\Services\API\V1;

use App\Models\User;
use Illuminate\Http\Request;

class AuthService
{
    /**
     * How many devices to remember per user before evicting the oldest.
     */
    private const MAX_KNOWN_DEVICES = 5;

    /**
     * Deterministic: the same user/browser pair always hashes to the same
     * value, so normal IP changes do not look like a new device.
     */
    public function hashDevice(User $user, Request $request): string
    {
        return hash('sha256', $user->id.'|'.$request->userAgent());
    }

    public function isDeviceKnown(User $user, string $deviceHash): bool
    {
        return collect($user->known_devices ?? [])->contains('hash', $deviceHash);
    }

    /**
     * Call this on every successful login: updates last_seen_at if the
     * device is already known, or adds it fresh if not.
     */
    public function rememberDevice(User $user, string $deviceHash, Request $request): void
    {
        $devices = collect($user->known_devices ?? []);
        $existingIndex = $devices->search(fn ($device) => $device['hash'] === $deviceHash);

        if ($existingIndex !== false) {
            $devices->put($existingIndex, [
                ...$devices->get($existingIndex),
                'last_seen_at' => now()->toIso8601String(),
            ]);
        } else {
            $devices->push([
                'hash' => $deviceHash,
                'user_agent' => $request->userAgent(),
                'first_seen_at' => now()->toIso8601String(),
                'last_seen_at' => now()->toIso8601String(),
            ]);
        }

        if ($devices->count() > self::MAX_KNOWN_DEVICES) {
            $devices = $devices->sortByDesc('last_seen_at')->take(self::MAX_KNOWN_DEVICES);
        }

        $user->forceFill(['known_devices' => $devices->values()->all()])->save();
    }

    /**
     * Pairs naturally with UserController::logoutOtherDevices().
     */
    public function forgetOtherDevices(User $user, string $currentDeviceHash): void
    {
        $devices = collect($user->known_devices ?? [])
            ->filter(fn ($device) => $device['hash'] === $currentDeviceHash)
            ->values();

        $user->forceFill(['known_devices' => $devices->values()->all()])->save();
    }
}
