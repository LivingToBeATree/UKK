<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\CommissionStatus;
use App\Http\Requests\API\V1\Commission\StoreCommissionRequest;
use App\Http\Requests\API\V1\Commission\UpdateCommissionDeadlineRequest;
use App\Http\Requests\API\V1\Commission\UpdateCommissionRequest;
use App\Http\Resources\API\V1\CommissionResource;
use App\Http\Helpers\ApiResponseHelper;
use App\Models\Commission;
use App\Models\CommissionOption;
use App\Models\CommissionService;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class CommissionController extends Controller
{
    /**
     * viewAny only gates access to the listing endpoint — the actual
     * "only show commissions involving me" restriction happens in this
     * query, using orWhereHas to check both sides (buyer or artist).
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', Commission::class);

        $userId = auth()->id();

        $commissions = Commission::where('user_id', $userId)
            ->orWhereHas('artistProfile', fn ($query) => $query->where('user_id', $userId))
            ->with(['commissionService', 'artistProfile', 'user'])
            ->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            CommissionResource::collection($commissions),
            'Commissions retrieved successfully.',
        );
    }

    /**
     * total_price, status, user_id, and artist_profile_id are never taken
     * from the request body — all four are derived server-side. Letting a
     * client submit any of these would mean a buyer could set their own
     * price, fake another user's ID, or start a commission pre-marked
     * "completed."
     */
    public function store(StoreCommissionRequest $request): JsonResponse
    {
        $service = CommissionService::findOrFail($request->commission_service_id);
        $option = $request->commission_option_id
        ? CommissionOption::findOrFail($request->commission_option_id)
        : null;

        $commission = Commission::create([
            ...$request->only(['description', 'deadline']),
            'commission_service_id' => $service->id,
            'commission_option_id' => $option?->id,
            'artist_profile_id' => $service->artist_profile_id,
            'user_id' => $request->user()->id,
            'status' => CommissionStatus::PENDING,
            'total_price' => $option->base_price ?? 0,
        ]);

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])),
            'Commission created successfully.',
            Response::HTTP_CREATED,
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Commission $commission)
    {
        Gate::authorize('view', $commission);

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])
            ),
            'Commission retrieved successfully.',
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommissionRequest $request, Commission $commission): JsonResponse
    {
        $commission->update($request->validated());

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])),
            'Commission updated successfully.'
        );
    }

    /**
     * No destroy() method, and no route registered for it either —
     * CommissionPolicy::delete() always returns false, so wiring up a
     * route that can never succeed just adds dead code and a confusing
     * 403 instead of a clean 404.
     */

    //public function destroy(Commission $commission)
    //  {
    //      return false
    //  }

    public function accept(Commission $commission): JsonResponse
    {
        Gate::authorize('accept', $commission);

        if ($commission->status !== CommissionStatus::PENDING) {
            return ApiResponseHelper::errorResponse(
                "Commission cannot be accepted from current status '{$commission->status->value}'.",
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $commission->update(['status' => CommissionStatus::ACCEPTED]);

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])),
            'Commission accepted successfully. Client may now proceed to payment.'
        );
    }

    public function decline(Commission $commission): JsonResponse
    {
        Gate::authorize('decline', $commission);

        if ($commission->status !== CommissionStatus::PENDING) {
            return ApiResponseHelper::errorResponse(
                "Commission cannot be declined from current status '{$commission->status->value}'.",
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $commission->update(['status' => CommissionStatus::DECLINED]);

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])),
            'Commission request declined.'
        );
    }

    public function deliver(Commission $commission): JsonResponse
    {
        Gate::authorize('markDelivered', $commission);

        if (!in_array($commission->status, [CommissionStatus::IN_PROGRESS, CommissionStatus::REVISION])) {
            return ApiResponseHelper::errorResponse(
                "Commission cannot be marked as delivered from status '{$commission->status->value}'. Expected in_progress or revision.",
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $commission->update([
            'status' => CommissionStatus::WAITING_FOR_CLIENT,
            'delivered_at' => now(),
            'review_deadline' => now()->addDays(7),
        ]);

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review', 'payout'])),
            'Commission marked as delivered. 7-day client review window has commenced.'
        );
    }

    public function confirm(Commission $commission, \App\Services\API\V1\CommissionCompletionService $completionService): JsonResponse
    {
        Gate::authorize('confirmCompletion', $commission);

        try {
            $completed = $completionService->completeCommission($commission, false);

            return ApiResponseHelper::successResponse(
                new CommissionResource($completed->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review', 'payout'])),
                'Commission successfully confirmed and completed. Artist payout has been queued.'
            );
        } catch (\Exception $e) {
            return ApiResponseHelper::errorResponse(
                $e->getMessage(),
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }
    }

    public function requestRevision(Commission $commission): JsonResponse
    {
        Gate::authorize('requestRevision', $commission);

        if ($commission->status !== CommissionStatus::WAITING_FOR_CLIENT) {
            return ApiResponseHelper::errorResponse(
                "Revision can only be requested when status is 'waiting_for_client', current: '{$commission->status->value}'.",
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $commission->update([
            'status' => CommissionStatus::REVISION,
            'review_deadline' => null,
        ]);

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])),
            'Revision requested. The artist will be notified to make changes.'
        );
    }

    public function cancel(Commission $commission): JsonResponse
    {
        Gate::authorize('cancel', $commission);

        $commission->update(['status' => CommissionStatus::CANCELLED]);

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])),
            'Commission cancelled successfully.'
        );
    }

    public function updateDeadline(UpdateCommissionDeadlineRequest $request, Commission $commission): JsonResponse
    {
        $commission->update($request->validated());

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])),
            'Commission deadline updated successfully.'
        );
    }
}
