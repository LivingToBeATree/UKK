<?php

namespace Tests\Feature;

use App\Enum\NotificationType;
use App\Enum\UserRole;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_their_notifications(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);
        $actor = User::factory()->create(['role' => UserRole::USER]);

        Notification::create([
            'user_id' => $user->id,
            'actor_id' => $actor->id,
            'type' => NotificationType::POST_LIKE,
            'title' => 'Post Liked',
            'message' => 'Someone liked your post.',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonPath('data.0.title', 'Post Liked')
            ->assertJsonPath('data.0.is_read', false);
    }

    public function test_user_can_get_unread_notification_count(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);

        Notification::create([
            'user_id' => $user->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'Unread 1',
            'message' => 'Msg 1',
        ]);

        Notification::create([
            'user_id' => $user->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'Unread 2',
            'message' => 'Msg 2',
        ]);

        Notification::create([
            'user_id' => $user->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'Read',
            'message' => 'Msg 3',
            'read_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/notifications/unread-count');

        $response->assertOk()
            ->assertJsonPath('data.unread_count', 2);
    }

    public function test_user_can_mark_single_notification_as_read(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);

        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'Unread',
            'message' => 'Msg',
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertOk()
            ->assertJsonPath('data.is_read', true);

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_cannot_mark_another_users_notification_as_read(): void
    {
        $userA = User::factory()->create(['role' => UserRole::USER]);
        $userB = User::factory()->create(['role' => UserRole::USER]);

        $notification = Notification::create([
            'user_id' => $userB->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'User B Notification',
            'message' => 'Msg',
        ]);

        Sanctum::actingAs($userA);

        $response = $this->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertForbidden();
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);

        Notification::create([
            'user_id' => $user->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'Notice 1',
            'message' => 'Msg 1',
        ]);

        Notification::create([
            'user_id' => $user->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'Notice 2',
            'message' => 'Msg 2',
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/notifications/read-all');

        $response->assertOk()
            ->assertJsonPath('data.updated_count', 2);

        $this->assertSame(0, $user->notifications()->whereNull('read_at')->count());
    }

    public function test_user_can_delete_notification(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);

        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'Delete Me',
            'message' => 'Msg',
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/notifications/{$notification->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }
}
