<?php

namespace Tests\Feature;

use App\Enum\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_cannot_access_admin_stats(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(403);
    }

    public function test_moderator_can_access_admin_stats(): void
    {
        $moderator = User::factory()->create(['role' => UserRole::MODERATOR]);
        Sanctum::actingAs($moderator);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'total_users',
                    'total_artists',
                    'pending_applications_count',
                    'open_reports_count',
                    'active_tickets_count',
                ],
            ]);
    }

    public function test_admin_can_access_users_list_and_search(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        User::factory()->create(['username' => 'alice_wonderland', 'role' => UserRole::USER]);
        User::factory()->create(['username' => 'bob_builder', 'role' => UserRole::USER]);
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/users?search=alice');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.username', 'alice_wonderland');
    }

    public function test_moderator_cannot_access_users_list(): void
    {
        $moderator = User::factory()->create(['role' => UserRole::MODERATOR]);
        Sanctum::actingAs($moderator);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_update_user_role(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $target = User::factory()->create(['role' => UserRole::USER]);
        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/users/{$target->id}/role", [
            'role' => 'moderator',
        ]);

        $response->assertStatus(200);
        $this->assertEquals(UserRole::MODERATOR, $target->fresh()->role);
    }

    public function test_admin_cannot_demote_self(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/users/{$admin->id}/role", [
            'role' => 'user',
        ]);

        $response->assertStatus(422);
        $this->assertEquals(UserRole::ADMIN, $admin->fresh()->role);
    }
}
