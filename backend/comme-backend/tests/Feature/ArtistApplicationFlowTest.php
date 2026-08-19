<?php

namespace Tests\Feature;

use App\Enum\ArtistApplicationStatus;
use App\Enum\UserRole;
use App\Models\ArtistApplication;
use App\Models\ArtistProfile;
use App\Models\Notification as InAppNotification;
use App\Models\User;
use App\Notifications\API\V1\ArtistApplication\ArtistApplicationApprovedNotification;
use App\Notifications\API\V1\ArtistApplication\ArtistApplicationRejectedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ArtistApplicationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_artist_application(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $user = User::factory()->create(['role' => UserRole::USER]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/artist-applications', [
            'bio' => 'Digital illustrator specializing in character design.',
            'portfolio_links' => ['https://portfolio.example.com/gallery', 'https://artstation.example.com/user'],
            'website' => 'https://artist.example.com',
            'social_links' => ['https://twitter.com/artist', 'https://instagram.com/artist'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Artist application submitted successfully.')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.bio', 'Digital illustrator specializing in character design.');

        $this->assertDatabaseHas('artist_applications', [
            'user_id' => $user->id,
            'status' => 'pending',
            'website' => 'https://artist.example.com',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $admin->id,
            'actor_id' => $user->id,
            'title' => 'New Artist Application',
        ]);
    }

    public function test_duplicate_application_is_blocked_when_already_pending(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);

        ArtistApplication::create([
            'user_id' => $user->id,
            'bio' => 'Pending applicant bio',
            'portfolio_links' => ['https://portfolio.example.com'],
            'status' => ArtistApplicationStatus::PENDING,
            'submitted_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/artist-applications', [
            'bio' => 'Another bio',
            'portfolio_links' => ['https://portfolio.example.com/2'],
        ]);

        $response->assertForbidden();
    }

    public function test_user_with_artist_profile_cannot_submit_application(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);
        ArtistProfile::create([
            'user_id' => $user->id,
            'bio' => 'Existing artist bio',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/artist-applications', [
            'bio' => 'Attempting duplicate profile application',
            'portfolio_links' => ['https://portfolio.example.com'],
        ]);

        $response->assertForbidden();
    }

    public function test_regular_user_cannot_directly_create_artist_profile(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/artist-profiles', [
            'bio' => 'Direct creation attempt',
        ]);

        $response->assertForbidden();
    }

    public function test_non_staff_cannot_list_all_applications(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/artist-applications');

        $response->assertForbidden();
    }

    public function test_non_staff_cannot_view_another_users_application(): void
    {
        $userA = User::factory()->create(['role' => UserRole::USER]);
        $userB = User::factory()->create(['role' => UserRole::USER]);

        $application = ArtistApplication::create([
            'user_id' => $userB->id,
            'bio' => 'User B bio',
            'portfolio_links' => ['https://portfolio.example.com'],
            'status' => ArtistApplicationStatus::PENDING,
        ]);

        Sanctum::actingAs($userA);

        $response = $this->getJson("/api/artist-applications/{$application->id}");

        $response->assertForbidden();
    }

    public function test_user_can_view_their_own_application_and_my_application(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);

        $application = ArtistApplication::create([
            'user_id' => $user->id,
            'bio' => 'My bio details',
            'portfolio_links' => ['https://portfolio.example.com'],
            'status' => ArtistApplicationStatus::PENDING,
        ]);

        Sanctum::actingAs($user);

        $responseShow = $this->getJson("/api/artist-applications/{$application->id}");
        $responseShow->assertOk()
            ->assertJsonPath('data.bio', 'My bio details');

        $responseMy = $this->getJson('/api/artist-applications/my-application');
        $responseMy->assertOk()
            ->assertJsonPath('data.id', $application->id)
            ->assertJsonPath('data.status', 'pending');
    }

    public function test_staff_can_approve_application_which_creates_artist_profile_and_notifies_user(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $applicant = User::factory()->create(['role' => UserRole::USER]);

        $application = ArtistApplication::create([
            'user_id' => $applicant->id,
            'bio' => 'Future artist bio',
            'portfolio_links' => ['https://portfolio.example.com'],
            'website' => 'https://artist.example.com',
            'social_links' => ['https://twitter.com/artist'],
            'status' => ArtistApplicationStatus::PENDING,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/artist-applications/{$application->id}/approve");

        $response->assertOk()
            ->assertJsonPath('message', 'Artist application approved and profile created successfully.')
            ->assertJsonPath('data.bio', 'Future artist bio');

        $application->refresh();
        $this->assertSame(ArtistApplicationStatus::APPROVED, $application->status);
        $this->assertSame($admin->id, $application->reviewed_by);
        $this->assertNotNull($application->reviewed_at);

        $this->assertDatabaseHas('artist_profiles', [
            'user_id' => $applicant->id,
            'bio' => 'Future artist bio',
            'website' => 'https://artist.example.com',
        ]);

        Notification::assertSentTo($applicant, ArtistApplicationApprovedNotification::class);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $applicant->id,
            'actor_id' => $admin->id,
            'title' => 'Artist Application Approved',
        ]);
    }

    public function test_staff_can_reject_application_with_reason_which_does_not_create_profile(): void
    {
        Notification::fake();

        $moderator = User::factory()->create(['role' => UserRole::MODERATOR]);
        $applicant = User::factory()->create(['role' => UserRole::USER]);

        $application = ArtistApplication::create([
            'user_id' => $applicant->id,
            'bio' => 'Rejected applicant bio',
            'portfolio_links' => ['https://portfolio.example.com'],
            'status' => ArtistApplicationStatus::PENDING,
        ]);

        Sanctum::actingAs($moderator);

        $response = $this->postJson("/api/artist-applications/{$application->id}/reject", [
            'rejection_reason' => 'Portfolio samples do not include original work or process shots.',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Artist application rejected successfully.')
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.rejection_reason', 'Portfolio samples do not include original work or process shots.');

        $application->refresh();
        $this->assertSame(ArtistApplicationStatus::REJECTED, $application->status);
        $this->assertSame($moderator->id, $application->reviewed_by);
        $this->assertSame('Portfolio samples do not include original work or process shots.', $application->rejection_reason);

        $this->assertDatabaseMissing('artist_profiles', ['user_id' => $applicant->id]);

        Notification::assertSentTo($applicant, ArtistApplicationRejectedNotification::class);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $applicant->id,
            'actor_id' => $moderator->id,
            'title' => 'Artist Application Update',
        ]);
    }

    public function test_user_can_reapply_after_rejection(): void
    {
        $applicant = User::factory()->create(['role' => UserRole::USER]);

        ArtistApplication::create([
            'user_id' => $applicant->id,
            'bio' => 'First attempt',
            'portfolio_links' => ['https://portfolio.example.com/v1'],
            'status' => ArtistApplicationStatus::REJECTED,
            'rejection_reason' => 'Need more artwork.',
        ]);

        Sanctum::actingAs($applicant);

        $response = $this->postJson('/api/artist-applications', [
            'bio' => 'Second attempt with updated artwork',
            'portfolio_links' => ['https://portfolio.example.com/v2', 'https://artstation.com/v2'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.bio', 'Second attempt with updated artwork');

        $this->assertCount(2, $applicant->artistApplications);
    }

    public function test_admin_cannot_approve_already_approved_application(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $applicant = User::factory()->create(['role' => UserRole::USER]);

        // Application already reviewed
        $application = ArtistApplication::create([
            'user_id' => $applicant->id,
            'bio' => 'Already approved bio',
            'portfolio_links' => ['https://portfolio.example.com'],
            'status' => ArtistApplicationStatus::APPROVED,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now()->subHour(),
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/artist-applications/{$application->id}/approve");

        // Must be forbidden — not 200, even for an admin
        $response->assertForbidden();
    }

    public function test_admin_cannot_reject_already_rejected_application(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $applicant = User::factory()->create(['role' => UserRole::USER]);

        $application = ArtistApplication::create([
            'user_id' => $applicant->id,
            'bio' => 'Already rejected bio',
            'portfolio_links' => ['https://portfolio.example.com'],
            'status' => ArtistApplicationStatus::REJECTED,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now()->subHour(),
            'rejection_reason' => 'Initial rejection reason.',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/artist-applications/{$application->id}/reject", [
            'rejection_reason' => 'Attempting a second rejection.',
        ]);

        $response->assertForbidden();
    }
}
