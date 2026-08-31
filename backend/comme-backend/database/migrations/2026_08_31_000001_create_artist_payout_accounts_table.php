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
        Schema::create('artist_payout_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('artist_profile_id')->constrained('artist_profiles')->cascadeOnDelete();
            $table->string('bank_name'); // e.g. BCA, MANDIRI, BNI, BRI, GOPAY, DANA
            $table->string('bank_account_name');
            $table->text('bank_account_number');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['artist_profile_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('artist_payout_accounts');
    }
};
