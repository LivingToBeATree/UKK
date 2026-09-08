<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\CommissionService;
use App\Models\Portfolio;
use App\Models\Post;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('commission_services', function (Blueprint $table) {
            if (!Schema::hasColumn('commission_services', 'slug')) {
                $table->string('slug')->nullable()->unique()->after('name');
            }
        });

        Schema::table('portfolios', function (Blueprint $table) {
            if (!Schema::hasColumn('portfolios', 'slug')) {
                $table->string('slug')->nullable()->unique()->after('title');
            }
        });

        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'slug')) {
                $table->string('slug')->nullable()->unique()->after('content');
            }
        });

        // Backfill existing CommissionServices
        try {
            CommissionService::whereNull('slug')->chunkById(100, function ($services) {
                foreach ($services as $service) {
                    $base = Str::slug($service->name ?: 'service');
                    $base = Str::limit($base, 100, '');
                    $slug = $base;
                    $counter = 1;
                    while (CommissionService::where('slug', $slug)->where('id', '!=', $service->id)->exists()) {
                        $slug = "{$base}-{$counter}";
                        $counter++;
                    }
                    $service->slug = $slug;
                    $service->saveQuietly();
                }
            });
        } catch (\Throwable $e) {
            // Ignore backfill errors if tables are empty during testing
        }

        // Backfill existing Portfolios
        try {
            Portfolio::whereNull('slug')->chunkById(100, function ($portfolios) {
                foreach ($portfolios as $portfolio) {
                    $base = Str::slug($portfolio->title ?: 'artwork');
                    $base = Str::limit($base, 100, '');
                    $slug = $base;
                    $counter = 1;
                    while (Portfolio::where('slug', $slug)->where('id', '!=', $portfolio->id)->exists()) {
                        $slug = "{$base}-{$counter}";
                        $counter++;
                    }
                    $portfolio->slug = $slug;
                    $portfolio->saveQuietly();
                }
            });
        } catch (\Throwable $e) {
            // Ignore backfill errors
        }

        // Backfill existing Posts
        try {
            Post::whereNull('slug')->chunkById(100, function ($posts) {
                foreach ($posts as $post) {
                    $snippet = $post->content ? Str::words($post->content, 6, '') : "post-{$post->id}";
                    $base = Str::slug($snippet ?: "post-{$post->id}");
                    $base = Str::limit($base, 100, '');
                    $slug = $base;
                    $counter = 1;
                    while (Post::where('slug', $slug)->where('id', '!=', $post->id)->exists()) {
                        $slug = "{$base}-{$counter}";
                        $counter++;
                    }
                    $post->slug = $slug;
                    $post->saveQuietly();
                }
            });
        } catch (\Throwable $e) {
            // Ignore backfill errors
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commission_services', function (Blueprint $table) {
            if (Schema::hasColumn('commission_services', 'slug')) {
                $table->dropColumn('slug');
            }
        });

        Schema::table('portfolios', function (Blueprint $table) {
            if (Schema::hasColumn('portfolios', 'slug')) {
                $table->dropColumn('slug');
            }
        });

        Schema::table('posts', function (Blueprint $table) {
            if (Schema::hasColumn('posts', 'slug')) {
                $table->dropColumn('slug');
            }
        });
    }
};
