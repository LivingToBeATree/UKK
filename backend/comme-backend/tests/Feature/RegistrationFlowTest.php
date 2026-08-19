<?php

namespace Tests\Feature;

use App\Models\PendingRegistration;
use App\Models\User;
use App\Notifications\API\V1\User\Auth\RegistrationCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class RegistrationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_sends_code_and_does_not_create_user_until_confirmation(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/register', [
            'username' => 'new_user',
            'display_name' => 'New User',
            'email' => 'NewUser@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertAccepted()
            ->assertJsonPath('message', 'Registration code sent. Confirm the code to create your account.');

        $this->assertDatabaseMissing('users', ['email' => 'newuser@example.com']);
        $this->assertDatabaseHas('pending_registrations', [
            'username' => 'new_user',
            'email' => 'newuser@example.com',
        ]);

        $pending = PendingRegistration::where('email', 'newuser@example.com')->firstOrFail();

        $this->assertNotSame('password', $pending->password);
        $this->assertNotNull($pending->expires_at);

        Notification::assertSentOnDemand(RegistrationCodeNotification::class);
    }

    public function test_register_rejects_username_reserved_by_another_pending_registration(): void
    {
        Notification::fake();

        PendingRegistration::create([
            'username' => 'reserved_name',
            'display_name' => 'First User',
            'email' => 'first@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'code' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->postJson('/api/register', [
            'username' => 'reserved_name',
            'display_name' => 'Second User',
            'email' => 'second@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('username');

        Notification::assertNothingSent();
    }

    public function test_register_allows_same_email_to_refresh_its_pending_registration(): void
    {
        Notification::fake();

        PendingRegistration::create([
            'username' => 'same_user',
            'display_name' => 'First Name',
            'email' => 'same@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'code' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->postJson('/api/register', [
            'username' => 'same_user',
            'display_name' => 'Updated Name',
            'email' => 'same@example.com',
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ]);

        $response->assertAccepted();

        $this->assertSame(1, PendingRegistration::where('email', 'same@example.com')->count());
        $this->assertDatabaseHas('pending_registrations', [
            'username' => 'same_user',
            'display_name' => 'Updated Name',
            'email' => 'same@example.com',
        ]);
        Notification::assertSentOnDemand(RegistrationCodeNotification::class);
    }

    public function test_confirm_registration_creates_verified_user_and_logs_them_in(): void
    {
        PendingRegistration::create([
            'username' => 'new_user',
            'display_name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'code' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->postJson('/api/register/confirm', [
            'email' => 'newuser@example.com',
            'code' => '123456',
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Registered successfully.')
            ->assertJsonPath('data.email', 'newuser@example.com');

        $user = User::where('email', 'newuser@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertTrue($user->hasVerifiedEmail());
        $this->assertDatabaseMissing('pending_registrations', ['email' => 'newuser@example.com']);
    }

    public function test_confirm_registration_fails_with_invalid_code(): void
    {
        PendingRegistration::create([
            'username' => 'new_user',
            'display_name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'code' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->postJson('/api/register/confirm', [
            'email' => 'newuser@example.com',
            'code' => '999999',
        ]);

        $response->assertUnprocessable()
            ->assertJsonPath('message', 'Invalid or expired registration code.');

        $pending = PendingRegistration::where('email', 'newuser@example.com')->firstOrFail();
        $this->assertSame(1, $pending->attempts);
        $this->assertGuest();
    }

    public function test_confirm_registration_deletes_pending_after_five_failed_attempts(): void
    {
        $pending = PendingRegistration::create([
            'username' => 'new_user',
            'display_name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'code' => Hash::make('123456'),
            'attempts' => 4,
            'expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->postJson('/api/register/confirm', [
            'email' => 'newuser@example.com',
            'code' => '999999',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseMissing('pending_registrations', ['email' => 'newuser@example.com']);
    }

    public function test_confirm_registration_rejects_expired_code(): void
    {
        PendingRegistration::create([
            'username' => 'new_user',
            'display_name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'code' => Hash::make('123456'),
            'expires_at' => now()->subMinute(),
        ]);

        $response = $this->postJson('/api/register/confirm', [
            'email' => 'newuser@example.com',
            'code' => '123456',
        ]);

        $response->assertUnprocessable()
            ->assertJsonPath('message', 'Invalid or expired registration code.');

        $this->assertDatabaseMissing('pending_registrations', ['email' => 'newuser@example.com']);
    }

    public function test_prune_command_deletes_expired_pending_registrations_and_keeps_active_ones(): void
    {
        PendingRegistration::create([
            'username' => 'expired_user',
            'display_name' => 'Expired User',
            'email' => 'expired@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'code' => Hash::make('123456'),
            'expires_at' => now()->subMinutes(5),
        ]);

        PendingRegistration::create([
            'username' => 'active_user',
            'display_name' => 'Active User',
            'email' => 'active@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'code' => Hash::make('654321'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->artisan('model:prune', ['--model' => [PendingRegistration::class]])
            ->assertSuccessful();

        $this->assertDatabaseMissing('pending_registrations', ['email' => 'expired@example.com']);
        $this->assertDatabaseHas('pending_registrations', ['email' => 'active@example.com']);
    }
}
