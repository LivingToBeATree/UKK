<?php

namespace Tests\Feature;

use App\Enum\CommissionStatus;
use App\Enum\UserRole;
use App\Http\Controllers\API\V1\LiveStreamController;
use App\Models\ArtistProfile;
use App\Models\Commission;
use App\Models\CommissionService;
use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Tests\TestCase;

class NewFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_system_telemetry(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'healthy')
            ->assertJsonPath('data.database.connected', true)
            ->assertJsonPath('data.cache.working', true)
            ->assertJsonStructure([
                'data' => [
                    'status',
                    'timestamp',
                    'database' => ['connected', 'latency_ms', 'driver'],
                    'cache' => ['working', 'latency_ms', 'driver'],
                    'storage' => ['driver', 'free_space_mb', 'total_space_mb'],
                    'queue' => ['driver', 'pending_jobs', 'failed_jobs'],
                    'links' => ['pulse', 'log_viewer'],
                ],
            ]);
    }

    public function test_artist_badge_svg_renders_live_status(): void
    {
        $user = User::factory()->create([
            'username' => 'artistpro',
            'role' => UserRole::USER,
        ]);

        ArtistProfile::create([
            'user_id' => $user->id,
            'bio' => 'Professional illustrator',
            'commission_open' => true,
            'commission_status' => 'open',
        ]);

        $response = $this->get('/api/artists/artistpro/badge.svg');

        $response->assertStatus(200);
        $this->assertStringContainsString('image/svg+xml', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('Comme • @artistpro', $response->getContent());
        $this->assertStringContainsString('Commissions: OPEN', $response->getContent());
        $this->assertStringContainsString('#10B981', $response->getContent());
    }

    public function test_artist_badge_returns_404_for_nonexistent_artist(): void
    {
        $response = $this->get('/api/artists/nonexistent_user/badge.svg');

        $response->assertStatus(404);
        $this->assertStringContainsString('Artist Not Found', $response->getContent());
    }

    public function test_artist_tips_can_be_created_and_listed(): void
    {
        $artistUser = User::factory()->create(['username' => 'tipartist']);
        ArtistProfile::create([
            'user_id' => $artistUser->id,
            'bio' => 'Artist for tips',
            'commission_open' => true,
        ]);

        $supporter = User::factory()->create();

        // Tip creation
        $response = $this->actingAs($supporter, 'sanctum')->postJson('/api/artists/tipartist/tip', [
            'amount' => 50000,
            'message' => 'Keep up the amazing artwork!',
            'supporter_name' => 'Alice',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.amount', 50000)
            ->assertJsonPath('data.supporter_name', 'Alice');

        $this->assertDatabaseHas('artist_tips', [
            'amount' => 50000,
            'supporter_name' => 'Alice',
            'status' => 'pending',
        ]);

        // Tip listing
        $listResponse = $this->getJson('/api/artists/tipartist/tips');
        $listResponse->assertStatus(200);
    }

    public function test_commission_invoice_and_license_documents(): void
    {
        $buyer = User::factory()->create();
        $artistUser = User::factory()->create();
        $artist = ArtistProfile::create(['user_id' => $artistUser->id]);
        $service = CommissionService::create([
            'artist_profile_id' => $artist->id,
            'name' => 'Full Illustration',
            'base_price' => 200000,
            'description' => 'Detailed character painting',
        ]);

        $commission = Commission::create([
            'user_id' => $buyer->id,
            'artist_profile_id' => $artist->id,
            'commission_service_id' => $service->id,
            'title' => 'Custom Avatar',
            'base_price' => 200000,
            'total_price' => 200000,
            'status' => CommissionStatus::IN_PROGRESS,
        ]);

        // Invoice access by buyer
        $invoiceRes = $this->actingAs($buyer, 'sanctum')->get("/api/commissions/{$commission->id}/invoice");
        $invoiceRes->assertStatus(200);
        $this->assertStringContainsString('Official Invoice', $invoiceRes->getContent());
        $this->assertStringContainsString('REC-COM-', $invoiceRes->getContent());

        // License access should be 403 when not completed
        $licenseRes = $this->actingAs($buyer, 'sanctum')->get("/api/commissions/{$commission->id}/license");
        $licenseRes->assertStatus(403);

        // Update to completed
        $commission->update(['status' => CommissionStatus::COMPLETED]);

        $licenseResCompleted = $this->actingAs($buyer, 'sanctum')->get("/api/commissions/{$commission->id}/license");
        $licenseResCompleted->assertStatus(200);
        $this->assertStringContainsString('Certificate of Authenticity', $licenseResCompleted->getContent());
        $this->assertStringContainsString('LIC-COM-', $licenseResCompleted->getContent());
    }

    public function test_delivery_proof_and_anti_theft_gated_download(): void
    {
        Storage::fake('public');

        $buyer = User::factory()->create();
        $artistUser = User::factory()->create();
        $artist = ArtistProfile::create(['user_id' => $artistUser->id]);
        $service = CommissionService::create([
            'artist_profile_id' => $artist->id,
            'name' => 'Icon Art',
            'base_price' => 100000,
            'description' => 'Quick icon',
        ]);

        $commission = Commission::create([
            'user_id' => $buyer->id,
            'artist_profile_id' => $artist->id,
            'commission_service_id' => $service->id,
            'title' => 'Icon Test',
            'base_price' => 100000,
            'total_price' => 100000,
            'status' => CommissionStatus::WAITING_FOR_CLIENT,
        ]);

        // Store a fake deliverable media
        $filePath = 'commissions/' . $commission->id . '/test_art.png';
        Storage::disk('public')->put($filePath, 'fake image binary content');

        $media = Media::create([
            'mediable_type' => Commission::class,
            'mediable_id' => $commission->id,
            'file_path' => $filePath,
            'file_name' => 'test_art.png',
            'mime_type' => 'image/png',
            'media_type' => 'image',
            'file_size' => 1024,
            'disk' => 'public',
        ]);

        // Buyer downloads proof preview -> succeeds
        $proofRes = $this->actingAs($buyer, 'sanctum')->get("/api/commissions/{$commission->id}/proof/{$media->id}");
        $proofRes->assertStatus(200);

        // Buyer attempts to download original while under review -> 403 Forbidden (Anti-Art Theft)
        $downloadRes = $this->actingAs($buyer, 'sanctum')->get("/api/commissions/{$commission->id}/download-original/{$media->id}");
        $downloadRes->assertStatus(403);
        $this->assertStringContainsString('Original full-resolution asset unlocks once you approve delivery', $downloadRes->json('message'));

        // Artist can download original at any time
        $artistDownloadRes = $this->actingAs($artistUser, 'sanctum')->get("/api/commissions/{$commission->id}/download-original/{$media->id}");
        $artistDownloadRes->assertStatus(200);

        // Once completed, buyer can download original
        $commission->update(['status' => CommissionStatus::COMPLETED]);
        $buyerDownloadCompleted = $this->actingAs($buyer, 'sanctum')->get("/api/commissions/{$commission->id}/download-original/{$media->id}");
        $buyerDownloadCompleted->assertStatus(200);
    }

    public function test_live_stream_authorization_and_response(): void
    {
        $buyer = User::factory()->create();
        $stranger = User::factory()->create();
        $artistUser = User::factory()->create();
        $artist = ArtistProfile::create(['user_id' => $artistUser->id]);
        $service = CommissionService::create([
            'artist_profile_id' => $artist->id,
            'name' => 'Stream Test',
            'base_price' => 50000,
            'description' => 'Stream',
        ]);

        $commission = Commission::create([
            'user_id' => $buyer->id,
            'artist_profile_id' => $artist->id,
            'commission_service_id' => $service->id,
            'title' => 'Stream Order',
            'base_price' => 50000,
            'total_price' => 50000,
            'status' => CommissionStatus::IN_PROGRESS,
        ]);

        // Unauthenticated access fails
        $unauthRes = $this->getJson("/api/commissions/{$commission->id}/stream");
        $unauthRes->assertStatus(401);

        // Stranger access fails (403)
        $strangerRes = $this->actingAs($stranger, 'sanctum')->getJson("/api/commissions/{$commission->id}/stream");
        $strangerRes->assertStatus(403);

        // Authorized participant returns StreamedResponse
        $controller = new LiveStreamController();
        $request = Request::create("/api/commissions/{$commission->id}/stream");
        $request->setUserResolver(fn () => $buyer);

        $response = $controller->streamCommission($request, $commission);
        $this->assertInstanceOf(StreamedResponse::class, $response);
        $this->assertEquals('text/event-stream', $response->headers->get('Content-Type'));
    }
}
