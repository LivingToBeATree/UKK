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
            $table->string('base_currency', 10)->default('IDR')->after('base_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commission_options', function (Blueprint $table) {
            $table->dropColumn('base_currency');
        });
    }
};
