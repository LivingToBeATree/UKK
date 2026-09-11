<?php

namespace Tests\Feature;

use App\Enum\CommissionStatus;
use App\Models\ArtistProfile;
use App\Models\Commission;
use App\Models\CommissionMedia;
use App\Models\CommissionService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TrioFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_artist_commission_queue_and_privacy_masking(): void
    {
        $artistUser = User::factory()->create(['username' => 'picasso_art', 'display_name' => 'Pablo Picasso']);
        $buyer = User::factory()->create(['username' => 'alice_wonderland', 'display_name' => 'Alice Wonderland']);
        $otherBuyer = User::factory()->create(['username' => 'bob_builder', 'display_name' => 'Bob The Builder']);

        $artistProfile = ArtistProfile::create([
            'user_id' => $artistUser->id,
            'bio' => 'Master of cubism',
            'commission_open' => true,
            'commission_status' => 'open',
        ]);

        $service = CommissionService::create([
            'artist_profile_id' => $artistProfile->id,
            'name' => 'Oil Portrait',
            'base_price' => 1500000,
            'description' => 'Custom oil painting portrait',
        ]);

        // Commission 1: Accepted (Waitlist) for Alice
        Commission::create([
            'user_id' => $buyer->id,
            'artist_profile_id' => $artistProfile->id,
            'commission_service_id' => $service->id,
            'base_price' => 1500000,
            'total_price' => 1500000,
            'status' => CommissionStatus::ACCEPTED,
        ]);

        // Commission 2: In Progress for Bob
        Commission::create([
            'user_id' => $otherBuyer->id,
            'artist_profile_id' => $artistProfile->id,
            'commission_service_id' => $service->id,
            'base_price' => 1500000,
            'total_price' => 1500000,
            'status' => CommissionStatus::IN_PROGRESS,
        ]);

        // 1. Unauthenticated guest request
        $guestResponse = $this->getJson("/api/artist-profiles/{$artistProfile->id}/queue");
        $guestResponse->assertStatus(200)
            ->assertJsonPath('data.stats.total_active', 2)
            ->assertJsonPath('data.stats.waitlist_count', 1)
            ->assertJsonPath('data.stats.in_progress_count', 1)
            ->assertJsonPath('data.stats.is_full', false);

        // Verify privacy masking for unauthenticated viewers
        $queueData = $guestResponse->json('data.queue');
        $this->assertCount(2, $queueData);
        $this->assertStringContainsString('***', $queueData[0]['client_name']);
        $this->assertFalse($queueData[0]['is_current_user']);

        // 2. Authenticated request as buyer Alice
        $aliceResponse = $this->actingAs($buyer, 'sanctum')->getJson("/api/artist-profiles/{$artistProfile->id}/queue");
        $aliceResponse->assertStatus(200);

        $aliceQueue = $aliceResponse->json('data.queue');
        // Alice's item should show her full name/username and is_current_user = true
        $this->assertTrue($aliceQueue[0]['is_current_user']);
        $this->assertEquals('Alice Wonderland', $aliceQueue[0]['client_name']);

        // Bob's item should still be masked for Alice
        $this->assertFalse($aliceQueue[1]['is_current_user']);
        $this->assertStringContainsString('***', $aliceQueue[1]['client_name']);
    }

    public function test_deliverable_zip_bundle_download_and_access_guards(): void
    {
        Storage::fake('public');

        $artistUser = User::factory()->create();
        $buyer = User::factory()->create();
        $stranger = User::factory()->create();

        $artistProfile = ArtistProfile::create(['user_id' => $artistUser->id]);
        $service = CommissionService::create([
            'artist_profile_id' => $artistProfile->id,
            'name' => 'Full Character Illustration',
            'base_price' => 800000,
            'description' => 'Test bundle',
        ]);

        $commission = Commission::create([
            'user_id' => $buyer->id,
            'artist_profile_id' => $artistProfile->id,
            'commission_service_id' => $service->id,
            'base_price' => 800000,
            'total_price' => 800000,
            'status' => CommissionStatus::WAITING_FOR_CLIENT,
        ]);

        // Upload fake media for deliverable
        $file = UploadedFile::fake()->image('character_masterpiece.png', 600, 600);
        $filePath = $file->store('commissions/' . $commission->id, 'public');

        CommissionMedia::create([
            'commission_id' => $commission->id,
            'user_id' => $artistUser->id,
            'file_path' => $filePath,
            'file_name' => 'character_masterpiece.png',
            'mime_type' => 'image/png',
            'media_type' => 'image',
            'file_size' => 1024,
            'sort_order' => 0,
            'disk' => 'public',
        ]);

        // 1. Stranger is forbidden (403)
        $strangerRes = $this->actingAs($stranger, 'sanctum')->get("/api/commissions/{$commission->id}/download-bundle");
        $strangerRes->assertStatus(403);

        // 2. Buyer attempts to download while order is under review -> 403 Forbidden (protects artist)
        $buyerEarlyRes = $this->actingAs($buyer, 'sanctum')->get("/api/commissions/{$commission->id}/download-bundle");
        $buyerEarlyRes->assertStatus(403);
        $this->assertStringContainsString('Original deliverable bundle unlocks once you approve delivery', $buyerEarlyRes->json('message'));

        // 3. Artist can download their bundle at any time
        $artistRes = $this->actingAs($artistUser, 'sanctum')->get("/api/commissions/{$commission->id}/download-bundle");
        $artistRes->assertStatus(200)
            ->assertHeader('Content-Type', 'application/zip');
        $this->assertStringContainsString('.zip', $artistRes->headers->get('Content-Disposition'));

        // 4. Once completed, buyer can download the full ZIP bundle
        $commission->update([
            'status' => CommissionStatus::COMPLETED,
            'completed_at' => now(),
        ]);

        $buyerCompletedRes = $this->actingAs($buyer, 'sanctum')->get("/api/commissions/{$commission->id}/download-bundle");
        $buyerCompletedRes->assertStatus(200)
            ->assertHeader('Content-Type', 'application/zip');
        $this->assertStringContainsString("comme-order-{$commission->id}-deliverables.zip", $buyerCompletedRes->headers->get('Content-Disposition'));
    }

    public function test_exchange_rates_endpoint_returns_valid_structure(): void
    {
        $response = $this->getJson('/api/exchange-rates');

        $response->assertStatus(200)
            ->assertJsonPath('data.base', 'IDR')
            ->assertJsonStructure([
                'data' => [
                    'base',
                    'rates' => [
                        'IDR',
                        'USD',
                        'EUR',
                        'JPY',
                        'SGD',
                        'GBP',
                    ],
                    'rates_to_idr' => [
                        'USD',
                        'EUR',
                        'JPY',
                        'SGD',
                        'GBP',
                    ],
                    'symbols' => [
                        'IDR',
                        'USD',
                        'EUR',
                        'JPY',
                        'SGD',
                        'GBP',
                    ],
                    'currency_names',
                    'updated_at',
                ],
            ]);

        $this->assertEquals(1.0, $response->json('data.rates.IDR'));
        $this->assertGreaterThan(0, $response->json('data.rates.USD'));
        $this->assertGreaterThan(0, $response->json('data.rates_to_idr.USD'));
    }
}
