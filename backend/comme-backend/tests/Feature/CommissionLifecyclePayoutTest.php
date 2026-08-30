<?php

namespace Tests\Feature;

use App\Enum\CommissionStatus;
use App\Enum\PayoutStatus;
use App\Models\ArtistProfile;
use App\Models\Commission;
use App\Models\CommissionOption;
use App\Models\CommissionPayout;
use App\Models\CommissionService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommissionLifecyclePayoutTest extends TestCase
{
    use RefreshDatabase;

    protected User $artistUser;
    protected ArtistProfile $artistProfile;
    protected User $buyerUser;
    protected CommissionService $service;
    protected CommissionOption $option;
    protected Commission $commission;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artistUser = User::factory()->create(['username' => 'artist_one']);
        $this->artistProfile = ArtistProfile::create([
            'user_id' => $this->artistUser->id,
            'bio' => 'Artist Bio',
            'commission_open' => true,
        ]);

        $this->buyerUser = User::factory()->create(['username' => 'buyer_one']);

        $this->service = CommissionService::create([
            'artist_profile_id' => $this->artistProfile->id,
            'name' => 'Digital Illustration',
            'description' => 'Custom digital illustration',
        ]);

        $this->option = CommissionOption::create([
            'commission_service_id' => $this->service->id,
            'title' => 'Full Color',
            'base_price' => 500000,
        ]);

        $this->commission = Commission::create([
            'commission_service_id' => $this->service->id,
            'commission_option_id' => $this->option->id,
            'artist_profile_id' => $this->artistProfile->id,
            'user_id' => $this->buyerUser->id,
            'status' => CommissionStatus::PENDING,
            'description' => 'Cyberpunk character design',
            'total_price' => 500000,
            'deadline' => now()->addDays(14)->toDateString(),
        ]);
    }

    public function test_artist_can_accept_and_decline_commission(): void
    {
        // Buyer cannot accept
        $this->actingAs($this->buyerUser)
            ->postJson("/api/commissions/{$this->commission->id}/accept")
            ->assertForbidden();

        // Artist can accept
        $response = $this->actingAs($this->artistUser)
            ->postJson("/api/commissions/{$this->commission->id}/accept")
            ->assertOk();

        $this->assertEquals(CommissionStatus::ACCEPTED->value, $response->json('data.status'));
        $this->assertEquals(CommissionStatus::ACCEPTED, $this->commission->fresh()->status);
    }

    public function test_generic_update_cannot_arbitrarily_modify_commission_status(): void
    {
        $this->actingAs($this->artistUser)
            ->putJson("/api/commissions/{$this->commission->id}", [
                'status' => CommissionStatus::COMPLETED->value,
                'description' => 'Updated Description',
            ])
            ->assertOk();

        // Status must remain PENDING
        $this->assertEquals(CommissionStatus::PENDING, $this->commission->fresh()->status);
        $this->assertEquals('Updated Description', $this->commission->fresh()->description);
    }

    public function test_artist_can_mark_commission_as_delivered(): void
    {
        $this->commission->update(['status' => CommissionStatus::IN_PROGRESS]);

        // Buyer cannot mark delivered
        $this->actingAs($this->buyerUser)
            ->postJson("/api/commissions/{$this->commission->id}/deliver")
            ->assertForbidden();

        // Artist marks delivered
        $response = $this->actingAs($this->artistUser)
            ->postJson("/api/commissions/{$this->commission->id}/deliver")
            ->assertOk();

        $fresh = $this->commission->fresh();
        $this->assertEquals(CommissionStatus::WAITING_FOR_CLIENT->value, $response->json('data.status'));
        $this->assertEquals(CommissionStatus::WAITING_FOR_CLIENT, $fresh->status);
        $this->assertNotNull($fresh->delivered_at);
        $this->assertNotNull($fresh->review_deadline);
    }

    public function test_buyer_can_confirm_completion_and_trigger_payout(): void
    {
        // Set artist payout account
        $this->actingAs($this->artistUser)
            ->putJson('/api/me/payout-account', [
                'bank_name' => 'BCA',
                'bank_account_name' => 'Artist One',
                'bank_account_number' => '1234567890',
            ])
            ->assertOk();

        $this->commission->update([
            'status' => CommissionStatus::WAITING_FOR_CLIENT,
            'delivered_at' => now(),
            'review_deadline' => now()->addDays(7),
        ]);

        // Artist cannot confirm completion
        $this->actingAs($this->artistUser)
            ->postJson("/api/commissions/{$this->commission->id}/confirm")
            ->assertForbidden();

        // Buyer confirms completion
        $response = $this->actingAs($this->buyerUser)
            ->postJson("/api/commissions/{$this->commission->id}/confirm")
            ->assertOk();

        $fresh = $this->commission->fresh();
        $this->assertEquals(CommissionStatus::COMPLETED->value, $response->json('data.status'));
        $this->assertEquals(CommissionStatus::COMPLETED, $fresh->status);
        $this->assertNotNull($fresh->completed_at);

        // Payout ledger must exist
        $payout = CommissionPayout::where('commission_id', $this->commission->id)->first();
        $this->assertNotNull($payout);
        $this->assertEquals(500000, (float) $payout->amount);
        $this->assertEquals('BCA', $payout->bank_name);
        $this->assertEquals('1234567890', $payout->bank_account_number);
    }

    public function test_automatic_release_scheduled_command(): void
    {
        // Expired review deadline
        $this->commission->update([
            'status' => CommissionStatus::WAITING_FOR_CLIENT,
            'delivered_at' => now()->subDays(8),
            'review_deadline' => now()->subDay(),
        ]);

        $this->artisan('commissions:release-due-payouts')
            ->expectsOutputToContain('1 completed')
            ->assertSuccessful();

        $fresh = $this->commission->fresh();
        $this->assertEquals(CommissionStatus::COMPLETED, $fresh->status);
        $this->assertNotNull($fresh->completed_at);
        $this->assertDatabaseHas('commission_payouts', [
            'commission_id' => $this->commission->id,
        ]);
    }

    public function test_artist_payout_account_api_masks_account_number(): void
    {
        $this->actingAs($this->artistUser)
            ->putJson('/api/me/payout-account', [
                'bank_name' => 'MANDIRI',
                'bank_account_name' => 'Artist One',
                'bank_account_number' => '112233445566',
            ])
            ->assertOk()
            ->assertJsonPath('data.bank_account_number', '••••••••5566');

        $this->actingAs($this->artistUser)
            ->getJson('/api/me/payout-account')
            ->assertOk()
            ->assertJsonPath('data.bank_name', 'MANDIRI')
            ->assertJsonPath('data.bank_account_number', '••••••••5566');
    }
}
