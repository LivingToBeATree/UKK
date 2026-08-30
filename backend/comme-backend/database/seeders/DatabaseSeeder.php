<?php

namespace Database\Seeders;

use App\Enum\CommissionStatus;
use App\Enum\CommissionVisibility;
use App\Enum\MessageType;
use App\Enum\PaymentStatus;
use App\Enum\PostVisibilityType;
use App\Enum\ServiceStatus;
use App\Enum\UserRole;
use App\Models\ArtistProfile;
use App\Models\Commission;
use App\Models\CommissionAddon;
use App\Models\CommissionMessage;
use App\Models\CommissionOption;
use App\Models\CommissionPayment;
use App\Models\CommissionService;
use App\Models\Follow;
use App\Models\Portfolio;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        // 1. Admin Account
        $admin = User::firstOrCreate(
            ['email' => 'admin@comme.test'],
            [
                'username' => 'admin',
                'display_name' => 'Comme Administrator',
                'password' => $password,
                'role' => UserRole::ADMIN,
                'email_verified_at' => now(),
            ]
        );

        // 2. Moderator Account
        $moderator = User::firstOrCreate(
            ['email' => 'moderator@comme.test'],
            [
                'username' => 'moderator',
                'display_name' => 'Comme Moderator',
                'password' => $password,
                'role' => UserRole::MODERATOR,
                'email_verified_at' => now(),
            ]
        );

        // 3. Verified Artist Account
        $artistUser = User::firstOrCreate(
            ['email' => 'artist@comme.test'],
            [
                'username' => 'sakura_art',
                'display_name' => 'Sakura Art',
                'password' => $password,
                'role' => UserRole::USER,
                'email_verified_at' => now(),
            ]
        );

        $artistProfile = ArtistProfile::firstOrCreate(
            ['user_id' => $artistUser->id],
            [
                'bio' => 'Freelance digital artist specializing in anime illustrations, fantasy characters, and concept art.',
                'commission_open' => true,
                'website' => 'https://sakura.art',
                'social_links' => ['https://twitter.com/sakura_art', 'https://instagram.com/sakura_art'],
            ]
        );

        $service = CommissionService::firstOrCreate(
            ['artist_profile_id' => $artistProfile->id, 'name' => 'Custom Anime Character Illustration'],
            [
                'description' => 'High-resolution digital illustration with detailed character design and custom background.',
                'status' => ServiceStatus::OPEN,
            ]
        );

        $option = CommissionOption::firstOrCreate(
            ['commission_service_id' => $service->id, 'title' => 'Full Body & Background'],
            [
                'description' => 'Detailed full body illustration with rendered lighting and complete scenic background.',
                'base_price' => 500000,
            ]
        );

        CommissionAddon::firstOrCreate(
            ['commission_option_id' => $option->id, 'title' => 'Commercial Rights'],
            [
                'description' => 'Full commercial license for merchandise, streaming, and marketing use.',
                'additional_price' => 250000,
            ]
        );

        $portfolio = Portfolio::firstOrCreate(
            ['artist_profile_id' => $artistProfile->id, 'title' => 'Fantasy Showcase 2026'],
            [
                'description' => 'Curated portfolio of recent fantasy illustrations and splash art.',
                'visibility' => CommissionVisibility::PUBLIC,
            ]
        );

        $post = Post::firstOrCreate(
            ['user_id' => $artistUser->id, 'content' => 'Excited to announce commissions are officially open! Check out my services on my profile ✨'],
            [
                'portfolio_id' => $portfolio->id,
                'visibility' => PostVisibilityType::PUBLIC,
                'commentable' => true,
            ]
        );

        // 4. Client Account
        $clientUser = User::firstOrCreate(
            ['email' => 'client@comme.test'],
            [
                'username' => 'art_lover',
                'display_name' => 'Art Lover',
                'password' => $password,
                'role' => UserRole::USER,
                'email_verified_at' => now(),
            ]
        );

        // Follow artist
        Follow::firstOrCreate([
            'follower_id' => $clientUser->id,
            'followed_id' => $artistUser->id,
        ]);

        // Like post
        PostLike::firstOrCreate([
            'post_id' => $post->id,
            'user_id' => $clientUser->id,
        ]);

        // Comment on post
        PostComment::firstOrCreate(
            ['post_id' => $post->id, 'user_id' => $clientUser->id],
            [
                'content' => 'Your art style is amazing! Looking forward to commissioning you!',
            ]
        );

        // Active commission
        $commission = Commission::firstOrCreate(
            ['user_id' => $clientUser->id, 'commission_service_id' => $service->id],
            [
                'artist_profile_id' => $artistProfile->id,
                'commission_option_id' => $option->id,
                'description' => 'Original fantasy character with magical elemental effects.',
                'status' => CommissionStatus::IN_PROGRESS,
                'total_price' => $option->base_price,
                'deadline' => now()->addDays(7),
            ]
        );

        // Sample message exchange
        CommissionMessage::firstOrCreate(
            ['commission_id' => $commission->id, 'sender_id' => $clientUser->id],
            [
                'recipient_id' => $artistUser->id,
                'message' => 'Hello! I sent over the character reference sheet. Let me know if you have any questions!',
                'message_type' => MessageType::USER,
            ]
        );

        CommissionMessage::firstOrCreate(
            ['commission_id' => $commission->id, 'sender_id' => $artistUser->id],
            [
                'recipient_id' => $clientUser->id,
                'message' => 'Thank you! The references look great. I will have the initial sketch ready for you in 2 days.',
                'message_type' => MessageType::USER,
            ]
        );

        // Seed sample pending commission payment for Webhook testing
        CommissionPayment::firstOrCreate(
            ['order_id' => 'CMS-DEMO-101'],
            [
                'commission_id' => $commission->id,
                'status' => PaymentStatus::PENDING->value,
                'gross_amount' => $commission->total_price,
            ]
        );
    }
}
