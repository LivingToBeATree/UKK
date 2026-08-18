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
        Schema::create('commission_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commission_id')->constrained()->cascadeOnDelete();

            // Midtrans requires a unique order_id per transaction attempt —
            // this is what WE (yes we) send them, distinct from their own internal
            // transaction_id which we only get back after payment starts.
            $table->string('order_id')->unique();
            $table->string('midtrans_transaction_id')->nullable();

            $table->string('snap_token')->nullable();
            $table->string('status')->default('pending');
            $table->string('payment_type')->nullable(); // e.g. "gopay", "bank_transfer", "credit_card"
            $table->decimal('gross_amount', 12, 2);
            $table->timestamp('paid_at')->nullable();

            // The full raw notification body from Midtrans, for audit and debugging
            $table->json('raw_response')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_payments');
    }
};
