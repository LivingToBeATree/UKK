<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\API\V1\User\Auth\NewDeviceLoginNotification;
use App\Notifications\API\V1\User\Auth\PasswordChangedNotification;
use App\Notifications\API\V1\User\Auth\ResetPasswordNotification;
use App\Services\API\V1\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_from_new_device_triggers_new_device_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'art@example.com',
            'password' => 'password123',
            'known_devices' => [],
        ]);

        $response = $this->withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ])->postJson('/api/login', [
            'email' => 'art@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Logged in successfully.');

        Notification::assertSentTo(
            $user,
            NewDeviceLoginNotification::class,
            function (NewDeviceLoginNotification $notification) {
                return str_contains($notification->userAgent, 'Windows NT');
            }
        );
    }

    public function test_login_from_known_device_does_not_trigger_notification(): void
    {
        Notification::fake();

        $authService = new AuthService;
        $mockRequest = Request::create('/api/login', 'POST', [], [], [], [
            'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'REMOTE_ADDR' => '127.0.0.1',
        ]);

        $user = User::factory()->create([
            'email' => 'art@example.com',
            'password' => 'password123',
        ]);

        $deviceHash = $authService->hashDevice($user, $mockRequest);
        $user->forceFill([
            'known_devices' => [
                [
                    'hash' => $deviceHash,
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'first_seen_at' => now()->toIso8601String(),
                    'last_seen_at' => now()->toIso8601String(),
                ],
            ],
        ])->save();

        $response = $this->withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ])->postJson('/api/login', [
            'email' => 'art@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();

        Notification::assertNotSentTo($user, NewDeviceLoginNotification::class);
    }

    public function test_login_from_known_browser_on_new_ip_does_not_trigger_notification(): void
    {
        Notification::fake();

        $authService = new AuthService;
        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
        $mockRequest = Request::create('/api/login', 'POST', [], [], [], [
            'HTTP_USER_AGENT' => $userAgent,
            'REMOTE_ADDR' => '127.0.0.1',
        ]);

        $user = User::factory()->create([
            'email' => 'art@example.com',
            'password' => 'password123',
        ]);

        $deviceHash = $authService->hashDevice($user, $mockRequest);
        $user->forceFill([
            'known_devices' => [
                [
                    'hash' => $deviceHash,
                    'user_agent' => $userAgent,
                    'first_seen_at' => now()->toIso8601String(),
                    'last_seen_at' => now()->toIso8601String(),
                ],
            ],
        ])->save();

        $response = $this->withServerVariables([
            'REMOTE_ADDR' => '203.0.113.10',
        ])->withHeaders([
            'User-Agent' => $userAgent,
        ])->postJson('/api/login', [
            'email' => 'art@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();

        Notification::assertNotSentTo($user, NewDeviceLoginNotification::class);
    }

    public function test_forgot_password_sends_custom_reset_password_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'artist@example.com',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'artist@example.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'If that email is registered, a password reset link has been sent.');

        Notification::assertSentTo(
            $user,
            ResetPasswordNotification::class,
            function (ResetPasswordNotification $notification) {
                return ! empty($notification->token);
            }
        );
    }

    public function test_reset_password_sends_password_changed_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'artist@example.com',
            'password' => 'oldpassword123',
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'artist@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Password reset successfully.');

        Notification::assertSentTo($user, PasswordChangedNotification::class);
    }

    public function test_change_password_sends_password_changed_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'password' => 'current_password123',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/profile/password', [
            'current_password' => 'current_password123',
            'password' => 'new_secret_pass123',
            'password_confirmation' => 'new_secret_pass123',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Password changed successfully.');

        Notification::assertSentTo($user, PasswordChangedNotification::class);
    }
}
