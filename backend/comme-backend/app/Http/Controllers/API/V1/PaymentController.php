<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\CommissionStatus;
use App\Enum\NotificationType;
use App\Enum\PaymentStatus;
use App\Http\Helpers\ApiResponseHelper;
use App\Http\Resources\API\V1\PaymentResource;
use App\Models\ArtistTip;
use App\Models\Commission;
use App\Models\CommissionPayment;
use App\Models\Notification;
use App\Services\API\V1\MidtransService;
use App\Services\API\V1\MidtransPayoutService;
use App\Services\API\V1\AntiArbitrageService;
use App\Services\API\V1\GeoIpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Enum\PayoutStatus;
use App\Enum\ReportReason;
use App\Enum\ReportStatus;
use App\Enum\TicketPriority;
use App\Http\Resources\API\V1\CommissionResource;
use App\Models\CommissionPayout;
use App\Models\Report;
use App\Services\API\V1\DuplicatePaymentService;
use App\Services\API\V1\StaffNotificationService;

class PaymentController extends Controller
{
    /**
     * Initiate or retrieve an existing Midtrans Snap checkout session for escrow payment.
     * Automatically applies intelligent payment channel routing: foreign orders are routed
     * directly to international credit card checkout, while domestic IDR orders retain
     * Indonesian Virtual Accounts, QRIS, and e-wallets.
     */
    public function initiate(Request $request, Commission $commission, MidtransService $midtransService): JsonResponse
    {
        Gate::authorize('initiatePayment', $commission);

        $clientLocation = GeoIpService::getClientLocation($request);
        $billingCurrency = strtoupper(trim((string) (
            $request->get('currency')
            ?: ($commission->commissionOption?->base_currency && $commission->commissionOption->base_currency !== 'IDR'
                ? $commission->commissionOption->base_currency
                : ($clientLocation['billing_currency'] ?? 'IDR'))
        )));

        // Serialize checkout initiation per commission to prevent concurrent duplicate order_id/token race conditions
        $payment = Cache::lock("commission_checkout_lock_{$commission->id}", 60)->block(30, function () use ($request, $commission, $midtransService, $billingCurrency) {
            // Atomically prepare or retrieve the pending payment record
            [$payment, $needsSnapToken, $targetOrderId] = DB::transaction(function () use ($commission, $request) {
                $lockedCommission = Commission::query()
                    ->with(['user', 'commissionService', 'commissionOption'])
                    ->whereKey($commission->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($lockedCommission->status !== CommissionStatus::ACCEPTED) {
                    abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'This commission is not ready for payment.');
                }

                // Prevent duplicate payment: if commission is already paid and secured in escrow, abort immediately
                if ($lockedCommission->payments()->where('status', PaymentStatus::PAID->value)->exists()) {
                    abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'This commission has already been paid and secured in escrow.');
                }

                $payment = $lockedCommission->payments()
                    ->where('status', PaymentStatus::PENDING->value)
                    ->latest()
                    ->first();

                if (! $payment) {
                    $orderId = 'CMS-'.$lockedCommission->id.'-'.now()->timestamp.'-'.Str::random(8);
                    $payment = $lockedCommission->payments()->create([
                        'order_id' => $orderId,
                        'status' => PaymentStatus::PENDING->value,
                        'gross_amount' => $lockedCommission->total_price,
                    ]);
                    return [$payment, true, $orderId];
                }

                $isExpired = $payment->created_at && $payment->created_at->diffInHours(now()) >= 24;
                $needsRefresh = $request->boolean('refresh') || $isExpired;

                if ($needsRefresh) {
                    if ($isExpired) {
                        $payment->update(['status' => PaymentStatus::EXPIRED->value]);
                    }
                    $freshOrderId = 'CMS-'.$lockedCommission->id.'-'.now()->timestamp.'-'.Str::random(8);
                    $newPayment = $lockedCommission->payments()->create([
                        'order_id' => $freshOrderId,
                        'status' => PaymentStatus::PENDING->value,
                        'gross_amount' => $lockedCommission->total_price,
                    ]);
                    return [$newPayment, true, $freshOrderId];
                }

                if (! $payment->snap_token || str_starts_with($payment->snap_token, 'mock_snap_token_')) {
                    return [$payment, true, $payment->order_id];
                }

                return [$payment, false, $payment->order_id];
            });

            // Call Midtrans Snap API OUTSIDE the DB transaction lock
            if ($needsSnapToken) {
                $snapToken = $midtransService->createSnapTransaction($payment, $commission, $billingCurrency);
                // Atomic update strictly matching the target order_id to prevent any token/order_id mismatch
                CommissionPayment::whereKey($payment->id)
                    ->where('order_id', $targetOrderId)
                    ->update([
                        'snap_token' => $snapToken,
                    ]);
            }

            return $payment->fresh();
        });

