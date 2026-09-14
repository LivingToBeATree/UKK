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
        Schema::table('commission_options', function (Blueprint $table) {
            $table->string('pricing_mode', 30)->default('ppp')->after('base_currency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commission_options', function (Blueprint $table) {
            $table->dropColumn('pricing_mode');
        });
    }
};
