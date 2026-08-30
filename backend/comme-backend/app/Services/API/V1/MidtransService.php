<?php

namespace App\Services\API\V1;

use App\Enum\PaymentStatus;
use App\Models\Commission;
use App\Models\CommissionPayment;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Asks Midtrans for a Snap token — the frontend uses this token to
     * open the Snap popup (via their snap.js script), which handles the
     * actual card/e-wallet/VA UI entirely on Midtrans's side. We never
     * see or touch raw card numbers ourselves.
     */
    public function createSnapTransaction(CommissionPayment $payment, Commission $commission): string
    {
        return Snap::getSnapToken([
            'transaction_details' => [
                'order_id' => $payment->order_id,
                'gross_amount' => (int) $payment->gross_amount,
            ],
            'customer_details' => [
                'first_name' => $commission->user->display_name,
                'email' => $commission->user->email,
            ],
            'item_details' => [[
                'id' => (string) $commission->id,
                'price' => (int) $payment->gross_amount,
                'quantity' => 1,
                'name' => $commission->commissionService->name,
            ]],
        ]);
    }

    /**
     * SHA512(order_id + status_code + gross_amount + ServerKey) — the
     * exact formula Midtrans documents. Uses hash_equals() rather than
     * === specifically to avoid timing attacks: a naive string
     * comparison can leak information about how many leading characters
     * matched based on how long the comparison took, letting an attacker
     * guess the correct signature byte by byte. hash_equals() always
     * takes the same amount of time regardless of where a mismatch
     * occurs.
     *
     * $payload's order_id/status_code/gross_amount must be exactly what
     * Midtrans sent, unmodified — don't reformat gross_amount before
     * calling this, since Midtrans computed their signature against
     * their own string format ("150000.00"), not however we'd normally
     * store or display it.
     */
    public function verifySignature(array $payload): bool
    {
        foreach (['order_id', 'status_code', 'gross_amount', 'signature_key'] as $key) {
            if (! array_key_exists($key, $payload) || ! is_scalar($payload[$key])) {
                return false;
            }
        }

        // Allow dev mock signature in local environment for easy sandbox testing
        if (app()->environment('local') && ($payload['signature_key'] === 'dev_mock_signature')) {
            return true;
        }

        $serverKey = config('midtrans.server_key');

        if (! is_string($serverKey) || $serverKey === '') {
            return false;
        }

        $expected = hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].$serverKey,
        );

        return hash_equals($expected, (string) $payload['signature_key']);
    }

    /**
     * Midtrans's transaction_status doesn't map 1:1 to a simple
     * paid/not-paid — card payments need fraud_status checked too
     * (a 'challenge' means Midtrans's fraud system flagged it for
     * manual review, not an outright success).
     */
    public function mapStatus(string $transactionStatus, ?string $fraudStatus): PaymentStatus
    {
        return match(true) {
            $transactionStatus === 'capture' && $fraudStatus === 'accept' => PaymentStatus::PAID,
            $transactionStatus === 'capture' => PaymentStatus::PENDING, // challenge, etc — held for review
            $transactionStatus === 'settlement' => PaymentStatus::PAID,
            $transactionStatus === 'pending' => PaymentStatus::PENDING,
            $transactionStatus === 'deny' => PaymentStatus::FAILED,
            $transactionStatus === 'cancel' => PaymentStatus::CANCELLED,
            $transactionStatus === 'expire' => PaymentStatus::EXPIRED,
            in_array($transactionStatus, ['refund', 'partial_refund'], true) => PaymentStatus::REFUNDED,
            default => PaymentStatus::FAILED,
        };
    }
}
