<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\API\V1\TwoFactorAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TwoFactorAuthTest extends TestCase
{
    use RefreshDatabase;

    private TwoFactorAuthService $twoFactorService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->twoFactorService = app(TwoFactorAuthService::class);
    }

    public function test_user_can_initialize_two_factor_setup(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/profile/2fa/setup');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['secret', 'qr_code_url'],
            ]);

        $this->assertNotNull($user->fresh()->two_factor_secret);
        $this->assertNull($user->fresh()->two_factor_confirmed_at);
    }

    public function test_user_cannot_confirm_with_invalid_code(): void
    {
        $user = User::factory()->create();
        $secret = $this->twoFactorService->generateSecretKey();
        $user->update(['two_factor_secret' => $secret]);

        $response = $this->actingAs($user)->postJson('/api/profile/2fa/confirm', [
            'code' => '000000',
        ]);

        $response->assertStatus(422);
        $this->assertNull($user->fresh()->two_factor_confirmed_at);
    }

    public function test_user_can_confirm_with_valid_code_and_receives_recovery_codes(): void
    {
        $user = User::factory()->create();
        $secret = $this->twoFactorService->generateSecretKey();
        $user->update(['two_factor_secret' => $secret]);

        // Mock a valid code calculation using current time slice
        $currentTimeSlice = (int) floor(time() / 30);
        $packed = pack('J', $currentTimeSlice);
        $reflection = new \ReflectionClass($this->twoFactorService);
        $method = $reflection->getMethod('base32Decode');
        $method->setAccessible(true);
        $binarySecret = $method->invoke($this->twoFactorService, $secret);

        $hash = hash_hmac('sha1', $packed, $binarySecret, true);
        $offset = ord($hash[19]) & 0x0F;
        $binaryCode = (
            ((ord($hash[$offset]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            (ord($hash[$offset + 3]) & 0xFF)
        );
        $validCode = str_pad((string) ($binaryCode % 1000000), 6, '0', STR_PAD_LEFT);

        $response = $this->actingAs($user)->postJson('/api/profile/2fa/confirm', [
            'code' => $validCode,
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['recovery_codes', 'two_factor_enabled'],
            ]);

        $fresh = $user->fresh();
        $this->assertNotNull($fresh->two_factor_confirmed_at);
        $this->assertCount(8, $fresh->two_factor_recovery_codes);
        $this->assertTrue($fresh->hasTwoFactorEnabled());
    }

    public function test_login_intercepts_when_two_factor_is_enabled(): void
    {
        $user = User::factory()->create([
            'email' => 'art@example.com',
            'password' => Hash::make('secretpassword'),
            'two_factor_secret' => $this->twoFactorService->generateSecretKey(),
            'two_factor_recovery_codes' => ['CODE1-AAAAA', 'CODE2-BBBBB'],
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'art@example.com',
            'password' => 'secretpassword',
        ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'requires_2fa' => true,
                ],
            ]);

        $this->assertGuest();
    }

    public function test_user_can_complete_login_with_recovery_code(): void
    {
        $user = User::factory()->create([
            'email' => 'art@example.com',
            'password' => Hash::make('secretpassword'),
            'two_factor_secret' => $this->twoFactorService->generateSecretKey(),
            'two_factor_recovery_codes' => ['CODE1-AAAAA', 'CODE2-BBBBB'],
            'two_factor_confirmed_at' => now(),
        ]);

        // Step 1: Trigger login challenge
        $loginRes = $this->postJson('/api/login', [
            'email' => 'art@example.com',
            'password' => 'secretpassword',
        ]);
        $token = $loginRes->json('data.two_factor_token');

        // Step 2: Submit recovery code
        $twoFaRes = $this->postJson('/api/login/2fa', [
            'two_factor_token' => $token,
            'code' => 'CODE1-AAAAA',
        ]);

        $twoFaRes->assertOk();
        $this->assertAuthenticatedAs($user);

        // Verify recovery code was burned
        $fresh = $user->fresh();
        $this->assertCount(1, $fresh->two_factor_recovery_codes);
        $this->assertNotContains('CODE1-AAAAA', $fresh->two_factor_recovery_codes);
    }

    public function test_user_can_disable_two_factor_with_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secretpassword'),
            'two_factor_secret' => $this->twoFactorService->generateSecretKey(),
            'two_factor_recovery_codes' => ['CODE1-AAAAA'],
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->actingAs($user)->deleteJson('/api/profile/2fa', [
            'password' => 'secretpassword',
        ]);

        $response->assertOk();

        $fresh = $user->fresh();
        $this->assertNull($fresh->two_factor_secret);
        $this->assertNull($fresh->two_factor_confirmed_at);
        $this->assertNull($fresh->two_factor_recovery_codes);
        $this->assertFalse($fresh->hasTwoFactorEnabled());
    }
}
