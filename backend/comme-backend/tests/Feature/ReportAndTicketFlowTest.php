<?php

namespace Tests\Feature;

use App\Enum\ReportReason;
use App\Enum\ReportStatus;
use App\Enum\TicketPriority;
use App\Enum\UserRole;
use App\Models\Post;
use App\Models\Report;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReportAndTicketFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_report_post_and_auto_creates_ticket(): void
    {
        $author = User::factory()->create();
        $post = Post::create([
            'user_id' => $author->id,
            'content' => 'Sample post content to report',
            'visibility' => 'public',
        ]);

        $reporter = User::factory()->create();
        Sanctum::actingAs($reporter);

        $response = $this->postJson('/api/reports', [
            'reportable_type' => 'post',
            'reportable_id' => $post->id,
            'reason' => 'spam',
            'description' => 'This is a repetitive promotional post.',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('reports', [
            'user_id' => $reporter->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reason' => 'spam',
            'status' => 'pending',
        ]);

        $report = Report::where('user_id', $reporter->id)->first();
        $this->assertNotNull($report);

        // Ensure ticket was created
        $this->assertDatabaseHas('tickets', [
            'report_id' => $report->id,
            'priority' => 'normal',
        ]);
    }

    public function test_user_can_list_their_tickets_and_exchange_messages_with_staff(): void
    {
        $reporter = User::factory()->create();
        $staff = User::factory()->create(['role' => UserRole::ADMIN]);

        $post = Post::create([
            'user_id' => $reporter->id,
            'content' => 'Sample post',
            'visibility' => 'public',
        ]);

        $report = Report::create([
            'user_id' => $reporter->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reason' => ReportReason::COPYRIGHT,
            'status' => ReportStatus::PENDING,
        ]);

        $ticket = Ticket::create([
            'report_id' => $report->id,
            'priority' => 'normal',
        ]);

        // 1. Reporter checks user ticket hub
        Sanctum::actingAs($reporter);
        $listRes = $this->getJson('/api/tickets');
        $listRes->assertStatus(200);
        $this->assertCount(1, $listRes->json('data'));

        // 2. Reporter sends a message
        $msgRes = $this->postJson("/api/tickets/{$ticket->id}/messages", [
            'content' => 'Here is the original artwork link: https://example.com/art',
        ]);
        $msgRes->assertStatus(201);

        // 3. Staff replies on ticket
        Sanctum::actingAs($staff);
        $staffReply = $this->postJson("/api/tickets/{$ticket->id}/messages", [
            'content' => 'Thank you, our team is investigating this infringement.',
        ]);
        $staffReply->assertStatus(201);

        // 4. Staff updates report status to resolved
        $updateRes = $this->patchJson("/api/reports/{$report->id}", [
            'status' => 'resolved',
        ]);
        $updateRes->assertStatus(200);
        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => 'resolved',
            'handled_by' => $staff->id,
        ]);
    }

    public function test_unauthorized_user_cannot_view_or_message_others_tickets(): void
    {
        $reporter = User::factory()->create();
        $otherUser = User::factory()->create(['role' => UserRole::USER]);

        $post = Post::create([
            'user_id' => $reporter->id,
            'content' => 'Sample post',
            'visibility' => 'public',
        ]);

        $report = Report::create([
            'user_id' => $reporter->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reason' => ReportReason::SPAM,
            'status' => ReportStatus::PENDING,
        ]);

        $ticket = Ticket::create([
            'report_id' => $report->id,
            'priority' => 'normal',
        ]);

        // Other user attempts to view ticket
        Sanctum::actingAs($otherUser);
        $viewRes = $this->getJson("/api/tickets/{$ticket->id}");
        $viewRes->assertStatus(403);

        // Other user attempts to send message
        $sendRes = $this->postJson("/api/tickets/{$ticket->id}/messages", [
            'content' => 'Unauthorized intruder message',
        ]);
        $sendRes->assertStatus(403);
    }

    public function test_staff_can_execute_moderation_action_on_problematic_report(): void
    {
        $author = User::factory()->create();
        $post = Post::create([
            'user_id' => $author->id,
            'content' => 'Problematic spam post',
            'visibility' => 'public',
        ]);

        $reporter = User::factory()->create();
        $report = Report::create([
            'user_id' => $reporter->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reason' => ReportReason::SPAM,
            'status' => ReportStatus::PENDING,
        ]);

        $ticket = Ticket::create([
            'report_id' => $report->id,
            'priority' => 'normal',
        ]);

        $staff = User::factory()->create(['role' => UserRole::MODERATOR]);
        Sanctum::actingAs($staff);

        $response = $this->postJson("/api/reports/{$report->id}/action", [
            'action_type' => 'remove_content',
            'notes' => 'Confirmed spam violation. Taking down post.',
        ]);

        $response->assertStatus(200);

        // Assert post was taken down (made private and locked)
        $this->assertEquals('private', $post->fresh()->visibility->value);
        $this->assertTrue($post->fresh()->is_taken_down);

        // Assert report is resolved
        $this->assertEquals(ReportStatus::RESOLVED, $report->fresh()->status);

        // Assert ModerationAction audit log created
        $this->assertDatabaseHas('moderation_actions', [
            'ticket_id' => $ticket->id,
            'user_id' => $staff->id,
            'type' => 'remove_content',
        ]);
    }

    public function test_taken_down_post_cannot_be_republished_by_user_without_appeal(): void
    {
        $author = User::factory()->create();
        $post = Post::create([
            'user_id' => $author->id,
            'content' => 'Violating post',
            'visibility' => 'private',
            'is_taken_down' => true,
            'taken_down_reason' => 'DMCA Infringement',
        ]);

        Sanctum::actingAs($author);

        // Attempting to set visibility back to public should be rejected
        $res = $this->patchJson("/api/posts/{$post->id}", [
            'visibility' => 'public',
        ]);

        $res->assertStatus(422);
    }

    public function test_staff_can_suspend_user_and_blocked_at_login(): void
    {
        $violator = User::factory()->create([
            'email' => 'violator@example.com',
            'password' => bcrypt('password123'),
        ]);

        $staff = User::factory()->create(['role' => UserRole::ADMIN]);
        Sanctum::actingAs($staff);

        $report = Report::create([
            'user_id' => $staff->id,
            'reportable_type' => User::class,
            'reportable_id' => $violator->id,
            'reason' => ReportReason::HARASSMENT,
            'status' => ReportStatus::PENDING,
        ]);

        $actionRes = $this->postJson("/api/reports/{$report->id}/action", [
            'action_type' => 'suspend_user',
            'notes' => 'Severe harassment and hate speech.',
        ]);

        $actionRes->assertStatus(200);
        $this->assertTrue($violator->fresh()->isSuspended());

        // Clear actingAs auth state
        $this->app['auth']->forgetGuards();
        $loginRes = $this->postJson('/api/login', [
            'email' => 'violator@example.com',
            'password' => 'password123',
        ]);

        $loginRes->assertStatus(403);
    }

    public function test_user_can_acknowledge_official_warning(): void
    {
        $user = User::factory()->create([
            'active_warning' => 'Please do not spam commercial links in comments.',
            'warning_acknowledged_at' => null,
        ]);

        $this->assertTrue($user->hasUnacknowledgedWarning());

        Sanctum::actingAs($user);

        $res = $this->postJson('/api/profile/acknowledge-warning');
        $res->assertStatus(200);

        $this->assertFalse($user->fresh()->hasUnacknowledgedWarning());
        $this->assertNotNull($user->fresh()->warning_acknowledged_at);
    }

    public function test_taken_down_and_private_posts_are_hidden_from_public_explore_feed(): void
    {
        $author = User::factory()->create();

        // 1. Normal public post
        $publicPost = Post::create([
            'user_id' => $author->id,
            'content' => 'Public clean post',
            'visibility' => 'public',
            'is_taken_down' => false,
        ]);

        // 2. Taken down post
        $takenDownPost = Post::create([
            'user_id' => $author->id,
            'content' => 'Violating post',
            'visibility' => 'private',
            'is_taken_down' => true,
        ]);

        // 3. Normal private post
        $privatePost = Post::create([
            'user_id' => $author->id,
            'content' => 'Personal draft',
            'visibility' => 'private',
            'is_taken_down' => false,
        ]);

        // Query explore feed as unauthenticated / public user
        $res = $this->getJson('/api/posts');
        $res->assertStatus(200);

        $postIds = collect($res->json('data'))->pluck('id')->toArray();
        $this->assertContains($publicPost->id, $postIds);
        $this->assertNotContains($takenDownPost->id, $postIds);
        $this->assertNotContains($privatePost->id, $postIds);
    }

    public function test_taking_down_portfolio_also_takes_down_companion_post(): void
    {
        $artistUser = User::factory()->create();
        $artistProfile = \App\Models\ArtistProfile::create([
            'user_id' => $artistUser->id,
            'bio' => 'Artist Bio',
            'commission_open' => true,
        ]);

        $portfolio = \App\Models\Portfolio::create([
            'artist_profile_id' => $artistProfile->id,
            'title' => 'Original Artwork',
            'description' => 'Artwork description',
            'visibility' => 'public',
            'is_taken_down' => false,
        ]);

        $companionPost = Post::create([
            'user_id' => $artistUser->id,
            'portfolio_id' => $portfolio->id,
            'content' => 'Check out my new artwork!',
            'visibility' => 'public',
            'is_taken_down' => false,
        ]);

        $staff = User::factory()->create(['role' => UserRole::ADMIN]);
        Sanctum::actingAs($staff);

        $report = Report::create([
            'user_id' => $staff->id,
            'reportable_type' => \App\Models\Portfolio::class,
            'reportable_id' => $portfolio->id,
            'reason' => ReportReason::COPYRIGHT,
            'status' => ReportStatus::PENDING,
        ]);

        $actionRes = $this->postJson("/api/reports/{$report->id}/action", [
            'action_type' => 'remove_content',
            'notes' => 'Stolen artwork detected.',
        ]);

        $actionRes->assertStatus(200);

        // Assert both portfolio and companion post are taken down
        $this->assertTrue($portfolio->fresh()->is_taken_down);
        $this->assertTrue($companionPost->fresh()->is_taken_down);
        $this->assertEquals('private', $companionPost->fresh()->visibility->value ?? $companionPost->fresh()->visibility);

        // Clear actingAs and verify it's absent from public posts explore
        $this->app['auth']->forgetGuards();
        $res = $this->getJson('/api/posts');
        $postIds = collect($res->json('data'))->pluck('id')->toArray();
        $this->assertNotContains($companionPost->id, $postIds);
    }

    public function test_author_can_delete_reported_post_and_auto_resolves_tickets(): void
    {
        $author = User::factory()->create();
        $post = Post::create([
            'user_id' => $author->id,
            'content' => 'Controversial post',
            'visibility' => 'public',
        ]);

        $reporter = User::factory()->create();
        $report = Report::create([
            'user_id' => $reporter->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reason' => ReportReason::OTHER,
            'status' => ReportStatus::PENDING,
        ]);
        $ticket = $report->ticket()->create([
            'priority' => TicketPriority::NORMAL,
        ]);

        Sanctum::actingAs($author);
        $deleteRes = $this->deleteJson("/api/posts/{$post->id}");
        $deleteRes->assertStatus(200);

        // Assert report is auto-resolved
        $this->assertEquals(ReportStatus::RESOLVED, $report->fresh()->status);
        $this->assertNotNull($ticket->fresh()->closed_at);

        // Assert ticket message created
        $this->assertDatabaseHas('ticket_messages', [
            'ticket_id' => $ticket->id,
            'user_id' => $author->id,
        ]);
    }

    public function test_author_can_edit_taken_down_post_and_notifies_ticket(): void
    {
        $author = User::factory()->create();
        $post = Post::create([
            'user_id' => $author->id,
            'content' => 'Old violating text',
            'visibility' => 'private',
            'is_taken_down' => true,
        ]);

        $report = Report::create([
            'user_id' => $author->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reason' => ReportReason::APPEAL,
            'status' => ReportStatus::PENDING,
        ]);
        $ticket = $report->ticket()->create([
            'priority' => TicketPriority::NORMAL,
        ]);

        Sanctum::actingAs($author);
        $updateRes = $this->putJson("/api/posts/{$post->id}", [
            'content' => 'Cleaned up revised text',
        ]);
        $updateRes->assertStatus(200);

        // Assert revision message was recorded on ticket
        $this->assertTrue(
            $ticket->fresh()->messages()->where('content', 'like', '%Revision Submitted%')->exists()
        );
    }
}

