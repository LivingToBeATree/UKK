<?php

namespace Tests\Feature;

use App\Enum\UserRole;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FollowFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_follow_and_unfollow_another_user(): void
    {
        $follower = User::factory()->create(['role' => UserRole::USER]);
        $target = User::factory()->create(['role' => UserRole::USER]);

        Sanctum::actingAs($follower);

        // Follow
        $responseFollow = $this->postJson("/api/users/{$target->id}/follow");

        $responseFollow->assertOk()
            ->assertJsonPath('data.is_following', true)
            ->assertJsonPath('data.followers_count', 1);

        $this->assertDatabaseHas('follows', [
            'follower_id' => $follower->id,
            'followed_id' => $target->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $target->id,
            'actor_id' => $follower->id,
            'title' => 'New Follower',
        ]);

        // Unfollow (toggle)
        $responseUnfollow = $this->postJson("/api/users/{$target->id}/follow");

        $responseUnfollow->assertOk()
            ->assertJsonPath('data.is_following', false)
            ->assertJsonPath('data.followers_count', 0);

        $this->assertDatabaseMissing('follows', [
            'follower_id' => $follower->id,
            'followed_id' => $target->id,
        ]);
    }

    public function test_user_cannot_follow_themselves(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/users/{$user->id}/follow");

        $response->assertUnprocessable();
    }

    public function test_user_can_list_followers_and_following(): void
    {
        $userA = User::factory()->create(['role' => UserRole::USER]);
        $userB = User::factory()->create(['role' => UserRole::USER]);

        Follow::create([
            'follower_id' => $userA->id,
            'followed_id' => $userB->id,
        ]);

        Sanctum::actingAs($userA);

        $followersResponse = $this->getJson("/api/users/{$userB->id}/followers");
        $followersResponse->assertOk()
            ->assertJsonPath('data.0.id', $userA->id);

        $followingResponse = $this->getJson("/api/users/{$userA->id}/following");
        $followingResponse->assertOk()
            ->assertJsonPath('data.0.id', $userB->id);
    }
}
