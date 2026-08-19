<?php

namespace Tests\Feature;

use App\Enum\UserRole;
use App\Enum\PostVisibilityType;
use App\Models\Post;
use App\Models\PostBookmark;
use App\Models\PostLike;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostEngagementFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_like_and_unlike_a_post(): void
    {
        $author = User::factory()->create(['role' => UserRole::USER]);
        $user = User::factory()->create(['role' => UserRole::USER]);

        $post = Post::create([
            'user_id' => $author->id,
            'content' => 'Sample post content',
            'visibility' => PostVisibilityType::PUBLIC,
            'commentable' => true,
        ]);

        Sanctum::actingAs($user);

        // Like
        $likeResponse = $this->postJson("/api/posts/{$post->id}/like");
        $likeResponse->assertOk()
            ->assertJsonPath('data.is_liked', true)
            ->assertJsonPath('data.likes_count', 1);

        $this->assertDatabaseHas('post_likes', [
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $author->id,
            'actor_id' => $user->id,
            'title' => 'New Like',
        ]);

        // Unlike
        $unlikeResponse = $this->postJson("/api/posts/{$post->id}/like");
        $unlikeResponse->assertOk()
            ->assertJsonPath('data.is_liked', false)
            ->assertJsonPath('data.likes_count', 0);

        $this->assertDatabaseMissing('post_likes', [
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_user_can_bookmark_and_unbookmark_a_post(): void
    {
        $author = User::factory()->create(['role' => UserRole::USER]);
        $user = User::factory()->create(['role' => UserRole::USER]);

        $post = Post::create([
            'user_id' => $author->id,
            'content' => 'Sample post content',
            'visibility' => PostVisibilityType::PUBLIC,
            'commentable' => true,
        ]);

        Sanctum::actingAs($user);

        // Bookmark
        $bookmarkResponse = $this->postJson("/api/posts/{$post->id}/bookmark");
        $bookmarkResponse->assertOk()
            ->assertJsonPath('data.is_bookmarked', true)
            ->assertJsonPath('data.bookmarks_count', 1);

        $this->assertDatabaseHas('post_bookmarks', [
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);

        // List user bookmarks
        $listResponse = $this->getJson('/api/me/bookmarks');
        $listResponse->assertOk()
            ->assertJsonPath('data.0.id', $post->id);

        // Unbookmark
        $unbookmarkResponse = $this->postJson("/api/posts/{$post->id}/bookmark");
        $unbookmarkResponse->assertOk()
            ->assertJsonPath('data.is_bookmarked', false)
            ->assertJsonPath('data.bookmarks_count', 0);

        $this->assertDatabaseMissing('post_bookmarks', [
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);
    }
}
