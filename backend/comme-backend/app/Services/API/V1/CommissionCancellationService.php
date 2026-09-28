<?php

namespace App\Services\API\V1;

use App\Enum\CommissionStatus;
use App\Enum\MessageType;
use App\Enum\NotificationType;
use App\Enum\PaymentStatus;
use App\Enum\ReportReason;
use App\Enum\ReportStatus;
use App\Enum\TicketPriority;
use App\Models\Commission;
use App\Models\CommissionMessage;
use App\Models\Notification;
use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class CommissionCancellationService
{
    public function __construct(
        protected MidtransService $midtransService
    ) {}

    /**
     * Immediate unilateral cancellation.
     * Allowed only for:
     * - PENDING (buyer/artist cancels before work or agreement)
     * - ACCEPTED (cancelled before payment is made)
     * - Staff/Admin emergency override at any state
     *
     * Active orders (IN_PROGRESS, WAITING_FOR_CLIENT, REVISION) must use
     * the negotiated cancellation flow (requestCancellation).
     */
    public function cancelImmediately(Commission $commission, User $actor): Commission
    {
        $allowedImmediateStatuses = [
            CommissionStatus::PENDING,
            CommissionStatus::ACCEPTED,
        ];

        $isActiveOrder = in_array($commission->status, [
            CommissionStatus::IN_PROGRESS,
            CommissionStatus::WAITING_FOR_CLIENT,
            CommissionStatus::REVISION,
        ], true);

        if ($isActiveOrder && ! $actor->isStaff()) {
            throw new InvalidArgumentException(
                "Active commissions in '{$commission->status->value}' status cannot be cancelled unilaterally. Please use the negotiated cancellation flow (/request-cancellation) to reach mutual agreement."
            );
        }

        if (! in_array($commission->status, $allowedImmediateStatuses, true) && ! $actor->isStaff()) {
            throw new InvalidArgumentException(
                'This commission cannot be cancelled in its current state.'
            );
        }

        // Atomically lock, mark refund reservation if paid, and retrieve payment IDs
        $paymentData = DB::transaction(function () use ($commission) {
            $locked = Commission::whereKey($commission->id)
                ->lockForUpdate()
                ->firstOrFail();

            $pendingOrderIds = $locked->payments()
                ->where('status', PaymentStatus::PENDING->value)
                ->pluck('order_id')
                ->toArray();

            $paidPayment = $locked->payments()
                ->where('status', PaymentStatus::PAID->value)
                ->latest()
                ->first();

            if ($paidPayment) {
                $paidPayment->update(['status' => PaymentStatus::REFUND_PROCESSING->value]);
            }

            $locked->update(['status' => CommissionStatus::CANCELLED]);

            return [
                'pending_order_ids' => $pendingOrderIds,
                'paid_order_id' => $paidPayment?->order_id,
                'paid_amount' => $paidPayment ? (float) $paidPayment->gross_amount : 0.0,
                'paid_id' => $paidPayment?->id,
                'raw_response' => $paidPayment?->raw_response ?? [],
            ];
        });

        // External gateway calls OUTSIDE DB transaction
        $verifiedCancelledOrderIds = [];
        foreach ($paymentData['pending_order_ids'] as $orderId) {
            if ($this->cancelPendingMidtransOrder($orderId)) {
                $verifiedCancelledOrderIds[] = $orderId;
            }
        }

        $midtransResponse = null;
        $isRefundSuccessful = false;
        try {
            if ($paymentData['paid_order_id'] && $paymentData['paid_amount'] > 0) {
                $midtransResponse = $this->midtransService->refundTransaction(
                    $paymentData['paid_order_id'],
                    $paymentData['paid_amount'],
                    'Commission cancelled'
                );

                $isRefundSuccessful = is_array($midtransResponse)
                    && (! isset($midtransResponse['status_code']) || in_array((string) $midtransResponse['status_code'], ['200', '201', '202'], true));
            }
        } catch (\Throwable $e) {
            Log::error("Gateway exception during immediate cancellation refund of Commission #{$commission->id}: " . $e->getMessage());
            $midtransResponse = [
                'exception' => $e->getMessage(),
                'error' => 'Gateway communication error',
            ];
            $isRefundSuccessful = false;
        }

        // Short atomic update for payment records with fail-closed financial integrity
        DB::transaction(function () use ($commission, $paymentData, $verifiedCancelledOrderIds, $isRefundSuccessful, $midtransResponse) {
            if (! empty($verifiedCancelledOrderIds)) {
                $commission->payments()
                    ->whereIn('order_id', $verifiedCancelledOrderIds)
                    ->update(['status' => PaymentStatus::CANCELLED->value]);
            }

            if ($paymentData['paid_id']) {
                $paidPayment = $commission->payments()->whereKey($paymentData['paid_id'])->first();
                if ($paidPayment) {
                    if ($isRefundSuccessful) {
                        $paidPayment->update([
                            'status' => PaymentStatus::REFUNDED->value,
                            'raw_response' => array_merge($paymentData['raw_response'], [
                                'refund_result' => [
                                    'refunded_at' => now()->toISOString(),
                                    'amount' => $paymentData['paid_amount'],
                                    'reason' => 'Immediate cancellation',
                                    'gateway_response' => $midtransResponse,
                                ],
                            ]),
                        ]);
                    } else {
                        Log::error("Midtrans refund failed during immediate cancellation of Commission #{$commission->id}, Payment #{$paidPayment->id}. Marking as PENDING_MANUAL_REFUND.");

                        $paidPayment->update([
                            'status' => PaymentStatus::PENDING_MANUAL_REFUND->value,
                            'raw_response' => array_merge($paymentData['raw_response'], [
                                'failed_refund_attempt' => [
                                    'attempted_at' => now()->toISOString(),
                                    'amount' => $paymentData['paid_amount'],
                                    'reason' => 'Immediate cancellation',
                                    'gateway_response' => $midtransResponse,
                                ],
                            ]),
                        ]);

                        $buyerUser = $commission->user;
                        $report = Report::create([
                            'user_id' => $buyerUser?->id ?? $commission->user_id,
                            'reportable_type' => Commission::class,
                            'reportable_id' => $commission->id,
                            'reason' => ReportReason::OTHER,
                            'description' => "Manual Escrow Refund Required (Order: {$paidPayment->order_id}): "
                                . "Immediate cancellation for Commission #{$commission->id} was processed, but Midtrans automated direct refund failed. "
                                . "Please disburse manual escrow refund of Rp " . number_format($paymentData['paid_amount'], 0, ',', '.') . " to client @{$buyerUser?->username} via Midtrans Iris disbursement portal.",
                            'status' => ReportStatus::PENDING,
                        ]);

                        $ticket = $report->ticket()->create([
                            'priority' => TicketPriority::HIGH,
                        ]);

                        $ticket->messages()->create([
                            'user_id' => $buyerUser?->id ?? $commission->user_id,
                            'content' => "Automated Escrow Refund Failure: Midtrans returned failure for order {$paidPayment->order_id}. "
                                . "Payment status moved to PENDING_MANUAL_REFUND. High-priority manual disbursement via Iris required.",
                        ]);

                        StaffNotificationService::notifyStaff(
                            'Escrow Refund Action Required',
                            "Manual refund of Rp " . number_format($paymentData['paid_amount'], 0, ',', '.') . " required for Commission #{$commission->id}. Automated gateway refund failed.",
                            $commission,
                            NotificationType::SYSTEM
                        );
                    }
                }
            }
        });

        return $commission->fresh(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review', 'payment', 'payments']);
    }

    /**
     * Request a negotiated cancellation for an active commission.
     * Uses pessimistic locking to prevent race conditions when both parties request simultaneously.
     */
    public function requestCancellation(Commission $commission, User $requester, string $reason): Commission
    {
        $updatedCommission = DB::transaction(function () use ($commission, $requester, $reason) {
            $locked = Commission::whereKey($commission->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! is_null($locked->cancellation_requested_by)) {
                throw new InvalidArgumentException('A cancellation request is already pending for this commission.');
            }

            $allowedStatuses = [
                CommissionStatus::ACCEPTED,
                CommissionStatus::IN_PROGRESS,
                CommissionStatus::WAITING_FOR_CLIENT,
                CommissionStatus::REVISION,
            ];

            if (! in_array($locked->status, $allowedStatuses, true)) {
                throw new InvalidArgumentException("Cancellation cannot be requested for a commission in '{$locked->status->value}' status.");
            }

            $locked->update([
                'cancellation_requested_by' => $requester->id,
                'cancellation_reason' => $reason,
                'cancellation_requested_at' => now(),
            ]);

            return $locked;
        });

        $counterpartId = ($requester->id === $updatedCommission->user_id)
            ? $updatedCommission->artistProfile?->user_id
            : $updatedCommission->user_id;

        if ($counterpartId) {
            Notification::create([
                'user_id' => $counterpartId,
                'type' => NotificationType::SYSTEM,
                'title' => 'Cancellation Requested',
                'message' => "{$requester->display_name} has requested to cancel Commission #{$updatedCommission->id}: \"{$reason}\"",
                'notifiable_type' => Commission::class,
                'notifiable_id' => $updatedCommission->id,
            ]);
        }

        CommissionMessage::create([
            'commission_id' => $updatedCommission->id,
            'sender_id' => $requester->id,
            'recipient_id' => $counterpartId,
            'message' => "[Cancellation Request] {$requester->display_name} requested to cancel this order.\nReason: {$reason}",
            'message_type' => MessageType::SYSTEM,
        ]);

        return $updatedCommission->fresh(['commissionService', 'commissionOption', 'artistProfile', 'user', 'cancellationRequester', 'messages', 'review']);
    }

    /**
     * Accept a cancellation request with safe, decoupled refund processing.
     *
     * In Phase 1, an explicit REFUND_PROCESSING state reservation is committed
     * while holding a pessimistic lock, preventing any concurrent requests from
     * triggering duplicate refund API calls.
     */
    public function acceptCancellation(Commission $commission, User $acceptor): array
    {
        // Atomic verification & reservation lock
        $prep = DB::transaction(function () use ($commission) {
            $locked = Commission::whereKey($commission->id)
                ->lockForUpdate()
                ->first();

            if (! $locked) {
                return ['error' => 'Commission not found.', 'code' => 404];
            }

            if ($locked->status === CommissionStatus::CANCELLED || ! $locked->cancellation_requested_by) {
                return ['error' => 'This commission cancellation has already been processed.', 'code' => 409];
            }

            // Check if another concurrent thread has already reserved this refund
            $isAlreadyProcessing = $locked->payments()
                ->where('status', PaymentStatus::REFUND_PROCESSING->value)
                ->exists();

            if ($isAlreadyProcessing) {
                return ['error' => 'A cancellation refund is already currently being processed for this commission.', 'code' => 409];
            }

            $paidPayment = $locked->payments()
                ->where('status', PaymentStatus::PAID->value)
                ->lockForUpdate()
                ->latest()
                ->first();

            $pendingOrderIds = $locked->payments()
                ->where('status', PaymentStatus::PENDING->value)
                ->pluck('order_id')
                ->toArray();

            $requesterId = $locked->cancellation_requested_by;
            $reason = $locked->cancellation_reason;

            // Reserve the refund transition immediately inside this transaction lock!
            if ($paidPayment) {
                $paidPayment->update([
                    'status' => PaymentStatus::REFUND_PROCESSING->value,
                ]);
            }

            // Immediately mark commission as CANCELLED and clear cancellation_requested_by
            // to reserve cancellation at the commission level, preventing any duplicate concurrent acceptance
            $locked->update([
                'status' => CommissionStatus::CANCELLED,
                'cancellation_requested_by' => null,
            ]);

            return [
                'commission_id' => $locked->id,
                'requester_id' => $requesterId,
                'reason' => $reason,
                'paid_payment_id' => $paidPayment?->id,
                'paid_order_id' => $paidPayment?->order_id,
                'refund_amount' => $paidPayment ? (float) $paidPayment->gross_amount : 0.0,
                'raw_response' => $paidPayment?->raw_response ?? [],
                'pending_order_ids' => $pendingOrderIds,
                'buyer_user_id' => $locked->user_id,
            ];
        });

        if (isset($prep['error'])) {
            return $prep;
        }

        // External Gateway API calls OUTSIDE DB Transaction
        $midtransResponse = null;
        $isRefundSuccessful = false;
        $verifiedCancelledOrderIds = [];

        try {
            if ($prep['paid_order_id'] && $prep['refund_amount'] > 0) {
                $midtransResponse = $this->midtransService->refundTransaction(
                    $prep['paid_order_id'],
                    $prep['refund_amount'],
                    $prep['reason'] ?: 'Mutual cancellation agreement'
                );

                $isRefundSuccessful = is_array($midtransResponse)
                    && (! isset($midtransResponse['status_code']) || in_array((string) $midtransResponse['status_code'], ['200', '201', '202'], true));
            }

            foreach ($prep['pending_order_ids'] as $pendingOrderId) {
                if ($this->cancelPendingMidtransOrder($pendingOrderId)) {
                    $verifiedCancelledOrderIds[] = $pendingOrderId;
                }
            }
        } catch (\Throwable $e) {
            Log::error("Gateway exception during acceptCancellation for Commission #{$commission->id}: " . $e->getMessage());
            $midtransResponse = [
                'exception' => $e->getMessage(),
                'error' => 'Gateway communication error',
            ];
            $isRefundSuccessful = false;
        }

        // Atomic DB state persistence
        $finalData = DB::transaction(function () use ($commission, $prep, $midtransResponse, $isRefundSuccessful, $verifiedCancelledOrderIds) {
            $locked = Commission::whereKey($commission->id)
                ->lockForUpdate()
                ->firstOrFail();

            $paidPayment = $prep['paid_payment_id']
                ? $locked->payments()->whereKey($prep['paid_payment_id'])->lockForUpdate()->first()
                : null;

            $wasRefunded = false;

            if ($paidPayment) {
                if ($isRefundSuccessful) {
                    $paidPayment->update([
                        'status' => PaymentStatus::REFUNDED->value,
                        'raw_response' => array_merge($prep['raw_response'], [
                            'refund_result' => [
                                'refunded_at' => now()->toISOString(),
                                'amount' => $prep['refund_amount'],
                                'reason' => $prep['reason'] ?: 'Mutual cancellation',
                                'gateway_response' => $midtransResponse,
                            ],
                        ]),
                    ]);
                    $wasRefunded = true;
                } else {
                    Log::error("Midtrans refund failed for Commission #{$locked->id}, Payment #{$paidPayment->id}. Marking as PENDING_MANUAL_REFUND.");

                    $paidPayment->update([
                        'status' => PaymentStatus::PENDING_MANUAL_REFUND->value,
                        'raw_response' => array_merge($prep['raw_response'], [
                            'failed_refund_attempt' => [
                                'attempted_at' => now()->toISOString(),
                                'amount' => $prep['refund_amount'],
                                'reason' => $prep['reason'] ?: 'Mutual cancellation',
                                'gateway_response' => $midtransResponse,
                            ],
                        ]),
                    ]);

                    $buyerUser = $locked->user;
                    $report = Report::create([
                        'user_id' => $buyerUser?->id ?? $locked->user_id,
                        'reportable_type' => Commission::class,
                        'reportable_id' => $locked->id,
                        'reason' => ReportReason::OTHER,
                        'description' => "Manual Escrow Refund Required (Order: {$paidPayment->order_id}): "
                            . "Mutual cancellation for Commission #{$locked->id} was accepted, but Midtrans automated direct refund failed or is unsupported for this payment channel (e.g. Indonesian VA / QRIS / GoPay). "
                            . "Please disburse manual escrow refund of Rp " . number_format($prep['refund_amount'], 0, ',', '.') . " to client @{$buyerUser?->username} via Midtrans Iris disbursement portal.",
                        'status' => ReportStatus::PENDING,
                    ]);

                    $ticket = $report->ticket()->create([
                        'priority' => TicketPriority::HIGH,
                    ]);

                    $ticket->messages()->create([
                        'user_id' => $buyerUser?->id ?? $locked->user_id,
                        'content' => "⚠️ Automated Escrow Refund Failure: Midtrans Snap API returned failure/null for order {$paidPayment->order_id}. "
                            . "Payment status has been moved to PENDING_MANUAL_REFUND. High-priority manual disbursement via Midtrans Iris required for client (@{$buyerUser?->username}, Amount: Rp " . number_format($prep['refund_amount'], 0, ',', '.') . ").",
                    ]);

                    StaffNotificationService::notifyStaff(
                        'Escrow Refund Action Required',
                        "Manual refund of Rp " . number_format($prep['refund_amount'], 0, ',', '.') . " required for Commission #{$locked->id} (@{$buyerUser?->username}). Automated gateway refund failed.",
                        $locked,
                        NotificationType::SYSTEM
                    );
                }
            }

            // Only mark verified cancelled pending payments
            if (! empty($verifiedCancelledOrderIds)) {
                $locked->payments()
                    ->whereIn('order_id', $verifiedCancelledOrderIds)
                    ->update(['status' => PaymentStatus::CANCELLED->value]);
            }

            $locked->update([
                'status' => CommissionStatus::CANCELLED,
                'cancellation_requested_by' => null,
            ]);

            return [
                'commission' => $locked,
                'was_refunded' => $wasRefunded,
                'had_paid_payment' => (bool) $paidPayment,
                'refund_amount' => $prep['refund_amount'],
                'requester_id' => $prep['requester_id'],
            ];
        });

        // Notifications & Chat Notices
        $formattedRefund = 'Rp ' . number_format($finalData['refund_amount'], 0, ',', '.');
        $chatNotice = $finalData['was_refunded']
            ? "[Cancellation & Escrow Refund] The cancellation request was accepted by {$acceptor->display_name}. Full escrow payment of {$formattedRefund} has been refunded to the client."
            : ($finalData['had_paid_payment'] && ! $finalData['was_refunded']
                ? "[Cancellation Accepted - Manual Refund Queued] The cancellation request was accepted by {$acceptor->display_name}. Automated gateway card refund is not supported by this payment channel; an administrative support ticket has been dispatched for our staff to manually disburse your full refund ({$formattedRefund}) via Midtrans Iris."
                : "[Cancellation Accepted] The cancellation request was accepted by {$acceptor->display_name}. This commission order has been officially cancelled.");

        $recipientId = $finalData['requester_id'] ?: ($acceptor->id === $finalData['commission']->user_id
            ? $finalData['commission']->artistProfile?->user_id
            : $finalData['commission']->user_id);

        CommissionMessage::create([
            'commission_id' => $finalData['commission']->id,
            'sender_id' => $acceptor->id,
            'recipient_id' => $recipientId,
            'message' => $chatNotice,
            'message_type' => MessageType::SYSTEM,
        ]);

        if ($finalData['requester_id'] && $finalData['requester_id'] !== $acceptor->id) {
            $notifMessage = $finalData['was_refunded']
                ? "Your cancellation request for Commission #{$finalData['commission']->id} was accepted. A full escrow refund of {$formattedRefund} has been processed back to your account."
                : ($finalData['had_paid_payment'] && ! $finalData['was_refunded']
                    ? "Your cancellation request for Commission #{$finalData['commission']->id} was accepted. Automated refund is unavailable for this payment method; our staff has been notified to manually disburse {$formattedRefund} via Iris."
                    : "Your cancellation request for Commission #{$finalData['commission']->id} was accepted. The commission is now cancelled.");

            Notification::create([
                'user_id' => $finalData['requester_id'],
                'type' => NotificationType::SYSTEM,
                'title' => $finalData['was_refunded'] ? 'Cancellation & Refund Processed' : 'Cancellation Accepted (Manual Refund Pending)',
                'message' => $notifMessage,
                'notifiable_type' => Commission::class,
                'notifiable_id' => $finalData['commission']->id,
            ]);
        }

        if ($finalData['was_refunded'] && $finalData['commission']->user_id !== $finalData['requester_id']) {
            Notification::create([
                'user_id' => $finalData['commission']->user_id,
                'type' => NotificationType::SYSTEM,
                'title' => 'Escrow Refund Processed',
                'message' => "Commission #{$finalData['commission']->id} was cancelled. A full escrow refund of {$formattedRefund} has been returned to you.",
                'notifiable_type' => Commission::class,
                'notifiable_id' => $finalData['commission']->id,
            ]);
        } elseif ($finalData['had_paid_payment'] && ! $finalData['was_refunded'] && $finalData['commission']->user_id !== $finalData['requester_id']) {
            Notification::create([
                'user_id' => $finalData['commission']->user_id,
                'type' => NotificationType::SYSTEM,
                'title' => 'Cancellation Accepted (Manual Refund Pending)',
                'message' => "Commission #{$finalData['commission']->id} was cancelled. Our staff has been alerted to manually disburse your full escrow refund of {$formattedRefund} via Iris.",
                'notifiable_type' => Commission::class,
                'notifiable_id' => $finalData['commission']->id,
            ]);
        }

        $message = $finalData['was_refunded']
            ? 'Commission cancelled and escrow refund processed.'
            : ($finalData['had_paid_payment'] && ! $finalData['was_refunded']
                ? 'Commission cancelled. Automated refund is unsupported for this payment method; staff has been alerted for manual Iris disbursement.'
                : 'Commission cancellation accepted.');

        return [
            'commission' => $finalData['commission']->fresh(['commissionService', 'commissionOption', 'artistProfile', 'user', 'cancellationRequester', 'messages', 'review', 'payment', 'payments']),
            'message' => $message,
        ];
    }

    /**
     * Decline or withdraw a cancellation request.
     */
    public function declineCancellation(Commission $commission, User $actor): array
    {
        $requesterId = $commission->cancellation_requested_by;
        $isRequester = $actor->id === $requesterId;

        $commission->update([
            'cancellation_requested_by' => null,
            'cancellation_reason' => null,
            'cancellation_requested_at' => null,
        ]);

        if (! $isRequester && $requesterId) {
            Notification::create([
                'user_id' => $requesterId,
                'type' => NotificationType::SYSTEM,
                'title' => 'Cancellation Request Declined',
                'message' => "{$actor->display_name} declined your cancellation request. The commission remains active.",
                'notifiable_type' => Commission::class,
                'notifiable_id' => $commission->id,
            ]);

            CommissionMessage::create([
                'commission_id' => $commission->id,
                'sender_id' => $actor->id,
                'recipient_id' => $requesterId,
                'message' => "[Cancellation Request Declined] {$actor->display_name} declined the cancellation request. The order remains active.",
                'message_type' => MessageType::SYSTEM,
            ]);
        } else {
            $counterpartId = ($actor->id === $commission->user_id)
                ? $commission->artistProfile?->user_id
                : $commission->user_id;

            CommissionMessage::create([
                'commission_id' => $commission->id,
                'sender_id' => $actor->id,
                'recipient_id' => $counterpartId,
                'message' => "[Cancellation Request Withdrawn] {$actor->display_name} withdrew their cancellation request.",
                'message_type' => MessageType::SYSTEM,
            ]);
        }

        return [
            'commission' => $commission->fresh(['commissionService', 'commissionOption', 'artistProfile', 'user', 'cancellationRequester', 'messages', 'review']),
            'message' => $isRequester ? 'Cancellation request withdrawn.' : 'Cancellation request declined.',
        ];
    }

    /**
     * Safely cancel a pending Midtrans order with status code differentiation:
     * - 200/201: Successfully cancelled by gateway
     * - 412: Precondition failed (already closed or settled) -> verify status
     * - 404: Uninitiated on Midtrans Core -> verify and cancel locally
     */
    protected function cancelPendingMidtransOrder(string $orderId): bool
    {
        try {
            $cancelRes = $this->midtransService->cancelTransaction($orderId);
            $statusCode = (string) ($cancelRes['status_code'] ?? '');

            if (in_array($statusCode, ['200', '201'], true)) {
                return true;
            }

            if ($statusCode === '412') {
                $statusCheck = $this->midtransService->getTransactionStatus($orderId);
                $remoteStatus = strtolower((string) ($statusCheck['transaction_status'] ?? ''));

                if (in_array($remoteStatus, ['cancel', 'expire', 'deny'], true)) {
                    Log::info("Order #{$orderId} returned 412 on cancel, confirmed as {$remoteStatus} on Midtrans.");
                    return true;
                }

                if (in_array($remoteStatus, ['settlement', 'capture'], true)) {
                    Log::critical("Order #{$orderId} returned 412 on cancel and is SETTLED on Midtrans! Flagging for manual reconciliation.");
                    return false;
                }
            }

            if ($statusCode === '404') {
                $statusCheck = $this->midtransService->getTransactionStatus($orderId);
                $statusCheckCode = (string) ($statusCheck['status_code'] ?? '');
                if ($statusCheckCode === '404' || empty($statusCheck['transaction_status'])) {
                    Log::info("Order #{$orderId} returned 404 (uninitiated on Midtrans Core); safe to mark cancelled locally.");
                    return true;
                }
            }

            Log::warning("Midtrans cancelTransaction unconfirmed for Order #{$orderId} (Status code: {$statusCode}); leaving payment status as pending.");
            return false;
        } catch (\Throwable $e) {
            Log::warning("Exception during cancelPendingMidtransOrder for Order #{$orderId}: " . $e->getMessage());
            return false;
        }
    }
}
