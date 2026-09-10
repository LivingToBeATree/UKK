<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use App\Services\API\V1\CacheService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ObservabilityAndRateLimitingTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigns_request_id_header_on_response(): void
    {
        $response = $this->getJson('/api/posts');

        $response->assertHeader('X-Request-ID');
        $this->assertNotEmpty($response->headers->get('X-Request-ID'));
    }

    public function test_preserves_client_provided_request_id(): void
    {
        $customId = 'my-custom-trace-id-12345';

        $response = $this->withHeader('X-Request-ID', $customId)
            ->getJson('/api/posts');

        $response->assertHeader('X-Request-ID', $customId);
    }

    public function test_cache_service_caches_and_invalidates_posts(): void
    {
        $user = User::factory()->create();

        // Prime cache
        $cached1 = CacheService::rememberPosts(1, null, 'latest', function () {
            return ['items' => ['post1', 'post2']];
        });
        $this->assertEquals(['post1', 'post2'], $cached1['items']);

        // Check it was cached
        $cached2 = CacheService::rememberPosts(1, null, 'latest', function () {
            return ['items' => ['should_not_see_this']];
        });
        $this->assertEquals(['post1', 'post2'], $cached2['items']);

        // Invalidate cache
        CacheService::invalidatePosts();

        // Should call fresh callback
        $cached3 = CacheService::rememberPosts(1, null, 'latest', function () {
            return ['items' => ['fresh_post']];
        });
        $this->assertEquals(['fresh_post'], $cached3['items']);
    }

    public function test_post_creation_auto_invalidates_posts_cache(): void
    {
        $user = User::factory()->create();

        $initial = CacheService::rememberPosts(1, null, 'latest', fn () => ['count' => 0]);
        $this->assertEquals(0, $initial['count']);

        // Creating a Post model triggers CacheInvalidationObserver
        Post::create([
            'user_id' => $user->id,
            'content' => 'New test post',
        ]);

        $fresh = CacheService::rememberPosts(1, null, 'latest', fn () => ['count' => 1]);
        $this->assertEquals(1, $fresh['count']);
    }

    public function test_commission_service_cache_and_invalidation(): void
    {
        $initial = CacheService::rememberServices(1, null, 'latest', fn () => ['count' => 5]);
        $this->assertEquals(5, $initial['count']);

        // Check cached
        $cached = CacheService::rememberServices(1, null, 'latest', fn () => ['count' => 99]);
        $this->assertEquals(5, $cached['count']);

        // Invalidate
        CacheService::invalidateServices();

        $fresh = CacheService::rememberServices(1, null, 'latest', fn () => ['count' => 10]);
        $this->assertEquals(10, $fresh['count']);
    }

    public function test_artist_profile_cache_and_invalidation(): void
    {
        $profile = CacheService::rememberArtist('artist-slug-123', fn () => ['name' => 'Original Name']);
        $this->assertEquals('Original Name', $profile['name']);

        // Cached
        $cached = CacheService::rememberArtist('artist-slug-123', fn () => ['name' => 'Changed Name']);
        $this->assertEquals('Original Name', $cached['name']);

        // Invalidate
        CacheService::invalidateArtist('artist-slug-123');

        $fresh = CacheService::rememberArtist('artist-slug-123', fn () => ['name' => 'New Name']);
        $this->assertEquals('New Name', $fresh['name']);
    }

    public function test_pulse_dashboard_is_accessible_in_local_environment(): void
    {
        $response = $this->get('/pulse');

        // In local environment without a user, Gate::define('viewPulse') returns true
        $response->assertOk();
    }

    public function test_log_viewer_is_accessible_in_local_environment(): void
    {
        $response = $this->get('/log-viewer');

        // In local environment, Log Viewer allows access
        $response->assertOk();
    }
}
