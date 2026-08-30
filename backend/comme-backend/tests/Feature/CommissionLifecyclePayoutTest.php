<?php

namespace Tests\Feature;

use App\Enum\CommissionStatus;
use App\Enum\PayoutStatus;
use App\Models\ArtistPayoutAccount;
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

    // ─── Existing lifecycle tests ─────────────────────────────────────

    public function test_artist_can_accept_and_decline_commission(): void
    {
        $this->actingAs($this->buyerUser)
            ->postJson("/api/commissions/{$this->commission->id}/accept")
            ->assertForbidden();

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

        $this->assertEquals(CommissionStatus::PENDING, $this->commission->fresh()->status);
        $this->assertEquals('Updated Description', $this->commission->fresh()->description);
    }

    public function test_artist_can_mark_commission_as_delivered(): void
    {
        $this->commission->update(['status' => CommissionStatus::IN_PROGRESS]);

        $this->actingAs($this->buyerUser)
            ->postJson("/api/commissions/{$this->commission->id}/deliver")
            ->assertForbidden();

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

        $this->actingAs($this->artistUser)
            ->postJson("/api/commissions/{$this->commission->id}/confirm")
            ->assertForbidden();

        $response = $this->actingAs($this->buyerUser)
            ->postJson("/api/commissions/{$this->commission->id}/confirm")
            ->assertOk();

        $fresh = $this->commission->fresh();
        $this->assertEquals(CommissionStatus::COMPLETED->value, $response->json('data.status'));
        $this->assertEquals(CommissionStatus::COMPLETED, $fresh->status);
        $this->assertNotNull($fresh->completed_at);

        $payout = CommissionPayout::where('commission_id', $this->commission->id)->first();
        $this->assertNotNull($payout);
        $this->assertEquals(500000, (float) $payout->amount);
        $this->assertEquals('BCA', $payout->bank_name);
    }

    public function test_automatic_release_scheduled_command(): void
    {
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

    // ─── New hardening tests ──────────────────────────────────────────

    public function test_completion_without_payout_account_creates_pending_payout_without_bank_info(): void
    {
        // No payout account configured — complete commission anyway.
        $this->commission->update([
            'status' => CommissionStatus::WAITING_FOR_CLIENT,
            'delivered_at' => now(),
            'review_deadline' => now()->addDays(7),
        ]);

        $this->actingAs($this->buyerUser)
            ->postJson("/api/commissions/{$this->commission->id}/confirm")
            ->assertOk();

        $payout = CommissionPayout::where('commission_id', $this->commission->id)->first();
        $this->assertNotNull($payout);
        $this->assertEquals(PayoutStatus::PENDING, $payout->status);
        $this->assertNull($payout->bank_name);
        $this->assertNull($payout->bank_account_number);

        // Commission is still COMPLETED — payout just hasn't been dispatched.
        $this->assertEquals(CommissionStatus::COMPLETED, $this->commission->fresh()->status);
    }

    public function test_payout_stays_processing_after_api_success(): void
    {
        $this->actingAs($this->artistUser)
            ->putJson('/api/me/payout-account', [
                'bank_name' => 'BCA',
                'bank_account_name' => 'Artist One',
                'bank_account_number' => '1234567890',
            ]);

        $this->commission->update([
            'status' => CommissionStatus::WAITING_FOR_CLIENT,
            'delivered_at' => now(),
            'review_deadline' => now()->addDays(7),
        ]);

        $this->actingAs($this->buyerUser)
            ->postJson("/api/commissions/{$this->commission->id}/confirm")
            ->assertOk();

        $payout = CommissionPayout::where('commission_id', $this->commission->id)->first();

        // Should be PROCESSING, not COMPLETED — completion requires reconciliation.
        $this->assertEquals(PayoutStatus::PROCESSING, $payout->status);
        $this->assertNull($payout->completed_at);
    }

    public function test_reconciliation_command_completes_processing_payouts(): void
    {
        $payout = CommissionPayout::create([
            'commission_id' => $this->commission->id,
            'artist_profile_id' => $this->artistProfile->id,
            'amount' => 500000,
            'status' => PayoutStatus::PROCESSING,
            'reference' => 'PAYOUT-' . $this->commission->id,
            'bank_name' => 'BCA',
            'bank_account_name' => 'Artist One',
            'bank_account_number' => '1234567890',
            'requested_at' => now()->subMinutes(5), // >60s ago so simulation reports 'completed'
        ]);

        $this->artisan('commissions:reconcile-payouts')
            ->assertSuccessful();

        $this->assertEquals(PayoutStatus::COMPLETED, $payout->fresh()->status);
        $this->assertNotNull($payout->fresh()->completed_at);
    }

    public function test_failed_payout_is_retried_by_retry_command(): void
    {
        $this->actingAs($this->artistUser)
            ->putJson('/api/me/payout-account', [
                'bank_name' => 'BCA',
                'bank_account_name' => 'Artist One',
                'bank_account_number' => '1234567890',
            ]);

        $payout = CommissionPayout::create([
            'commission_id' => $this->commission->id,
            'artist_profile_id' => $this->artistProfile->id,
            'amount' => 500000,
            'status' => PayoutStatus::FAILED,
            'reference' => 'PAYOUT-' . $this->commission->id,
            'bank_name' => 'BCA',
            'bank_account_name' => 'Artist One',
            'bank_account_number' => '1234567890',
            'failed_at' => now()->subMinutes(20),
            'failure_reason' => 'Simulated failure',
            'retry_count' => 0,
        ]);

        $this->artisan('commissions:retry-failed-payouts')
            ->assertSuccessful();

        $fresh = $payout->fresh();
        // After retry, payout should be dispatched (PROCESSING in simulation mode).
        $this->assertContains($fresh->status, [PayoutStatus::PROCESSING, PayoutStatus::FAILED]);
        $this->assertEquals(1, $fresh->retry_count);
    }

    public function test_retry_stops_after_max_attempts(): void
    {
        $payout = CommissionPayout::create([
            'commission_id' => $this->commission->id,
            'artist_profile_id' => $this->artistProfile->id,
            'amount' => 500000,
            'status' => PayoutStatus::FAILED,
            'reference' => 'PAYOUT-' . $this->commission->id,
            'bank_name' => 'BCA',
            'bank_account_name' => 'Artist One',
            'bank_account_number' => '1234567890',
            'failed_at' => now()->subMinutes(20),
            'failure_reason' => 'Persistent failure',
            'retry_count' => 3, // Already at max
        ]);

        $this->artisan('commissions:retry-failed-payouts')
            ->assertSuccessful();

        // Should NOT have been retried — still FAILED, still retry_count 3.
        $fresh = $payout->fresh();
        $this->assertEquals(PayoutStatus::FAILED, $fresh->status);
        $this->assertEquals(3, $fresh->retry_count);
    }

    public function test_request_revision_nullifies_review_deadline(): void
    {
        $this->commission->update([
            'status' => CommissionStatus::WAITING_FOR_CLIENT,
            'delivered_at' => now(),
            'review_deadline' => now()->addDays(7),
        ]);

        // Artist cannot request revision
        $this->actingAs($this->artistUser)
            ->postJson("/api/commissions/{$this->commission->id}/request-revision")
            ->assertForbidden();

        // Buyer requests revision
        $response = $this->actingAs($this->buyerUser)
            ->postJson("/api/commissions/{$this->commission->id}/request-revision")
            ->assertOk();

        $fresh = $this->commission->fresh();
        $this->assertEquals(CommissionStatus::REVISION->value, $response->json('data.status'));
        $this->assertEquals(CommissionStatus::REVISION, $fresh->status);
        $this->assertNull($fresh->review_deadline);
    }

    public function test_re_delivery_after_revision_resets_review_deadline(): void
    {
        $this->commission->update([
            'status' => CommissionStatus::REVISION,
            'delivered_at' => now()->subDays(3),
            'review_deadline' => null,
        ]);

        $response = $this->actingAs($this->artistUser)
            ->postJson("/api/commissions/{$this->commission->id}/deliver")
            ->assertOk();

        $fresh = $this->commission->fresh();
        $this->assertEquals(CommissionStatus::WAITING_FOR_CLIENT, $fresh->status);
        $this->assertNotNull($fresh->review_deadline);
        // New review deadline should be approximately now + 7 days.
        $this->assertTrue($fresh->review_deadline->isFuture());
    }

    public function test_duplicate_completion_is_idempotent(): void
    {
        $this->commission->update([
            'status' => CommissionStatus::WAITING_FOR_CLIENT,
            'delivered_at' => now(),
            'review_deadline' => now()->addDays(7),
        ]);

        // First confirmation succeeds.
        $this->actingAs($this->buyerUser)
            ->postJson("/api/commissions/{$this->commission->id}/confirm")
            ->assertOk();

        // Second attempt should fail (commission is now COMPLETED, not WAITING_FOR_CLIENT).
        $this->actingAs($this->buyerUser)
            ->postJson("/api/commissions/{$this->commission->id}/confirm")
            ->assertUnprocessable();

        // Only one payout record should exist.
        $this->assertEquals(1, CommissionPayout::where('commission_id', $this->commission->id)->count());
    }

    public function test_bank_account_encryption_roundtrip(): void
    {
        $this->actingAs($this->artistUser)
            ->putJson('/api/me/payout-account', [
                'bank_name' => 'BNI',
                'bank_account_name' => 'Artist One',
                'bank_account_number' => '9876543210',
            ])
            ->assertOk();

        $account = ArtistPayoutAccount::where('artist_profile_id', $this->artistProfile->id)
            ->where('is_active', true)
            ->first();

        // Model should decrypt transparently.
        $this->assertEquals('9876543210', $account->bank_account_number);

        // Raw DB value should NOT be plaintext.
        $rawRow = \Illuminate\Support\Facades\DB::table('artist_payout_accounts')
            ->where('id', $account->id)
            ->first();
        $this->assertNotEquals('9876543210', $rawRow->bank_account_number);
    }
}
