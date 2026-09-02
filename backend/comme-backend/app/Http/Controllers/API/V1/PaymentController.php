<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\CommissionStatus;
use App\Enum\NotificationType;
use App\Enum\PaymentStatus;
use App\Http\Helpers\ApiResponseHelper;
use App\Http\Resources\API\V1\PaymentResource;
use App\Models\Commission;
use App\Models\CommissionPayment;
use App\Models\Notification;
use App\Services\API\V1\MidtransService;
use App\Services\API\V1\MidtransPayoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * No Form Request here: amount and order_id are derived from the
     * commission, never from client input.
     */
    public function initiate(Commission $commission, MidtransService $midtransService): JsonResponse
    {
        Gate::authorize('initiatePayment', $commission);

        $payment = DB::transaction(function () use ($commission, $midtransService): CommissionPayment {
            $lockedCommission = Commission::query()
                ->with(['user', 'commissionService'])
                ->whereKey($commission->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedCommission->status !== CommissionStatus::ACCEPTED) {
                abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'This commission is not ready for payment.');
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

            if (! $payment->snap_token) {
                $payment->update([
                    'snap_token' => $midtransService->createSnapTransaction($payment, $lockedCommission),
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
            new \App\Http\Resources\API\V1\CommissionResource($updatedCommission->fresh(['user', 'artistProfile', 'commissionService', 'payments', 'review'])),
            'Payment secured in Escrow! Commission is now in progress.'
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
                $commission = $payment->commission()->with('artistProfile')->firstOrFail();
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
        });

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

        $payout = \App\Models\CommissionPayout::where('reference', $reference)->first();

        if (!$payout) {
            return ApiResponseHelper::errorResponse('Payout record not found.', Response::HTTP_NOT_FOUND);
        }

        // Terminal protection: Once a payout is COMPLETED, it must never be downgraded by a delayed webhook.
        if ($payout->status === \App\Enum\PayoutStatus::COMPLETED) {
            Log::info("Iris webhook: Payout #{$payout->id} is already in terminal state COMPLETED — ignoring webhook update.");
            return ApiResponseHelper::successResponse(message: 'Payout already in terminal state COMPLETED.');
        }

        // Challenge verification: Never trust webhook payload directly without querying Midtrans Iris source of truth.
        $verified = $midtransPayoutService->getPayoutStatus($payout);
        $providerStatus = strtolower($verified['status'] ?? 'unknown');

        if (in_array($providerStatus, ['completed', 'done', 'settled', 'success'])) {
            $payout->update([
                'status' => \App\Enum\PayoutStatus::COMPLETED,
                'completed_at' => now(),
                'raw_response' => $verified,
            ]);
            Log::info("Iris webhook: Payout #{$payout->id} verified and marked COMPLETED via Midtrans source-of-truth challenge.");
        } elseif (in_array($providerStatus, ['failed', 'rejected', 'denied'])) {
            $payout->update([
                'status' => \App\Enum\PayoutStatus::FAILED,
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

        if ($currentStatus === PaymentStatus::REFUNDED) {
            return false;
        }

        if (in_array($currentStatus, [PaymentStatus::FAILED, PaymentStatus::EXPIRED, PaymentStatus::CANCELLED], true)) {
            return false;
        }

        return true;
    }
}
