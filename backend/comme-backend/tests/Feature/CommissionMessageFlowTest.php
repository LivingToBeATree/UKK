<?php

namespace Tests\Feature;

use App\Enum\ServiceStatus;
use App\Enum\CommissionStatus;
use App\Enum\UserRole;
use App\Models\ArtistProfile;
use App\Models\Commission;
use App\Models\CommissionMessage;
use App\Models\CommissionService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommissionMessageFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_and_artist_can_exchange_messages_on_commission(): void
    {
        $artist = User::factory()->create(['role' => UserRole::USER]);
        $client = User::factory()->create(['role' => UserRole::USER]);

        $profile = ArtistProfile::create([
            'user_id' => $artist->id,
            'bio' => 'Artist Bio',
        ]);

        $service = CommissionService::create([
            'artist_profile_id' => $profile->id,
            'name' => 'Illustration Service',
            'description' => 'Custom illustration description',
            'status' => ServiceStatus::OPEN,
        ]);

        $commission = Commission::create([
            'user_id' => $client->id,
            'artist_profile_id' => $profile->id,
            'commission_service_id' => $service->id,
            'status' => CommissionStatus::IN_PROGRESS,
            'total_price' => 500000,
        ]);

        // Client sends message
        Sanctum::actingAs($client);

        $clientMsgResponse = $this->postJson("/api/commissions/{$commission->id}/messages", [
            'message' => 'Here are my character references.',
        ]);

        $clientMsgResponse->assertCreated()
            ->assertJsonPath('data.message', 'Here are my character references.')
            ->assertJsonPath('data.sender.id', $client->id)
            ->assertJsonPath('data.recipient.id', $artist->id);

        $this->assertDatabaseHas('commission_messages', [
            'commission_id' => $commission->id,
            'sender_id' => $client->id,
            'recipient_id' => $artist->id,
            'message' => 'Here are my character references.',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $artist->id,
            'actor_id' => $client->id,
            'title' => 'New Commission Message',
        ]);

        // Artist replies
        Sanctum::actingAs($artist);

        $artistMsgResponse = $this->postJson("/api/commissions/{$commission->id}/messages", [
            'message' => 'Looks great! Starting now.',
        ]);

        $artistMsgResponse->assertCreated()
            ->assertJsonPath('data.message', 'Looks great! Starting now.')
            ->assertJsonPath('data.sender.id', $artist->id)
            ->assertJsonPath('data.recipient.id', $client->id);

        // List messages
        $listResponse = $this->getJson("/api/commissions/{$commission->id}/messages");
        $listResponse->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_third_party_user_cannot_send_or_view_messages_on_commission(): void
    {
        $artist = User::factory()->create(['role' => UserRole::USER]);
        $client = User::factory()->create(['role' => UserRole::USER]);
        $thirdParty = User::factory()->create(['role' => UserRole::USER]);

        $profile = ArtistProfile::create([
            'user_id' => $artist->id,
            'bio' => 'Artist Bio',
        ]);

        $service = CommissionService::create([
            'artist_profile_id' => $profile->id,
            'name' => 'Illustration Service',
            'description' => 'Custom illustration description',
            'status' => ServiceStatus::OPEN,
        ]);

        $commission = Commission::create([
            'user_id' => $client->id,
            'artist_profile_id' => $profile->id,
            'commission_service_id' => $service->id,
            'status' => CommissionStatus::IN_PROGRESS,
            'total_price' => 500000,
        ]);

        Sanctum::actingAs($thirdParty);

        $this->getJson("/api/commissions/{$commission->id}/messages")->assertForbidden();
        $this->postJson("/api/commissions/{$commission->id}/messages", [
            'message' => 'Unauthorized intruder message',
        ])->assertForbidden();
    }
}
