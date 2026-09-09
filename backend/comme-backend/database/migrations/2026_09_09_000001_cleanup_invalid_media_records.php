<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Clean up broken media records resulting from permission denied writes
        if (Schema::hasTable('post_medias')) {
            DB::table('post_medias')->where('file_path', '0')->orWhereNull('file_path')->delete();
        }
        if (Schema::hasTable('portfolio_medias')) {
            DB::table('portfolio_medias')->where('file_path', '0')->orWhereNull('file_path')->delete();
        }
        if (Schema::hasTable('commission_service_medias')) {
            DB::table('commission_service_medias')->where('file_path', '0')->orWhereNull('file_path')->delete();
        }
        if (Schema::hasTable('medias')) {
            DB::table('medias')->where('file_path', '0')->orWhereNull('file_path')->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse operation for deleting corrupt records
    }
};
