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
        Schema::create('commission_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('artist_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('thumbnail_media_id')->nullable()->constrained('medias')->nullOnDelete();
            $table->string('name');
            $table->text('description');
            $table->string('status')->default('closed');
            $table->text('alt_text')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_services');
    }
};