        return ApiResponseHelper::successResponse(new PaymentResource($payment), 'Payment initiated');
    }

    /**
     * Local/Sandbox simulator endpoint for capturing payment into escrow.
     */
    public function simulate(Commission $commission): JsonResponse
    {
        Gate::authorize('initiatePayment', $commission);

        $updatedCommission = DB::transaction(function () use ($commission) {
            $lockedCommission = Commission::query()
                ->with(['artistProfile', 'payments'])
                ->whereKey($commission->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedCommission->status !== CommissionStatus::ACCEPTED) {
                abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'This commission is not ready for payment.');
            }

            if ($lockedCommission->payments()->where('status', PaymentStatus::PAID->value)->exists()) {
                abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'This commission has already been paid and secured in escrow.');
            }

            $payment = $lockedCommission->payments()
                ->where('status', PaymentStatus::PENDING->value)
                ->latest()
                ->first();

            if (! $payment) {
                $payment = $lockedCommission->payments()->create([
                    'order_id' => 'CMS-'.$lockedCommission->id.'-'.now()->timestamp.'-'.Str::random(8),
                    'status' => PaymentStatus::PAID->value,
                    'gross_amount' => $lockedCommission->total_price,
                    'paid_at' => now(),
                    'payment_type' => 'simulation_sandbox',
                ]);
            } else {
                $payment->update([
                    'status' => PaymentStatus::PAID->value,
                    'paid_at' => now(),
                    'payment_type' => 'simulation_sandbox',
                ]);
            }

            $lockedCommission->update(['status' => CommissionStatus::IN_PROGRESS]);

            Notification::create([
                'user_id' => $lockedCommission->artistProfile->user_id,
                'type' => NotificationType::PAYMENT_RECEIVED,
                'title' => 'Payment received',
                'message' => 'A client has paid for their commission - you can start working on it.',
                'notifiable_type' => Commission::class,
                'notifiable_id' => $lockedCommission->id,
            ]);

            return $lockedCommission;
        });

        return ApiResponseHelper::successResponse(
            new CommissionResource($updatedCommission->fresh(['user', 'artistProfile', 'commissionService', 'payments', 'review'])),
            'Payment secured in Escrow! Commission is now in progress.'
        );
    }

    /**
     * Check and synchronize live payment status directly with Midtrans Sandbox API.
     */
    public function checkStatus(
        Request $request,
        Commission $commission,
        MidtransService $midtransService,
        DuplicatePaymentService $duplicatePaymentService
    ): JsonResponse {
        Gate::authorize('view', $commission);

        // Pre-check payment record: prioritize explicit order_id query param if provided, otherwise latest payment by id
        $orderIdParam = $request->query('order_id') ?: $request->input('order_id');
        $payment = $orderIdParam
            ? $commission->payments()->where('order_id', $orderIdParam)->first()
            : $commission->payments()->latest('id')->first();

        if (! $payment) {
            return ApiResponseHelper::errorResponse('No payment record found for this commission.', Response::HTTP_NOT_FOUND);
        }

        // If this payment attempt is already confirmed and secured in escrow, return immediately
        if ($payment->status === PaymentStatus::PAID) {
            return ApiResponseHelper::successResponse(
                new CommissionResource($commission->load(['user', 'artistProfile', 'commissionService', 'payments', 'review'])),
                'Payment is already confirmed and secured in Escrow.'
            );
        }

        if ($payment->status === PaymentStatus::REFUNDED) {
            return ApiResponseHelper::successResponse(
                new CommissionResource($commission->load(['user', 'artistProfile', 'commissionService', 'payments', 'review'])),
                'Payment has been refunded.'
            );
        }

        if ($payment->status === PaymentStatus::PENDING_MANUAL_REFUND) {
            return ApiResponseHelper::successResponse(
                new CommissionResource($commission->load(['user', 'artistProfile', 'commissionService', 'payments', 'review'])),
                'Duplicate payment attempt detected; escrow already secured by previous payment. Duplicate queued for refund.'
            );
        }

        $queriedOrderId = $payment->order_id;

        // Query Midtrans API OUTSIDE the DB transaction to avoid holding locks
        $remoteStatus = $midtransService->getTransactionStatus($queriedOrderId);

        if (! $remoteStatus) {
            return ApiResponseHelper::errorResponse(
                'Could not retrieve payment status from Midtrans or transaction is not yet initialized.',
                Response::HTTP_NOT_FOUND
            );
        }

        $mappedStatus = $midtransService->mapStatus(
            $remoteStatus['transaction_status'] ?? '',
            $remoteStatus['fraud_status'] ?? null
        );

        // Pre-check: if payment was captured on Midtrans, check if escrow is already settled by another attempt
        if ($mappedStatus === PaymentStatus::PAID) {
            $alreadyPaidExists = $commission->payments()
                ->where('id', '!=', $payment->id)
                ->whereIn('status', [
                    PaymentStatus::PAID->value,
                    PaymentStatus::REFUND_PROCESSING->value,
                    PaymentStatus::REFUNDED->value,
                    PaymentStatus::PENDING_MANUAL_REFUND->value,
                ])
                ->exists();

            if ($alreadyPaidExists) {
                $duplicatePaymentService->handleDuplicateSettlement(
                    $payment,
                    $commission,
                    $remoteStatus
                );

                return ApiResponseHelper::successResponse(
                    new CommissionResource($commission->fresh(['user', 'artistProfile', 'commissionService', 'payments', 'review'])),
                    'Duplicate payment attempt detected; escrow already secured by previous payment. Duplicate refund processed.'
                );
            }
        }

        // Atomically apply synchronized status with pessimistic lock
        $result = DB::transaction(function () use ($commission, $payment, $queriedOrderId, $remoteStatus, $mappedStatus) {
            $lockedCommission = Commission::query()
                ->with(['artistProfile', 'payments'])
                ->whereKey($commission->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedPayment = $lockedCommission->payments()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedPayment || $lockedPayment->order_id !== $queriedOrderId) {
                return ['error' => 'Payment attempt order_id mismatch or superseded; please retry.', 'status' => Response::HTTP_CONFLICT];
            }

            // If already confirmed, return early without re-querying
            if ($lockedPayment->status === PaymentStatus::PAID) {
                return [
                    'commission' => $lockedCommission,
                    'message' => 'Payment is already confirmed and secured in Escrow.',
                ];
            }

            if ($mappedStatus === PaymentStatus::PAID) {
                $alreadyPaidExists = $lockedCommission->payments()
                    ->where('id', '!=', $lockedPayment->id)
                    ->whereIn('status', [
                        PaymentStatus::PAID->value,
                        PaymentStatus::REFUND_PROCESSING->value,
                        PaymentStatus::REFUNDED->value,
                        PaymentStatus::PENDING_MANUAL_REFUND->value,
                    ])
                    ->exists();

                if ($alreadyPaidExists) {
                    return [
                        'is_duplicate' => true,
                        'payment_id' => $lockedPayment->id,
                    ];
                }

                $lockedPayment->update([
                    'status' => PaymentStatus::PAID->value,
                    'paid_at' => now(),
                    'midtrans_transaction_id' => $remoteStatus['transaction_id'] ?? null,
                    'payment_type' => $remoteStatus['payment_type'] ?? null,
                    'raw_response' => $remoteStatus,
                ]);

                if ($lockedCommission->status === CommissionStatus::ACCEPTED) {
                    $lockedCommission->update(['status' => CommissionStatus::IN_PROGRESS]);

                    Notification::create([
                        'user_id' => $lockedCommission->artistProfile->user_id,
                        'type' => NotificationType::PAYMENT_RECEIVED,
                        'title' => 'Payment received',
                        'message' => 'A client has paid for their commission - you can start working on it.',
                        'notifiable_type' => Commission::class,
                        'notifiable_id' => $lockedCommission->id,
                    ]);
                }

                return [
                    'commission' => $lockedCommission,
                    'message' => 'Payment verified from Midtrans! Commission is now In Progress in Escrow.',
                ];
            }

            // Sync other non-pending terminal/gateway statuses (e.g. EXPIRED, FAILED, CANCELLED)
            if ($this->shouldApplyPaymentStatus($lockedPayment->status, $mappedStatus)) {
                $lockedPayment->update([
                    'status' => $mappedStatus->value,
                    'midtrans_transaction_id' => $remoteStatus['transaction_id'] ?? $lockedPayment->midtrans_transaction_id,
                    'payment_type' => $remoteStatus['payment_type'] ?? $lockedPayment->payment_type,
                    'raw_response' => $remoteStatus,
                ]);
            }

            return [
                'commission' => $lockedCommission,
                'message' => 'Midtrans payment status: ' . ($remoteStatus['transaction_status'] ?? 'pending'),
            ];
        });

        if (isset($result['error'])) {
            return ApiResponseHelper::errorResponse($result['error'], $result['status']);
        }

        if (! empty($result['is_duplicate'])) {
            $duplicatePayment = CommissionPayment::findOrFail($result['payment_id']);
            $duplicatePaymentService->handleDuplicateSettlement(
                $duplicatePayment,
                $commission,
                $remoteStatus
            );

            return ApiResponseHelper::successResponse(
                new CommissionResource($commission->fresh(['user', 'artistProfile', 'commissionService', 'payments', 'review'])),
                'Duplicate payment attempt detected; escrow already secured by previous payment. Duplicate refund processed.'
            );
        }

        return ApiResponseHelper::successResponse(
            new CommissionResource($result['commission']->fresh(['user', 'artistProfile', 'commissionService', 'payments', 'review'])),
            $result['message']
        );
    }

    /**
     * Public Midtrans callback. Authenticity comes from the Midtrans
     * signature, not from a browser session.
     */
    public function webhook(
        Request $request,
        MidtransService $midtransService,
        DuplicatePaymentService $duplicatePaymentService
    ): JsonResponse {
        $payload = $request->all();

        if (! $midtransService->verifySignature($payload)) {
            Log::warning('Midtrans webhook: invalid signature', [
                'order_id' => $payload['order_id'] ?? null,
                'transaction_status' => $payload['transaction_status'] ?? null,
                'ip' => $request->ip(),
            ]);

            return ApiResponseHelper::errorResponse('Invalid signature.', Response::HTTP_FORBIDDEN);
        }

        $orderId = (string) ($payload['order_id'] ?? '');

        // Handle creator micro-donations / tips (order_id format: TIP-{tip_id}-{timestamp})
        if (str_starts_with($orderId, 'TIP-')) {
            $parts = explode('-', $orderId);
            $tipId = isset($parts[1]) && is_numeric($parts[1]) ? (int) $parts[1] : null;

            return DB::transaction(function () use ($tipId, $payload) {
                $tip = $tipId ? ArtistTip::with('artistProfile.user')->whereKey($tipId)->lockForUpdate()->first() : null;

                if (! $tip) {
                    return ApiResponseHelper::errorResponse('Artist tip not found.', Response::HTTP_NOT_FOUND);
                }

                $txStatus = $payload['transaction_status'] ?? '';
                $fraudStatus = $payload['fraud_status'] ?? null;

                if (in_array($txStatus, ['settlement', 'capture'], true) && ($fraudStatus === 'accept' || empty($fraudStatus))) {
                    $wasSettled = $tip->status === 'settled';

                    $tip->update([
                        'status' => 'settled',
                        'settled_at' => $tip->settled_at ?? now(),
                        'transaction_id' => $payload['transaction_id'] ?? $tip->transaction_id,
                        'payment_type' => $payload['payment_type'] ?? $tip->payment_type,
                    ]);

                    // Idempotent notification: only fire once upon transition to settled
                    if (! $wasSettled && $tip->artistProfile?->user_id) {
                        Notification::create([
                            'user_id' => $tip->artistProfile->user_id,
                            'type' => NotificationType::PAYMENT_RECEIVED,
                            'title' => 'Tip received',
                            'message' => 'You received a tip of ' . number_format($tip->amount) . ' IDR from ' . ($tip->supporter_name ?: 'a supporter') . '!',
                            'link' => '/artist/' . ($tip->artistProfile->user?->username ?? ''),
                        ]);
                    }
                } elseif (in_array($txStatus, ['deny', 'cancel', 'expire'], true)) {
                    if ($tip->status !== 'settled') {
                        $tip->update([
                            'status' => 'failed',
                            'transaction_id' => $payload['transaction_id'] ?? $tip->transaction_id,
                            'payment_type' => $payload['payment_type'] ?? $tip->payment_type,
                        ]);
                    }
                }

                return ApiResponseHelper::successResponse([
                    'tip_id' => $tip->id,
                    'status' => $tip->status,
                ], 'Artist tip webhook processed successfully.');
            });
        }

        $payment = CommissionPayment::where('order_id', $payload['order_id'] ?? null)->first();

        if (! $payment) {
            return ApiResponseHelper::errorResponse('Payment not found.', Response::HTTP_NOT_FOUND);
        }

        $newStatus = $midtransService->mapStatus(
            $payload['transaction_status'] ?? '',
            $payload['fraud_status'] ?? null,
        );

        // Webhook Idempotency: If THIS exact payment is already PAID and gateway reports PAID,
        // this is an idempotent replay from Midtrans. Acknowledge immediately without re-processing or refunding!
        if ($payment->status === PaymentStatus::PAID && $newStatus === PaymentStatus::PAID) {
            $payment->update([
                'raw_response' => $payload,
            ]);

            return ApiResponseHelper::successResponse(message: 'Notification processed (idempotent replay).');
        }

        // Pre-check for duplicate settlement before entering main transaction
        if ($newStatus === PaymentStatus::PAID) {
            $commission = $payment->commission;
            if ($commission) {
                $alreadyPaidExists = $commission->payments()
                    ->where('id', '!=', $payment->id)
                    ->whereIn('status', [
                        PaymentStatus::PAID->value,
                        PaymentStatus::REFUND_PROCESSING->value,
                        PaymentStatus::REFUNDED->value,
                        PaymentStatus::PENDING_MANUAL_REFUND->value,
                    ])
                    ->exists();

                if ($alreadyPaidExists) {
                    $duplicatePaymentService->handleDuplicateSettlement(
                        $payment,
                        $commission,
                        $payload
                    );

                    AntiArbitrageService::checkPaymentOriginMismatch($payment, $payload);

                    return ApiResponseHelper::successResponse(message: 'Notification processed.');
                }
            }
        }

        $isDuplicatePayment = false;

        DB::transaction(function () use ($payment, $newStatus, $payload, &$isDuplicatePayment) {
            $payment = CommissionPayment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            $commission = $payment->commission()
                ->with(['artistProfile', 'user'])
                ->lockForUpdate()
                ->firstOrFail();

            $previousStatus = $payment->status;

            // Idempotency under lock: If payment was already updated to PAID concurrently, return early
            if ($previousStatus === PaymentStatus::PAID && $newStatus === PaymentStatus::PAID) {
                return;
            }

            if ($newStatus === PaymentStatus::PAID) {
                // Financial Integrity: Check if another payment attempt for this commission has already settled into escrow
                $alreadyPaidExists = $commission->payments()
                    ->where('id', '!=', $payment->id)
                    ->whereIn('status', [
                        PaymentStatus::PAID->value,
                        PaymentStatus::REFUND_PROCESSING->value,
                        PaymentStatus::REFUNDED->value,
                        PaymentStatus::PENDING_MANUAL_REFUND->value,
                    ])
                    ->exists();

                if ($alreadyPaidExists) {
                    $isDuplicatePayment = true;
                    return;
                }
            }

            if (! $this->shouldApplyPaymentStatus($previousStatus, $newStatus)) {
                $payment->update([
                    'midtrans_transaction_id' => $payload['transaction_id'] ?? $payment->midtrans_transaction_id,
                    'payment_type' => $payload['payment_type'] ?? $payment->payment_type,
                    'raw_response' => $payload,
                ]);

                return;
            }

            $payment->update([
                'status' => $newStatus,
                'midtrans_transaction_id' => $payload['transaction_id'] ?? null,
                'payment_type' => $payload['payment_type'] ?? null,
                'paid_at' => $newStatus === PaymentStatus::PAID
                    ? ($payment->paid_at ?? now())
                    : $payment->paid_at,
                'raw_response' => $payload,
            ]);

            if ($previousStatus !== PaymentStatus::PAID && $newStatus === PaymentStatus::PAID) {
                if ($commission->status === CommissionStatus::ACCEPTED) {
                    $commission->update(['status' => CommissionStatus::IN_PROGRESS]);

                    Notification::create([
                        'user_id' => $commission->artistProfile->user_id,
                        'type' => NotificationType::PAYMENT_RECEIVED,
                        'title' => 'Payment received',
                        'message' => 'A client has paid for their commission - you can start working on it.',
                        'notifiable_type' => Commission::class,
                        'notifiable_id' => $commission->id,
                    ]);
                } elseif ($commission->status === CommissionStatus::CANCELLED) {
                    // Critical financial recovery: payment arrived for an already cancelled order
                    Log::critical("Settlement received for already CANCELLED commission #{$commission->id} (Order: {$payment->order_id}). Escalating for immediate Iris refund.");

                    try {
                        $buyerUser = $commission->user;
                        $report = Report::create([
                            'user_id' => $buyerUser?->id ?? $commission->user_id,
                            'reportable_type' => Commission::class,
                            'reportable_id' => $commission->id,
                            'reason' => ReportReason::OTHER,
                            'description' => "Late Settlement on Cancelled Order (Order: {$payment->order_id}): "
                                . "Customer completed payment on Midtrans after/during commission cancellation. Full escrow refund of Rp " . number_format($payment->gross_amount, 0, ',', '.') . " required.",
                            'status' => ReportStatus::PENDING,
                        ]);

                        $ticket = $report->ticket()->create([
                            'priority' => TicketPriority::HIGH,
                        ]);

                        $ticket->messages()->create([
                            'user_id' => $buyerUser?->id ?? $commission->user_id,
                            'content' => "Urgent: Payment was captured on gateway for already cancelled order {$payment->order_id}. "
                                . "High-priority manual disbursement via Iris required for client (@{$buyerUser?->username}, Amount: Rp " . number_format($payment->gross_amount, 0, ',', '.') . ").",
                        ]);

                        StaffNotificationService::notifyStaff(
                            'Late Payment on Cancelled Order',
                            "Payment of Rp " . number_format($payment->gross_amount, 0, ',', '.') . " arrived for CANCELLED Commission #{$commission->id}. Immediate Iris refund required.",
                            $commission,
                            NotificationType::SYSTEM
                        );
                    } catch (\Throwable $e) {
                        Log::error("Failed to create operational escalation for late settlement on cancelled commission {$commission->id}: " . $e->getMessage());
                    }
                }
            }
        });

        if ($isDuplicatePayment) {
            $duplicatePaymentService->handleDuplicateSettlement(
                $payment,
                $payment->commission,
                $payload
            );
        }

        // Anti-Arbitrage Payment Integrity: Detect foreign card / non-domestic bank on IDR regional orders
        AntiArbitrageService::checkPaymentOriginMismatch($payment, $payload);

        return ApiResponseHelper::successResponse(message: 'Notification processed.');
    }

    /**
     * Public Midtrans Iris Payout callback.
     * Implements challenge verification: queries Midtrans Iris directly to confirm
     * the reported status before committing financial state changes.
     */
    public function irisWebhook(Request $request, MidtransPayoutService $midtransPayoutService): JsonResponse
    {
        $payload = $request->all();
        $reference = $payload['reference_no'] ?? null;

        if (!$reference) {
            return ApiResponseHelper::errorResponse('Missing reference_no.', Response::HTTP_BAD_REQUEST);
        }

        $payout = CommissionPayout::where('reference', $reference)->first();

        if (!$payout) {
            return ApiResponseHelper::errorResponse('Payout record not found.', Response::HTTP_NOT_FOUND);
        }

        // Terminal protection: Once a payout is COMPLETED, it must never be downgraded by a delayed webhook.
        if ($payout->status === PayoutStatus::COMPLETED) {
            Log::info("Iris webhook: Payout #{$payout->id} is already in terminal state COMPLETED — ignoring webhook update.");
            return ApiResponseHelper::successResponse(message: 'Payout already in terminal state COMPLETED.');
        }

        // Challenge verification: Never trust webhook payload directly without querying Midtrans Iris source of truth.
        $verified = $midtransPayoutService->getPayoutStatus($payout);
        $providerStatus = strtolower($verified['status'] ?? 'unknown');

        if (in_array($providerStatus, ['completed', 'done', 'settled', 'success'])) {
            $payout->update([
                'status' => PayoutStatus::COMPLETED,
                'completed_at' => now(),
                'raw_response' => $verified,
            ]);
            Log::info("Iris webhook: Payout #{$payout->id} verified and marked COMPLETED via Midtrans source-of-truth challenge.");
        } elseif (in_array($providerStatus, ['failed', 'rejected', 'denied'])) {
            $payout->update([
                'status' => PayoutStatus::FAILED,
                'failed_at' => now(),
                'failure_reason' => "Provider confirmed status: {$providerStatus}",
                'raw_response' => $verified,
            ]);
            Log::warning("Iris webhook: Payout #{$payout->id} verified and marked FAILED via Midtrans source-of-truth challenge.");
        } else {
            Log::warning("Iris webhook: Payout #{$payout->id} received unverified status '{$providerStatus}' from provider — keeping in PROCESSING.");
        }

        return ApiResponseHelper::successResponse(message: 'Iris payout notification processed.');
    }

    private function shouldApplyPaymentStatus(PaymentStatus $currentStatus, PaymentStatus $newStatus): bool
    {
        if ($currentStatus === $newStatus) {
            return true;
        }

        if ($currentStatus === PaymentStatus::PAID) {
            return $newStatus === PaymentStatus::REFUNDED;
        }

        if (in_array($currentStatus, [PaymentStatus::PENDING_MANUAL_REFUND, PaymentStatus::REFUND_FAILED], true)) {
            return $newStatus === PaymentStatus::REFUNDED;
        }

        if ($currentStatus === PaymentStatus::REFUND_PROCESSING) {
            return in_array($newStatus, [
                PaymentStatus::REFUNDED,
                PaymentStatus::PENDING_MANUAL_REFUND,
                PaymentStatus::REFUND_FAILED,
            ], true);
        }

        if ($currentStatus === PaymentStatus::REFUNDED) {
            return false;
        }

        if (in_array($currentStatus, [PaymentStatus::FAILED, PaymentStatus::EXPIRED, PaymentStatus::CANCELLED], true)) {
            // Financial integrity: If Midtrans actually settled the transaction (customer paid!),
            // allow transition to PAID so funds are not lost/untracked, even if local status was previously CANCELLED/EXPIRED.
            if ($newStatus === PaymentStatus::PAID) {
                return true;
            }
            return false;
        }

        return true;
    }
}
