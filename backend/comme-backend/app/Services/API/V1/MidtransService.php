<?php

namespace App\Services\API\V1;

use App\Enum\PaymentStatus;
use App\Models\ArtistTip;
use App\Models\Commission;
use App\Models\CommissionPayment;
use Exception;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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
     * Determine the list of enabled payment channels for Midtrans Snap.
     * International orders (non-IDR currencies like USD, EUR, GBP, JPY, SGD)
     * are strictly routed to ['credit_card'] (Visa, Mastercard, JCB, Amex)
     * so foreign clients land directly on a clean international card checkout
     * without confusing domestic Indonesian Virtual Accounts, QRIS, or e-wallets.
     */
    public function getEnabledPayments(?string $billingCurrency): ?array
    {
        $currency = strtoupper(trim((string) $billingCurrency));

        if (! empty($currency) && $currency !== 'IDR') {
            return ['credit_card'];
        }

        return null;
    }

    /**
     * Build standard payload for Midtrans Snap commission order transaction.
     */
    public function buildSnapPayload(
        CommissionPayment $payment,
        Commission $commission,
        ?string $billingCurrency = null
    ): array {
        $payload = [
            'transaction_details' => [
                'order_id' => $payment->order_id,
                'gross_amount' => (int) $payment->gross_amount,
            ],
            'customer_details' => [
                'first_name' => $commission->user->display_name ?? $commission->user->username ?? 'Customer',
                'email' => $commission->user->email,
            ],
            'item_details' => [[
                'id' => (string) $commission->id,
                'price' => (int) $payment->gross_amount,
                'quantity' => 1,
                'name' => mb_substr($commission->commissionService->name ?? 'Commission Service', 0, 50),
            ]],
        ];

        if ($enabledPayments = $this->getEnabledPayments($billingCurrency)) {
            $payload['enabled_payments'] = $enabledPayments;
        }

        return $payload;
    }

    /**
     * Build standard payload for Midtrans Snap creator micro-donation / tip transaction.
     */
    public function buildTipSnapPayload(ArtistTip $tip): array
    {
        $payload = [
            'transaction_details' => [
                'order_id' => "TIP-{$tip->id}-" . time(),
                'gross_amount' => (int) $tip->amount,
            ],
            'customer_details' => [
                'first_name' => $tip->supporter_name ?: 'Supporter',
                'email' => $tip->supporter_email ?: 'supporter@comme.art',
            ],
            'item_details' => [[
                'id' => "tip-{$tip->id}",
                'price' => (int) $tip->amount,
                'quantity' => 1,
                'name' => 'Tip for ' . mb_substr($tip->artistProfile->user->username ?? 'Artist', 0, 30),
            ]],
        ];

        if ($enabledPayments = $this->getEnabledPayments($tip->currency)) {
            $payload['enabled_payments'] = $enabledPayments;
        }

        return $payload;
    }

    /**
     * Asks Midtrans for a Snap token — the frontend uses this token to
     * open the Snap popup (via their snap.js script), which handles the
     * actual card/e-wallet/VA UI entirely on Midtrans's side.
     */
    public function createSnapTransaction(
        CommissionPayment $payment,
        Commission $commission,
        ?string $billingCurrency = null
    ): string {
        try {
            return Snap::getSnapToken($this->buildSnapPayload($payment, $commission, $billingCurrency));
        } catch (Exception $e) {
            Log::warning('Midtrans Snap Exception: ' . $e->getMessage());

            if (app()->environment('local', 'testing')) {
                return 'mock_snap_token_' . Str::random(24);
            }

            throw $e;
        }
    }

    /**
     * Generate a Snap token for creator micro-donations / tips.
     */
    public function createTipSnapTransaction(ArtistTip $tip): string
    {
        try {
            return Snap::getSnapToken($this->buildTipSnapPayload($tip));
        } catch (Exception $e) {
            Log::warning('Midtrans Tip Snap Exception: ' . $e->getMessage());

            if (app()->environment('local', 'testing')) {
                return 'mock_tip_snap_token_' . Str::random(24);
            }

            throw $e;
        }
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
     * Queries Midtrans API to retrieve the live transaction status for an order.
     */
    public function getTransactionStatus(string $orderId): ?array
    {
        try {
            $statusObj = Transaction::status($orderId);
            return json_decode(json_encode($statusObj), true);
        } catch (Exception $e) {
            Log::warning("Midtrans Transaction Status Exception for {$orderId}: " . $e->getMessage());
            return null;
        }
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

    /**
     * Attempts to refund a settled transaction via Midtrans API.
     */
    public function refundTransaction(string $orderId, float $amount, string $reason): ?array
    {
        try {
            $params = [
                'refund_key' => 'ref-' . time() . '-' . Str::random(6),
                'amount' => (int) $amount,
                'reason' => $reason,
            ];
            $response = Transaction::refund($orderId, $params);
            return json_decode(json_encode($response), true);
        } catch (Exception $e) {
            Log::warning("Midtrans Refund Exception for {$orderId}: " . $e->getMessage());

            if (app()->environment('local', 'testing')) {
                return [
                    'status_code' => '200',
                    'status_message' => 'Success, refund transaction is processed (mocked)',
                    'transaction_id' => 'mock-refund-' . Str::uuid(),
                    'order_id' => $orderId,
                    'gross_amount' => (string) (int) $amount,
                    'refund_amount' => (string) (int) $amount,
                ];
            }

            return null;
        }
    }

    /**
     * Attempts to cancel a pending transaction via Midtrans API.
     */
    public function cancelTransaction(string $orderId): ?array
    {
        try {
            $response = Transaction::cancel($orderId);
            return json_decode(json_encode($response), true);
        } catch (Exception $e) {
            Log::warning("Midtrans Cancel Exception for {$orderId}: " . $e->getMessage());

            if (app()->environment('local', 'testing')) {
                return [
                    'status_code' => '200',
                    'status_message' => 'Success, transaction is canceled (mocked)',
                ];
            }

            return null;
        }
    }
}
