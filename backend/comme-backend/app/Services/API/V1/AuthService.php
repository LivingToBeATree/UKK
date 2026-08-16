<?php

namespace App\Services\API\V1;

use App\Models\User;
use Illuminate\Http\Request;

class AuthService
{
    /**
     * How many devices to remember per user before evicting the oldest.
     * Keeping this here rather than scattered as a magic number wherever
     * it's used.
     */
    private const MAX_KNOWN_DEVICES = 5;

    /**
     * Deterministic — the same device (same user, same browser/user-agent,
     * same IP) always hashes to the same value, so this can be recomputed
     * fresh on every login rather than needing to be stored anywhere
     * itself.
     */
    public function hashDevice(User $user, Request $request): string
    {
        return hash('sha256', $user->id.'|'.$request->userAgent().'|'.$request->ip());
    }

    public function isDeviceKnown(User $user, string $deviceHash): bool
    {
        return collect($user->known_devices ?? [])->contains('hash', $deviceHash);
    }

    /**
     * Call this on every successful login — updates last_seen_at if the
     * device is already known, or adds it fresh if not. Evicts the oldest
     * device (by last_seen_at) once the list exceeds MAX_KNOWN_DEVICES,
     * so this never grows unbounded for someone who logs in from many
     * different places.
     */
    public function rememberDevice(User $user, string $deviceHash, Request $request): void
    {
        $devices = collect($user->known_devices ?? []);
        $existingIndex = $devices->search(fn ($device)=>$device['hash'] === $deviceHash);

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
     * Pairs naturally with UserController::logoutOtherDevices() — killing
     * every other session but leaving stale devices in the known-devices
     * list would be an inconsistent half-measure, so this clears them
     * together.
     */
    public function forgetOtherDevices(User $user, string $currentDeviceHash): void
    {
        $devices = collect($user->known_devices ?? [])
            ->filter(fn ($device) => $device['hash'] === $currentDeviceHash)
            ->values();

        $user->forceFill(['known_devices'=> $devices->values()->all()])->save();
    }
}
