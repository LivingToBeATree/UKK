<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('artist_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('artist_profiles', 'commission_status')) {
                $table->string('commission_status')->default('open')->after('commission_open')->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('artist_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('artist_profiles', 'commission_status')) {
                $table->dropColumn('commission_status');
            }
        });
    }
};
