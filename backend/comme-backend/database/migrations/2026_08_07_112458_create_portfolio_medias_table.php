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
        Schema::create('portfolio_medias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained()->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->string('media_type');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->unsignedSmallInteger('sort_order');
            $table->text('alt_text');
            $table->boolean('is_thumbnail')->default(false);
            $table->timestamps();
        });

        Schema::table('portfolios', function (Blueprint $table) {
            $table->foreign('thumbnail_media_id')->references('id')->on('portfolio_medias')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {
            $table->dropForeign(['thumbnail_media_id']);
        });

        Schema::dropIfExists('portfolio_medias');
    }
};
