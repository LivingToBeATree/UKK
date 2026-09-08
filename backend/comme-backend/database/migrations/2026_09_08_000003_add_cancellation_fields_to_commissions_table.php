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
            if (!Schema::hasColumn('commissions', 'cancellation_requested_by')) {
                $table->foreignId('cancellation_requested_by')
                    ->nullable()
                    ->after('status')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('commissions', 'cancellation_reason')) {
                $table->text('cancellation_reason')
                    ->nullable()
                    ->after('cancellation_requested_by');
            }

            if (!Schema::hasColumn('commissions', 'cancellation_requested_at')) {
                $table->timestamp('cancellation_requested_at')
                    ->nullable()
                    ->after('cancellation_reason');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commissions', function (Blueprint $table) {
            if (Schema::hasColumn('commissions', 'cancellation_requested_by')) {
                $table->dropConstrainedForeignId('cancellation_requested_by');
            }

            if (Schema::hasColumn('commissions', 'cancellation_reason')) {
                $table->dropColumn('cancellation_reason');
            }

            if (Schema::hasColumn('commissions', 'cancellation_requested_at')) {
                $table->dropColumn('cancellation_requested_at');
            }
        });
    }
};
