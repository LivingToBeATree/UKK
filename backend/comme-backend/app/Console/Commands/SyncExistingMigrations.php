<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class SyncExistingMigrations extends Command
{
    protected $signature = 'migrate:sync-existing';

    protected $description = 'Marks existing database tables and columns as migrated in the migrations table to prevent duplicate table/column errors.';

    public function handle(): int
    {
        $this->info('Checking migrations table and synchronizing with existing database schema...');

        try {
            // Ensure migrations repository exists
            $migrator = app('migrator');
            $repository = $migrator->getRepository();

            if (!$repository->repositoryExists()) {
                $repository->createRepository();
                $this->info('Created migrations table.');
            }

            $ran = $repository->getRan();
            $batch = ($repository->getNextBatchNumber() ?: 1);

            $tableMapping = [
                '0001_01_01_000000_create_users_table' => 'users',
                '0001_01_01_000001_create_cache_table' => 'cache',
                '0001_01_01_000002_create_jobs_table' => 'jobs',
                '2026_08_06_132205_create_artists_profile_table' => 'artist_profiles',
                '2026_08_06_140000_create_medias_table' => 'medias',
                '2026_08_07_044038_create_commission_services_table' => 'commission_services',
                '2026_08_07_044100_create_commission_options_table' => 'commission_options',
                '2026_08_07_044200_create_commission_addons_table' => 'commission_addons',
                '2026_08_07_044300_create_commissions_table' => 'commissions',
                '2026_08_07_044400_create_commission_addon_selections_table' => 'commission_addon_selections',
                '2026_08_07_044500_create_commission_medias_table' => 'commission_medias',
                '2026_08_07_044600_create_commission_messages_table' => 'commission_messages',
                '2026_08_07_044700_create_commission_message_medias_table' => 'commission_message_medias',
                '2026_08_07_044800_create_commission_reviews_table' => 'commission_reviews',
                '2026_08_07_044900_create_commission_revisions_table' => 'commission_revisions',
                '2026_08_07_045000_create_commission_revision_items_table' => 'commission_revision_items',
                '2026_08_07_051600_create_commission_service_medias_table' => 'commission_service_medias',
                '2026_08_07_051719_create_follows_table' => 'follows',
                '2026_08_07_062622_create_notifications_table' => 'notifications',
                '2026_08_07_111434_create_portfolios_table' => 'portfolios',
                '2026_08_07_112458_create_portfolio_medias_table' => 'portfolio_medias',
                '2026_08_07_113013_create_posts_table' => 'posts',
                '2026_08_07_122530_create_post_bookmarks_table' => 'post_bookmarks',
                '2026_08_07_122636_create_post_comments_table' => 'post_comments',
                '2026_08_07_140159_create_post_likes_table' => 'post_likes',
                '2026_08_07_140230_create_post_medias_table' => 'post_medias',
                '2026_08_07_140313_create_reports_table' => 'reports',
                '2026_08_07_141008_create_tags_table' => 'tags',
                '2026_08_07_141051_create_tickets_table' => 'tickets',
                '2026_08_10_014651_create_moderation_actions_table' => 'moderation_actions',
                '2026_08_10_014838_create_ticket_messages_table' => 'ticket_messages',
                '2026_08_10_050213_create_personal_access_tokens_table' => 'personal_access_tokens',
                '2026_08_16_122824_create_commission_payments_table' => 'commission_payments',
                '2026_08_18_000000_create_pending_registrations_table' => 'pending_registrations',
                '2026_08_19_000000_create_artist_applications_table' => 'artist_applications',
                '2026_08_31_000001_create_artist_payout_accounts_table' => 'artist_payout_accounts',
                '2026_08_31_000002_create_commission_payouts_table' => 'commission_payouts',
                '2026_09_02_000001_create_comment_likes_and_bookmarks_tables' => 'comment_likes',
            ];

            $columnMapping = [
                '2026_08_15_005151_add_known_devices_to_users_table' => ['users', 'known_devices'],
                '2026_08_18_000001_add_unique_username_indexes' => ['users', 'username'],
                '2026_08_31_000000_add_review_timestamps_to_commissions_table' => ['commissions', 'delivered_at'],
                '2026_08_31_000003_add_user_id_to_medias_table' => ['medias', 'user_id'],
                '2026_09_01_000000_add_two_factor_columns_to_users_table' => ['users', 'two_factor_secret'],
                '2026_09_02_000001_add_proposed_deadline_to_commissions_table' => ['commissions', 'proposed_deadline'],
                '2026_09_02_000001_make_ticket_id_nullable_in_moderation_actions_table' => ['moderation_actions', 'ticket_id'],
                '2026_09_02_043014_add_sample_artworks_to_artist_applications_table' => ['artist_applications', 'sample_artworks'],
                '2026_09_02_050000_add_banner_to_users_table' => ['users', 'banner'],
                '2026_09_03_000001_add_moderation_enforcement_columns' => ['posts', 'is_taken_down'],
            ];

            $markedCount = 0;

            foreach ($tableMapping as $migration => $table) {
                if (!in_array($migration, $ran)) {
                    $exists = Schema::hasTable($table) || ($table === 'artist_profiles' && Schema::hasTable('artists_profile'));
                    if ($exists) {
                        $repository->log($migration, $batch);
                        $ran[] = $migration;
                        $this->line("Marked existing table migration as ran: {$migration} (table: {$table})");
                        $markedCount++;
                    }
                }
            }

            foreach ($columnMapping as $migration => [$table, $col]) {
                if (!in_array($migration, $ran)) {
                    if (Schema::hasTable($table) && Schema::hasColumn($table, $col)) {
                        $repository->log($migration, $batch);
                        $ran[] = $migration;
                        $this->line("Marked existing column migration as ran: {$migration} (column: {$table}.{$col})");
                        $markedCount++;
                    }
                }
            }

            $this->info("Synchronization complete. Marked {$markedCount} migration(s) as already ran.");
            return 0;
        } catch (Throwable $e) {
            $this->error('Failed to sync migrations: ' . $e->getMessage());
            return 1;
        }
    }
}
