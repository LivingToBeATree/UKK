<?php

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArtistProfileSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_artist_can_update_and_persist_studio_settings(): void
    {
        $user = User::factory()->create(['username' => 'testartist']);
        $profile = ArtistProfile::create([
            'user_id' => $user->id,
            'bio' => 'Original bio',
            'commission_open' => true,
            'commission_status' => 'open',
        ]);

        $this->actingAs($user);

        $payload = [
            'commission_status' => 'busy',
            'bio' => 'Freelance anime illustrator specializing in fantasy characters.',
            'portfolio_url' => 'https://artstation.com/testartist',
            'social_links' => [
                'twitter' => 'https://x.com/testartist',
                'artstation' => 'https://artstation.com/testartist',
                'instagram' => 'https://instagram.com/testartist',
            ],
        ];

        $response = $this->putJson("/api/artist-profiles/{$profile->id}", $payload);
        $response->assertOk();

        $response->assertJsonPath('data.commission_status', 'busy');
        $response->assertJsonPath('data.bio', 'Freelance anime illustrator specializing in fantasy characters.');
        $response->assertJsonPath('data.website', 'https://artstation.com/testartist');
        $response->assertJsonPath('data.portfolio_url', 'https://artstation.com/testartist');
        $response->assertJsonPath('data.social_links.twitter', 'https://x.com/testartist');
        $response->assertJsonPath('data.social_links.artstation', 'https://artstation.com/testartist');
        $response->assertJsonPath('data.commission_open', true);

        $profile->refresh();
        $this->assertEquals('busy', $profile->commission_status);
        $this->assertEquals('https://artstation.com/testartist', $profile->website);
        $this->assertTrue($profile->commission_open);

        // Test closing commissions sets commission_open = false
        $closeResponse = $this->putJson("/api/artist-profiles/{$profile->id}", [
            'commission_status' => 'closed',
        ]);
        $closeResponse->assertOk();
        $closeResponse->assertJsonPath('data.commission_status', 'closed');
        $closeResponse->assertJsonPath('data.commission_open', false);

        $profile->refresh();
        $this->assertEquals('closed', $profile->commission_status);
        $this->assertFalse($profile->commission_open);
        $this->assertFalse($profile->isOpen());
    }
}
