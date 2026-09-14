<?php

namespace Tests\Feature;

use App\Enum\CommissionStatus;
use App\Enum\NotificationType;
use App\Enum\PaymentStatus;
use App\Enum\ReportReason;
use App\Enum\ReportStatus;
use App\Enum\ServiceStatus;
use App\Enum\TicketPriority;
use App\Enum\UserRole;
use App\Models\ArtistProfile;
use App\Models\Commission;
use App\Models\CommissionPayment;
use App\Models\CommissionService;
use App\Models\Notification;
use App\Models\Report;
use App\Models\Ticket;
use App\Models\User;
use App\Services\API\V1\GeoIpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AntiArbitrageSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_vpn_or_datacenter_ip_forces_fallback_to_usd_currency(): void
    {
        // 1. Simulated VPN header on Indonesian country
        $response = $this->withHeaders([
            'X-Simulated-Country' => 'ID',
            'X-Simulated-VPN' => 'true',
        ])->getJson('/api/geo/location');

        $response->assertStatus(200)
            ->assertJsonPath('data.country_code', 'ID')
            ->assertJsonPath('data.is_vpn', true)
            ->assertJsonPath('data.arbitrage_blocked', true)
            ->assertJsonPath('data.billing_currency', 'USD');

        // 2. Genuine non-VPN Indonesian client receives IDR
        $this->flushHeaders();
        $genuineRes = $this->withHeaders([
            'X-Simulated-Country' => 'ID',
            'X-Simulated-VPN' => 'false',
        ])->getJson('/api/geo/location');

        $genuineRes->assertStatus(200)
            ->assertJsonPath('data.country_code', 'ID')
            ->assertJsonPath('data.is_vpn', false)
            ->assertJsonPath('data.arbitrage_blocked', false)
            ->assertJsonPath('data.billing_currency', 'IDR');

        // 3. Real IP lookup with mocked IP-API returning hosting/datacenter exit node
        Http::fake([
            '*ip-api.com*' => Http::response([
                'status' => 'success',
                'countryCode' => 'ID',
                'country' => 'Indonesia',
                'proxy' => true,
                'hosting' => true,
                'org' => 'M247 Ltd (NordVPN)',
                'isp' => 'NordVPN Exit Node',
            ]),
        ]);

        $this->flushHeaders();
        $ipLookupRes = $this->withHeaders([
            'X-Simulated-IP' => '103.145.2.1',
        ])->getJson('/api/geo/location');

        $ipLookupRes->assertStatus(200)
            ->assertJsonPath('data.country_code', 'ID')
            ->assertJsonPath('data.is_vpn', true)
            ->assertJsonPath('data.is_datacenter', true)
            ->assertJsonPath('data.vpn_provider', 'M247 Ltd (NordVPN)')
            ->assertJsonPath('data.arbitrage_blocked', true)
            ->assertJsonPath('data.billing_currency', 'USD');
    }

    public function test_dev_simulation_headers_ignored_in_production_environment(): void
    {
        // Force production environment configuration
        $this->app['env'] = 'production';
        config(['app.debug' => false]);

        $response = $this->withHeaders([
            'X-Simulated-Country' => 'GB',
            'X-Dev-Country' => 'GB',
        ])->getJson('/api/geo/location');

        $response->assertStatus(200);
        // Simulation must be rejected in production, defaulting to standard public/local detection
        $this->assertFalse($response->json('data.is_simulated'), 'Dev simulation headers must be ignored in production');
    }

    public function test_arbitrage_attempt_triggers_staff_notification_and_high_priority_ticket(): void
    {
        // 1. Seed staff recipients
        $admin = User::factory()->create([
            'username' => 'admin_officer',
            'role' => UserRole::ADMIN,
        ]);
        $mod = User::factory()->create([
            'username' => 'mod_guardian',
            'role' => UserRole::MODERATOR,
        ]);

        // 2. Set up service with IDR base (500,000) and US PPP price ($50 = ~793,650 IDR)
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::create([
            'user_id' => $artist->id,
            'bio' => 'Anti arbitrage artist',
            'commission_open' => true,
        ]);
        $service = CommissionService::create([
            'artist_profile_id' => $artistProfile->id,
            'name' => 'Cyberpunk Character Commission',
            'description' => 'Test regional anti-arbitrage',
            'status' => ServiceStatus::OPEN,
        ]);
        $option = $service->options()->create([
            'title' => 'Full Illustration',
            'base_price' => 500000,
            'base_currency' => 'IDR',
            'pricing_mode' => 'ppp',
            'regional_prices' => [
                'IDR' => 500000,
                'USD' => 50.00,
            ],
        ]);

        $buyer = User::factory()->create(['username' => 'vpn_abuser']);

        // 3. Buyer attempts to order under Indonesian IP through a VPN
        $orderRes = $this->actingAs($buyer, 'sanctum')
            ->withHeaders([
                'X-Simulated-Country' => 'ID',
                'X-Simulated-VPN' => 'true',
            ])
            ->postJson('/api/commissions', [
                'commission_service_id' => $service->id,
                'commission_option_id' => $option->id,
                'description' => 'Evasion attempt with VPN',
            ]);

        $orderRes->assertStatus(201);
        $commissionId = $orderRes->json('data.id');
        $commission = Commission::find($commissionId);

        // Price must be forced to USD rate (~793,650 IDR), NOT local 500,000 IDR rate!
        $this->assertGreaterThan(700000, (float) $commission->total_price);
        $this->assertNotEquals(500000, (float) $commission->total_price);

        // 4. Verify an automated ARBITRAGE Report was created
        $report = Report::where('reportable_type', Commission::class)
            ->where('reportable_id', $commission->id)
            ->where('reason', ReportReason::ARBITRAGE)
            ->first();

        $this->assertNotNull($report, 'Automated ARBITRAGE report must be generated');
        $this->assertEquals(ReportStatus::PENDING, $report->status);
        $this->assertStringContainsString('Anti-Arbitrage Alert (Terms Section 4)', $report->description);

        // 5. Verify an attached HIGH priority Ticket exists
        $ticket = Ticket::where('report_id', $report->id)->first();
        $this->assertNotNull($ticket, 'Ticket must be created for arbitrage report');
        $this->assertEquals(TicketPriority::HIGH, $ticket->priority);

        // 6. Verify staff were notified
        $adminNotice = Notification::where('user_id', $admin->id)
            ->where('notifiable_type', Commission::class)
            ->where('notifiable_id', $commission->id)
            ->first();
        $this->assertNotNull($adminNotice, 'Admin must receive security alert notification');
        $this->assertStringContainsString('Anti-Arbitrage', $adminNotice->title);

        $modNotice = Notification::where('user_id', $mod->id)
            ->where('notifiable_type', Commission::class)
            ->where('notifiable_id', $commission->id)
            ->first();
        $this->assertNotNull($modNotice, 'Moderator must receive security alert notification');
    }

    public function test_payment_method_bank_mismatch_flags_residential_proxy_arbitrage(): void
    {
        // 1. Seed admin
        $admin = User::factory()->create([
            'role' => UserRole::ADMIN,
        ]);

        // 2. Create commission with IDR pricing
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::create([
            'user_id' => $artist->id,
            'bio' => 'Artist Profile',
            'commission_open' => true,
        ]);
        $service = CommissionService::create([
            'artist_profile_id' => $artistProfile->id,
            'name' => 'IDR Regional Commission',
            'description' => 'IDR regional test service',
            'status' => ServiceStatus::OPEN,
        ]);
        $option = $service->options()->create([
            'title' => 'Option',
            'base_price' => 300000,
            'base_currency' => 'IDR',
        ]);
        $buyer = User::factory()->create(['username' => 'residential_proxy_user']);

        $commission = Commission::create([
            'commission_service_id' => $service->id,
            'commission_option_id' => $option->id,
            'artist_profile_id' => $artistProfile->id,
            'user_id' => $buyer->id,
            'status' => CommissionStatus::ACCEPTED,
            'total_price' => 300000,
        ]);

        $orderId = 'CMS-' . $commission->id . '-test-order';
        $payment = CommissionPayment::create([
            'commission_id' => $commission->id,
            'order_id' => $orderId,
            'status' => PaymentStatus::PENDING,
            'gross_amount' => 300000,
        ]);

        // 3. Prepare Midtrans webhook payload with foreign credit card bank
        $grossAmount = '300000.00';
        $statusCode = '200';
        $serverKey = config('midtrans.server_key');
        $signatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signatureKey,
            'transaction_status' => 'settlement',
            'transaction_id' => 'midtrans-tx-999',
            'payment_type' => 'credit_card',
            'bank' => 'chase_us', // Foreign bank! Mismatch on IDR regional order
            'masked_card' => '411111-XXXX-1111',
        ];

        $webhookRes = $this->postJson('/api/midtrans/webhook', $payload);
        $webhookRes->assertStatus(200);

        // 4. Assert Anti-Arbitrage report was auto-created for residential proxy mismatch
        $report = Report::where('reportable_type', Commission::class)
            ->where('reportable_id', $commission->id)
            ->where('reason', ReportReason::ARBITRAGE)
            ->first();

        $this->assertNotNull($report, 'Report must be created for foreign bank mismatch');
        $this->assertStringContainsString('Residential Proxy / Payment Mismatch', $report->description);
        $this->assertStringContainsString('chase_us', $report->description);

        $ticket = Ticket::where('report_id', $report->id)->first();
        $this->assertNotNull($ticket);
        $this->assertEquals(TicketPriority::HIGH, $ticket->priority);
    }
}
