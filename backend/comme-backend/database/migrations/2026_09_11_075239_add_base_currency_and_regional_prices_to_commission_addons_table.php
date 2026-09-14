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
        Schema::table('commission_addons', function (Blueprint $table) {
            $table->string('base_currency', 10)->nullable()->after('additional_price');
            $table->json('regional_prices')->nullable()->after('base_currency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commission_addons', function (Blueprint $table) {
            $table->dropColumn(['base_currency', 'regional_prices']);
        });
    }
};
