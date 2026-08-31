<?php

namespace Tests\Feature;

use App\Enum\CommissionVisibility;
use App\Enum\MediaType;
use App\Models\ArtistProfile;
use App\Models\Media;
use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $artistUser;
    protected ArtistProfile $artistProfile;
    protected User $otherArtistUser;
    protected ArtistProfile $otherArtistProfile;
    protected User $regularUser;
    protected Media $media;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artistUser = User::factory()->create();
        $this->artistProfile = ArtistProfile::create([
            'user_id' => $this->artistUser->id,
            'bio' => 'Professional concept artist',
            'status' => 'open',
        ]);

        $this->otherArtistUser = User::factory()->create();
        $this->otherArtistProfile = ArtistProfile::create([
            'user_id' => $this->otherArtistUser->id,
            'bio' => '3D Modeler',
            'status' => 'open',
        ]);

        $this->regularUser = User::factory()->create();

        $this->media = Media::create([
            'user_id' => $this->artistUser->id,
            'file_name' => 'thumbnail.png',
            'file_path' => 'uploads/2026/08/thumbnail.png',
            'media_type' => MediaType::IMAGE,
            'file_size' => 1024,
            'mime_type' => 'image/png',
            'sort_order' => 0,
            'is_thumbnail' => true,
        ]);
    }

    public function test_artist_can_create_portfolio_with_starred_and_thumbnail(): void
    {
        $response = $this->actingAs($this->artistUser)
            ->postJson('/api/portfolios', [
                'title' => 'Cyberpunk Character Showcase',
                'description' => 'A curated collection of sci-fi concepts',
                'thumbnail_media_id' => $this->media->id,
                'visibility' => CommissionVisibility::PUBLIC->value,
                'starred' => true,
            ])
            ->assertCreated();

        $this->assertEquals('Cyberpunk Character Showcase', $response->json('data.title'));
        $this->assertEquals($this->media->id, $response->json('data.thumbnail_media_id'));
        $this->assertTrue($response->json('data.starred'));

        $this->assertDatabaseHas('portfolios', [
            'artist_profile_id' => $this->artistProfile->id,
            'title' => 'Cyberpunk Character Showcase',
            'thumbnail_media_id' => $this->media->id,
            'starred' => true,
        ]);
    }

    public function test_portfolio_creation_rejects_nonexistent_thumbnail_media_id(): void
    {
        $this->actingAs($this->artistUser)
            ->postJson('/api/portfolios', [
                'title' => 'Invalid Media Portfolio',
                'description' => 'Test description',
                'thumbnail_media_id' => 999999, // Does not exist
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['thumbnail_media_id']);
    }

    public function test_artist_can_update_portfolio_and_toggle_starred(): void
    {
        $portfolio = Portfolio::create([
            'artist_profile_id' => $this->artistProfile->id,
            'title' => 'Initial Title',
            'description' => 'Initial Description',
            'thumbnail_media_id' => $this->media->id,
            'visibility' => CommissionVisibility::PUBLIC,
            'starred' => true,
        ]);

        $response = $this->actingAs($this->artistUser)
            ->patchJson("/api/portfolios/{$portfolio->id}", [
                'title' => 'Updated Showcase Title',
                'starred' => false,
            ])
            ->assertOk();

        $this->assertEquals('Updated Showcase Title', $response->json('data.title'));
        $this->assertFalse($response->json('data.starred'));

        $portfolio->refresh();
        $this->assertEquals('Updated Showcase Title', $portfolio->title);
        $this->assertFalse($portfolio->starred);
    }

    public function test_non_owner_artist_cannot_update_another_artists_portfolio(): void
    {
        $portfolio = Portfolio::create([
            'artist_profile_id' => $this->artistProfile->id,
            'title' => 'Artist One Portfolio',
            'description' => 'Description text',
            'thumbnail_media_id' => $this->media->id,
            'visibility' => CommissionVisibility::PUBLIC,
            'starred' => true,
        ]);

        $this->actingAs($this->otherArtistUser)
            ->patchJson("/api/portfolios/{$portfolio->id}", [
                'title' => 'Hacked Title',
            ])
            ->assertForbidden();

        $portfolio->refresh();
        $this->assertEquals('Artist One Portfolio', $portfolio->title);
    }

    public function test_regular_user_without_artist_profile_cannot_create_portfolio(): void
    {
        $this->actingAs($this->regularUser)
            ->postJson('/api/portfolios', [
                'title' => 'Unauthorized Portfolio',
                'description' => 'Description',
            ])
            ->assertForbidden();
    }
}
