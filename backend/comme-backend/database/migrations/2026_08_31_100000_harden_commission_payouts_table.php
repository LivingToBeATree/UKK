<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Harden the commission_payouts table for production safety:
     * - bank fields nullable (payout can be created before artist sets up account)
     * - retry_count for failed-payout retry mechanism
     */
    public function up(): void
    {
        Schema::table('commission_payouts', function (Blueprint $table) {
            $table->string('bank_name')->nullable()->change();
            $table->string('bank_account_name')->nullable()->change();
            $table->string('bank_account_number')->nullable()->change();
            $table->unsignedTinyInteger('retry_count')->default(0)->after('failure_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commission_payouts', function (Blueprint $table) {
            $table->string('bank_name')->nullable(false)->change();
            $table->string('bank_account_name')->nullable(false)->change();
            $table->string('bank_account_number')->nullable(false)->change();
            $table->dropColumn('retry_count');
        });
    }
};
