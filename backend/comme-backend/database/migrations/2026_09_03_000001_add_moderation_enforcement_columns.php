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
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('suspended_at')->nullable()->after('remember_token');
            $table->text('suspension_reason')->nullable()->after('suspended_at');
            $table->text('active_warning')->nullable()->after('suspension_reason');
            $table->timestamp('warning_acknowledged_at')->nullable()->after('active_warning');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->boolean('is_taken_down')->default(false)->after('visibility');
            $table->text('taken_down_reason')->nullable()->after('is_taken_down');
        });

        Schema::table('portfolios', function (Blueprint $table) {
            $table->boolean('is_taken_down')->default(false)->after('visibility');
            $table->text('taken_down_reason')->nullable()->after('is_taken_down');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'suspended_at',
                'suspension_reason',
                'active_warning',
                'warning_acknowledged_at',
            ]);
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn([
                'is_taken_down',
                'taken_down_reason',
            ]);
        });

        Schema::table('portfolios', function (Blueprint $table) {
            $table->dropColumn([
                'is_taken_down',
                'taken_down_reason',
            ]);
        });
    }
};
