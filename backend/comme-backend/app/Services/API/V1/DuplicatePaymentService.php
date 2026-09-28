<?php

namespace App\Services\API\V1;

use App\Enum\CommissionStatus;
use App\Enum\NotificationType;
use App\Enum\PaymentStatus;
use App\Enum\ReportReason;
use App\Enum\ReportStatus;
use App\Enum\TicketPriority;
use App\Models\Commission;
use App\Models\CommissionPayment;
use App\Models\Report;
use App\Services\API\V1\StaffNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DuplicatePaymentService
{
    public function __construct(
        protected MidtransService $midtransService
    ) {}

    /**
     * Atomically resolves duplicate payment attempts for the same commission with
     * strict failure isolation:
     *
     * Phase 1: Short DB transaction - locks and reserves the duplicate payment state.
     * Phase 2: External Gateway API call - attempts refund using deterministic refund key and verifies ambiguity.
     * Phase 3: Short DB transaction - finalizes payment state (REFUNDED or PENDING_MANUAL_REFUND).
     * Phase 4: Operational Escalation - best-effort Report, Ticket, and StaffNotification creation.
     */
    public function handleDuplicateSettlement(
        CommissionPayment $payment,
        Commission $commission,
        array $gatewayData
    ): array {
        // Phase 1: Short DB Transaction - Reserve duplicate payment state
        $reservation = DB::transaction(function () use ($payment, $commission, $gatewayData) {
            $lockedPayment = CommissionPayment::whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedCommission = Commission::whereKey($commission->id)
                ->with(['user', 'artistProfile'])
                ->lockForUpdate()
                ->firstOrFail();

            // Idempotency: if already processed or processing, return early
            if (in_array($lockedPayment->status, [
                PaymentStatus::REFUNDED,
                PaymentStatus::PENDING_MANUAL_REFUND,
                PaymentStatus::REFUND_PROCESSING,
            ], true)) {
                return [
                    'already_handled' => true,
                    'payment' => $lockedPayment,
                    'commission' => $lockedCommission,
                ];
            }

            // Verify another payment attempt has actually settled or commission is in progress
            $hasExistingPaid = $lockedCommission->payments()
                ->where('id', '!=', $lockedPayment->id)
                ->whereIn('status', [
                    PaymentStatus::PAID->value,
                    PaymentStatus::REFUND_PROCESSING->value,
                    PaymentStatus::REFUNDED->value,
                    PaymentStatus::PENDING_MANUAL_REFUND->value,
                ])
                ->exists() || in_array($lockedCommission->status, [
                    CommissionStatus::IN_PROGRESS,
                    CommissionStatus::COMPLETED,
                ], true);

            if (! $hasExistingPaid) {
                return [
                    'not_duplicate' => true,
                ];
            }

            Log::critical("Duplicate payment attempt detected for Commission #{$lockedCommission->id} (Order: {$lockedPayment->order_id}). Reserving for refund.");

            $rawResponse = array_merge($lockedPayment->raw_response ?? [], [
                'duplicate_payment_received' => true,
                'gateway_data' => $gatewayData,
            ]);

            $lockedPayment->update([
                'status' => PaymentStatus::REFUND_PROCESSING->value,
                'paid_at' => now(),
                'midtrans_transaction_id' => $gatewayData['transaction_id'] ?? $lockedPayment->midtrans_transaction_id,
                'payment_type' => $gatewayData['payment_type'] ?? $lockedPayment->payment_type,
                'raw_response' => $rawResponse,
            ]);

            return [
                'already_handled' => false,
                'order_id' => $lockedPayment->order_id,
                'amount' => (float) $lockedPayment->gross_amount,
                'payment_id' => $lockedPayment->id,
                'commission_id' => $lockedCommission->id,
                'buyer_id' => $lockedCommission->user_id,
                'raw_response' => $rawResponse,
            ];
        });

        if (! empty($reservation['already_handled'])) {
            return $reservation;
        }

        if (! empty($reservation['not_duplicate'])) {
            return $reservation;
        }

        // Phase 2: External Gateway Refund Attempt (OUTSIDE DB Transaction)
        $orderId = $reservation['order_id'];
        $amount = $reservation['amount'];
        $refundKey = 'ref-' . $orderId;
        $midtransResponse = null;
        $isRefundSuccessful = false;

        try {
            $midtransResponse = $this->midtransService->refundTransaction(
                $orderId,
                $amount,
                'Duplicate payment attempt for commission',
                $refundKey
            );

            $isRefundSuccessful = is_array($midtransResponse)
                && (! isset($midtransResponse['status_code']) || in_array((string) $midtransResponse['status_code'], ['200', '201', '202'], true));
        } catch (\Throwable $e) {
            Log::error("Gateway exception during duplicate payment refund for Order #{$orderId}: " . $e->getMessage());
            $midtransResponse = [
                'exception' => $e->getMessage(),
                'error' => 'Gateway communication error',
            ];
            $isRefundSuccessful = false;
        }

        // Ambiguity check: query getTransactionStatus to verify if refund succeeded on Midtrans
        if (! $isRefundSuccessful) {
            try {
                $statusCheck = $this->midtransService->getTransactionStatus($orderId);
                if (is_array($statusCheck)) {
                    $txStatus = strtolower((string) ($statusCheck['transaction_status'] ?? ''));
                    $hasRefunds = ! empty($statusCheck['refunds']) || ((float) ($statusCheck['refund_amount'] ?? 0) > 0);

                    if (in_array($txStatus, ['refund', 'partial_refund'], true) || $hasRefunds) {
                        Log::info("Ambiguous duplicate refund for Order #{$orderId} was verified as SUCCEEDED via getTransactionStatus.");
                        $isRefundSuccessful = true;
                        $midtransResponse = $statusCheck;
                    }
                }
            } catch (\Throwable $e) {
                Log::warning("Could not verify status check for Order #{$orderId}: " . $e->getMessage());
            }
        }

        // Phase 3: Short DB Transaction - Finalize Payment Status
        DB::transaction(function () use ($reservation, $isRefundSuccessful, $midtransResponse) {
            $lockedPayment = CommissionPayment::whereKey($reservation['payment_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($isRefundSuccessful) {
                $lockedPayment->update([
                    'status' => PaymentStatus::REFUNDED->value,
                    'raw_response' => array_merge($reservation['raw_response'], [
                        'refund_result' => [
                            'refunded_at' => now()->toISOString(),
                            'amount' => $reservation['amount'],
                            'reason' => 'Duplicate payment attempt',
                            'gateway_response' => $midtransResponse,
                        ],
                    ]),
                ]);
            } else {
                $lockedPayment->update([
                    'status' => PaymentStatus::PENDING_MANUAL_REFUND->value,
                    'raw_response' => array_merge($reservation['raw_response'], [
                        'failed_refund_attempt' => [
                            'attempted_at' => now()->toISOString(),
                            'amount' => $reservation['amount'],
                            'reason' => 'Duplicate payment attempt',
                            'gateway_response' => $midtransResponse,
                        ],
                    ]),
                ]);
            }
        });

        // Phase 4: Operational Escalation (Isolated / Best-Effort)
        if (! $isRefundSuccessful) {
            try {
                $report = Report::create([
                    'user_id' => $reservation['buyer_id'],
                    'reportable_type' => Commission::class,
                    'reportable_id' => $reservation['commission_id'],
                    'reason' => ReportReason::OTHER,
                    'description' => "Duplicate Escrow Payment Received (Order: {$orderId}): "
                        . "Customer completed payment for multiple checkout sessions for Commission #{$reservation['commission_id']}. Full manual refund of Rp " . number_format($amount, 0, ',', '.') . " required.",
                    'status' => ReportStatus::PENDING,
                ]);

                $ticket = $report->ticket()->create([
                    'priority' => TicketPriority::HIGH,
                ]);

                $ticket->messages()->create([
                    'user_id' => $reservation['buyer_id'],
                    'content' => "High Priority: Duplicate payment of Rp " . number_format($amount, 0, ',', '.') . " was captured on gateway for order {$orderId}. "
                        . "Another payment is already active in escrow. Escalated for manual Iris / gateway refund.",
                ]);

                StaffNotificationService::notifyStaff(
                    'Duplicate Payment Received',
                    "Duplicate payment of Rp " . number_format($amount, 0, ',', '.') . " received for Commission #{$reservation['commission_id']} (Order: {$orderId}). Refund required.",
                    $commission,
                    NotificationType::SYSTEM
                );
            } catch (\Throwable $e) {
                Log::error("Failed to create operational escalation for duplicate payment {$orderId}: " . $e->getMessage());
            }
        }

        return [
            'is_refunded' => $isRefundSuccessful,
            'payment' => $payment->fresh(),
        ];
    }
}
