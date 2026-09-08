<?php

use App\Models\Commission;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('commissions', 'slug')) {
            Schema::table('commissions', function (Blueprint $table) {
                $table->string('slug')->nullable()->unique()->after('id');
            });
        }

        // Backfill existing commissions with unique slugs
        Commission::with(['user', 'commissionService'])->orderBy('id')->each(function (Commission $commission) {
            if (empty($commission->slug)) {
                $source = $commission->getSlugSource();
                $base = Str::slug($source ?: "order-{$commission->id}");
                if (empty($base)) {
                    $base = "order-{$commission->id}";
                }
                $base = Str::limit($base, 100, '');
                $slug = $base;
                $counter = 1;

                while (Commission::where('slug', $slug)->where('id', '!=', $commission->id)->exists()) {
                    $slug = "{$base}-{$counter}";
                    $counter++;
                }

                $commission->slug = $slug;
                $commission->saveQuietly();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('commissions', 'slug')) {
            Schema::table('commissions', function (Blueprint $table) {
                $table->dropColumn('slug');
            });
        }
    }
};
