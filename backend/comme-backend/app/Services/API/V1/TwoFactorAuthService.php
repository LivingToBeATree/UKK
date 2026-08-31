<?php

namespace App\Services\API\V1;

use App\Models\User;
use Illuminate\Support\Str;

class TwoFactorAuthService
{
    private const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    /**
     * Generate a 32-character Base32 secret key.
     */
    public function generateSecretKey(): string
    {
        $secret = '';
        for ($i = 0; $i < 32; $i++) {
            $secret .= self::BASE32_CHARS[random_int(0, 31)];
        }

        return $secret;
    }

    /**
     * Generate standard otpauth URI for QR code generation.
     */
    public function getQrCodeUrl(User $user, string $secret): string
    {
        $issuer = 'Comme';
        $label = rawurlencode($issuer) . ':' . rawurlencode($user->email);

        return sprintf(
            'otpauth://totp/%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30',
            $label,
            $secret,
            rawurlencode($issuer)
        );
    }

    /**
     * Verify a 6-digit TOTP code against a Base32 secret key (RFC 6238).
     * Tolerance window = 1 (checks -30s, current, +30s).
     */
    public function verifyKey(string $secret, string $code, int $window = 1): bool
    {
        $code = trim($code);
        if (strlen($code) !== 6 || ! ctype_digit($code)) {
            return false;
        }

        $secretBytes = $this->base32Decode($secret);
        if ($secretBytes === null) {
            return false;
        }

        $currentTimeSlice = (int) floor(time() / 30);

        for ($offset = -$window; $offset <= $window; $offset++) {
            $timeSlice = $currentTimeSlice + $offset;
            $packedTime = pack('J', $timeSlice); // 64-bit unsigned big-endian
            $hash = hash_hmac('sha1', $packedTime, $secretBytes, true);

            $hashOffset = ord($hash[19]) & 0x0F;
            $binaryCode = (
                ((ord($hash[$hashOffset]) & 0x7F) << 24) |
                ((ord($hash[$hashOffset + 1]) & 0xFF) << 16) |
                ((ord($hash[$hashOffset + 2]) & 0xFF) << 8) |
                (ord($hash[$hashOffset + 3]) & 0xFF)
            );

            $calculatedCode = str_pad((string) ($binaryCode % 1000000), 6, '0', STR_PAD_LEFT);

            if (hash_equals($calculatedCode, $code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate 8 distinct alphanumeric recovery backup codes.
     */
    public function generateRecoveryCodes(int $count = 8): array
    {
        $codes = [];
        while (count($codes) < $count) {
            $part1 = strtoupper(Str::random(5));
            $part2 = strtoupper(Str::random(5));
            $code = "{$part1}-{$part2}";
            if (! in_array($code, $codes, true)) {
                $codes[] = $code;
            }
        }

        return $codes;
    }

    /**
     * Check and consume (burn) a recovery code for the user.
     */
    public function verifyAndConsumeRecoveryCode(User $user, string $code): bool
    {
        $code = strtoupper(trim($code));
        $recoveryCodes = $user->two_factor_recovery_codes ?? [];

        if (! is_array($recoveryCodes) || empty($recoveryCodes)) {
            return false;
        }

        $index = array_search($code, $recoveryCodes, true);
        if ($index === false) {
            return false;
        }

        // Burn the code so it cannot be used a second time
        unset($recoveryCodes[$index]);
        $user->two_factor_recovery_codes = array_values($recoveryCodes);
        $user->save();

        return true;
    }

    /**
     * Decode a Base32 string to binary bytes.
     */
    private function base32Decode(string $secret): ?string
    {
        $secret = strtoupper(trim($secret));
        $buffer = 0;
        $bufferSize = 0;
        $result = '';

        for ($i = 0; $i < strlen($secret); $i++) {
            $char = $secret[$i];
            if ($char === '=') {
                break;
            }

            $val = strpos(self::BASE32_CHARS, $char);
            if ($val === false) {
                return null;
            }

            $buffer = ($buffer << 5) | $val;
            $bufferSize += 5;

            if ($bufferSize >= 8) {
                $bufferSize -= 8;
                $result .= chr(($buffer >> $bufferSize) & 0xFF);
            }
        }

        return $result;
    }
}
