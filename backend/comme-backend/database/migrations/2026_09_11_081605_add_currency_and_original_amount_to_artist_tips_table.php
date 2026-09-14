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
        Schema::table('artist_tips', function (Blueprint $table) {
            $table->string('currency', 10)->default('IDR')->after('amount');
            $table->decimal('original_amount', 12, 2)->nullable()->after('currency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('artist_tips', function (Blueprint $table) {
            $table->dropColumn(['currency', 'original_amount']);
        });
    }
};
