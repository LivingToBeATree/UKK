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
        Schema::table('commissions', function (Blueprint $table) {
            $table->timestamp('delivered_at')->nullable()->after('deadline');
            $table->timestamp('review_deadline')->nullable()->after('delivered_at');
            $table->timestamp('completed_at')->nullable()->after('review_deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commissions', function (Blueprint $table) {
            $table->dropColumn(['delivered_at', 'review_deadline', 'completed_at']);
        });
    }
};
