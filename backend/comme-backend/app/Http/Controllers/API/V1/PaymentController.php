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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Enum\PayoutStatus;
use App\Http\Resources\API\V1\CommissionResource;
use App\Models\CommissionPayout;

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

        $payment = DB::transaction(function () use ($request, $commission, $midtransService, $billingCurrency): CommissionPayment {
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
                $payment = $lockedCommission->payments()->create([
                    'order_id' => 'CMS-'.$lockedCommission->id.'-'.now()->timestamp.'-'.Str::random(8),
                    'status' => PaymentStatus::PENDING->value,
                    'gross_amount' => $lockedCommission->total_price,
                ]);
            }

            $isExpired = $payment->created_at && $payment->created_at->diffInHours(now()) >= 24;
            if ($request->boolean('refresh') || ! $payment->snap_token || str_starts_with($payment->snap_token, 'mock_snap_token_') || $isExpired) {
                $freshOrderId = 'CMS-'.$lockedCommission->id.'-'.now()->timestamp.'-'.Str::random(8);
                $payment->update([
                    'order_id' => $freshOrderId,
                    'snap_token' => $midtransService->createSnapTransaction($payment, $lockedCommission, $billingCurrency),
                ]);
            }

            return $payment;
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
    public function checkStatus(Commission $commission, MidtransService $midtransService): JsonResponse
    {
        Gate::authorize('view', $commission);

        // Lock payment and commission atomically to prevent race condition with concurrent webhooks
        $result = DB::transaction(function () use ($commission, $midtransService) {
            $lockedCommission = Commission::query()
                ->with(['artistProfile', 'payments'])
                ->whereKey($commission->id)
                ->lockForUpdate()
                ->firstOrFail();

            $payment = $lockedCommission->payments()
                ->lockForUpdate()
                ->latest()
                ->first();

            if (! $payment) {
                return ['error' => 'No payment record found for this commission.', 'status' => Response::HTTP_NOT_FOUND];
            }

            // If already confirmed and in progress, return early without re-querying
            if ($payment->status === PaymentStatus::PAID->value || $lockedCommission->status === CommissionStatus::IN_PROGRESS) {
                return [
                    'commission' => $lockedCommission,
                    'message' => 'Payment is already confirmed and secured in Escrow.',
                ];
            }

            // Query Midtrans API directly for the live status of the order_id
            $remoteStatus = $midtransService->getTransactionStatus($payment->order_id);

            if (! $remoteStatus) {
                return ['error' => 'Could not retrieve payment status from Midtrans or transaction is not yet initialized.', 'status' => Response::HTTP_NOT_FOUND];
            }

            $mappedStatus = $midtransService->mapStatus(
                $remoteStatus['transaction_status'] ?? '',
                $remoteStatus['fraud_status'] ?? null
            );

            if ($mappedStatus === PaymentStatus::PAID) {
                $payment->update([
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
            if ($this->shouldApplyPaymentStatus($payment->status, $mappedStatus)) {
                $payment->update([
                    'status' => $mappedStatus->value,
                    'midtrans_transaction_id' => $remoteStatus['transaction_id'] ?? $payment->midtrans_transaction_id,
                    'payment_type' => $remoteStatus['payment_type'] ?? $payment->payment_type,
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

        return ApiResponseHelper::successResponse(
            new CommissionResource($result['commission']->fresh(['user', 'artistProfile', 'commissionService', 'payments', 'review'])),
            $result['message']
        );
    }

    /**
     * Public Midtrans callback. Authenticity comes from the Midtrans
     * signature, not from a browser session.
     */
    public function webhook(Request $request, MidtransService $midtransService): JsonResponse
    {
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

        DB::transaction(function () use ($payment, $newStatus, $payload) {
            $payment = CommissionPayment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            $commission = $payment->commission()
                ->with('artistProfile')
                ->lockForUpdate()
                ->firstOrFail();

            $previousStatus = $payment->status;

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
                }
            }
        });

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

        if ($currentStatus === PaymentStatus::REFUNDED) {
            return false;
        }

        if (in_array($currentStatus, [PaymentStatus::FAILED, PaymentStatus::EXPIRED, PaymentStatus::CANCELLED], true)) {
            return false;
        }

        return true;
    }
}
