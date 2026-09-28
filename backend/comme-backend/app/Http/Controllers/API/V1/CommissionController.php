<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\CommissionStatus;
use App\Enum\PaymentStatus;
use App\Services\API\V1\MidtransService;
use App\Http\Requests\API\V1\Commission\StoreCommissionRequest;
use App\Http\Requests\API\V1\Commission\UpdateCommissionDeadlineRequest;
use App\Http\Requests\API\V1\Commission\ProposeCommissionDeadlineRequest;
use App\Http\Requests\API\V1\Commission\UpdateCommissionRequest;
use App\Http\Resources\API\V1\CommissionResource;
use App\Http\Helpers\ApiResponseHelper;
use App\Models\Commission;
use App\Models\CommissionOption;
use App\Models\CommissionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Cache;
use App\Enum\MediaType;
use App\Enum\MessageType;
use App\Enum\NotificationType;
use App\Enum\ReportReason;
use App\Enum\ReportStatus;
use App\Enum\TicketPriority;
use App\Models\CommissionMessage;
use App\Models\CommissionMessageMedia;
use App\Models\Notification;
use App\Models\Report;
use App\Models\Ticket;
use App\Services\API\V1\StaffNotificationService;
use App\Http\Requests\API\V1\Commission\DeliverCommissionRequest;
use App\Services\API\V1\CommissionCompletionService;
use App\Services\API\V1\CommissionCancellationService;
use App\Services\API\V1\GeoIpService;
use App\Services\API\V1\AntiArbitrageService;
use Exception;
use InvalidArgumentException;

class CommissionController extends Controller
{
    /**
     * viewAny only gates access to the listing endpoint — the actual
     * "only show commissions involving me" restriction happens in this
     * query, using orWhereHas to check both sides (buyer or artist).
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Commission::class);

        $userId = auth()->id();
        $query = Commission::query();

        $role = $request->query('role'); // 'buyer' or 'artist'

        if ($role === 'artist') {
            $query->whereHas('artistProfile', fn ($q) => $q->where('user_id', $userId));
        } elseif ($role === 'buyer') {
            $query->where('user_id', $userId);
        } else {
            $query->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)
                  ->orWhereHas('artistProfile', fn ($sub) => $sub->where('user_id', $userId));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        // Search query across commission description, service title, and counterpart username
        if ($request->filled('search')) {
            $search = trim($request->search);
            $like = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'like';
            $query->where(function ($q) use ($search, $like) {
                $q->where('description', $like, "%{$search}%")
                  ->orWhereHas('commissionService', fn ($sq) => $sq->where('name', $like, "%{$search}%"))
                  ->orWhereHas('user', fn ($uq) => $uq->where('username', $like, "%{$search}%")->orWhere('display_name', $like, "%{$search}%"))
                  ->orWhereHas('artistProfile.user', fn ($uq) => $uq->where('username', $like, "%{$search}%")->orWhere('display_name', $like, "%{$search}%"));
            });
        }

        // Sorting / Sort Order
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'title_asc':
            case 'name_asc':
            case 'alphabetical':
            case 'az':
                $query->join('commission_services', 'commissions.commission_service_id', '=', 'commission_services.id')
                    ->orderBy('commission_services.name', 'asc')
                    ->select('commissions.*');
                break;
            case 'title_desc':
            case 'name_desc':
            case 'za':
                $query->join('commission_services', 'commissions.commission_service_id', '=', 'commission_services.id')
                    ->orderBy('commission_services.name', 'desc')
                    ->select('commissions.*');
                break;
            case 'oldest':
                $query->oldest();
                break;
            case 'price_desc':
                $query->orderByDesc('total_price');
                break;
            case 'price_asc':
                $query->orderBy('total_price', 'asc');
                break;
            case 'deadline_asc':
                $query->orderByRaw('deadline IS NULL, deadline ASC');
                break;
            case 'deadline_desc':
                $query->orderByRaw('deadline IS NULL, deadline DESC');
                break;
            case 'latest':
            default:
                $query->latest();
                break;
        }

        $commissions = $query
            ->with(['commissionService', 'commissionOption.addons', 'artistProfile.user', 'user'])
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
        $serviceIdOrSlug = $request->commission_service_id;
        $service = CommissionService::with('artistProfile')
            ->where(function ($q) use ($serviceIdOrSlug) {
                $q->where('slug', $serviceIdOrSlug)
                    ->orWhere('id', is_numeric($serviceIdOrSlug) ? (int) $serviceIdOrSlug : 0);
            })
            ->firstOrFail();

        if ($service->artistProfile?->user_id === $request->user()->id || $service->artist_profile_id === $request->user()->artistProfile?->id) {
            return ApiResponseHelper::errorResponse(
                'You cannot order a commission from your own artist profile.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if (! $service->artistProfile || ! $service->artistProfile->isOpen()) {
            return ApiResponseHelper::errorResponse(
                'This artist is not currently accepting commissions.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $option = $request->commission_option_id
            ? CommissionOption::with('addons')->findOrFail($request->commission_option_id)
            : null;

        $basePrice = $option?->base_price ? (float) $option->base_price : 0;

        // Anti-Arbitrage: Determine regional pricing tier strictly from verified IP geolocation
        $clientLocation = GeoIpService::getClientLocation($request);
        $billingCurrency = $clientLocation['billing_currency'];

        $cachedRates = Cache::get('comme_exchange_rates_v1');
        $rateToIdr = $cachedRates['rates_to_idr'][$billingCurrency] ?? match ($billingCurrency) {
            'USD' => 15873,
            'EUR' => 17241,
            'GBP' => 20408,
            'SGD' => 11764,
            'JPY' => 105,
            default => 1,
        };

        if ($billingCurrency === 'IDR' && ! empty($option?->regional_prices['IDR'])) {
            $basePrice = (float) $option->regional_prices['IDR'];
        } elseif ($billingCurrency !== 'IDR' && ! empty($option?->regional_prices[$billingCurrency])) {
            $regionalVal = (float) $option->regional_prices[$billingCurrency];
            $basePrice = round($regionalVal * $rateToIdr);
        } elseif ($option?->pricing_mode === 'ppp' && $billingCurrency !== 'IDR') {
            // Dynamic PPP calculation fallback for option base price
            $optionBaseCur = $option->base_currency ?? 'IDR';
            $baseOptionVal = (float) $option->base_price;
            if ($optionBaseCur !== 'IDR' && ! empty($option->regional_prices[$optionBaseCur])) {
                $baseOptionVal = (float) $option->regional_prices[$optionBaseCur];
            }
            $pppRegionalPrice = GeoIpService::calculatePppPrice($baseOptionVal, $optionBaseCur, $billingCurrency);
            $basePrice = round($pppRegionalPrice * $rateToIdr);
        }

        $addonTotal = 0;
        $selectedAddons = [];

        if ($request->has('addon_ids') && is_array($request->addon_ids) && $option) {
            $validAddons = $option->addons()->whereIn('id', $request->addon_ids)->get();

            foreach ($validAddons as $addon) {
                $addonPrice = (float) $addon->additional_price;
                if ($billingCurrency === 'IDR' && ! empty($addon->regional_prices['IDR'])) {
                    $addonPrice = (float) $addon->regional_prices['IDR'];
                } elseif ($billingCurrency !== 'IDR' && ! empty($addon->regional_prices[$billingCurrency])) {
                    $regionalVal = (float) $addon->regional_prices[$billingCurrency];
                    $addonPrice = round($regionalVal * $rateToIdr);
                } elseif ($option->pricing_mode === 'ppp' && $billingCurrency !== 'IDR') {
                    // Dynamic PPP calculation fallback for addon
                    $addonBaseCur = $addon->base_currency ?? ($option->base_currency ?? 'IDR');
                    $baseAddonVal = (float) $addon->additional_price;
                    if ($addonBaseCur !== 'IDR' && ! empty($addon->regional_prices[$addonBaseCur])) {
                        $baseAddonVal = (float) $addon->regional_prices[$addonBaseCur];
                    }
                    $pppRegionalPrice = GeoIpService::calculatePppPrice($baseAddonVal, $addonBaseCur, $billingCurrency);
                    $addonPrice = round($pppRegionalPrice * $rateToIdr);
                }

                $addonTotal += $addonPrice;
                $selectedAddons[] = [
                    'addon' => $addon,
                    'price' => $addonPrice,
                ];
            }
        }

        $totalPrice = $basePrice + $addonTotal;

        $files = [];
        if ($request->hasFile('attachments')) {
            $uploaded = $request->file('attachments');
            $files = is_array($uploaded) ? $uploaded : [$uploaded];
        } elseif ($request->hasFile('media')) {
            $uploaded = $request->file('media');
            $files = is_array($uploaded) ? $uploaded : [$uploaded];
        } elseif ($request->hasFile('reference_images')) {
            $uploaded = $request->file('reference_images');
            $files = is_array($uploaded) ? $uploaded : [$uploaded];
        }

        $commission = DB::transaction(function () use ($request, $service, $option, $selectedAddons, $files, $totalPrice) {
            $commission = Commission::create([
                ...$request->only(['description', 'deadline']),
                'commission_service_id' => $service->id,
                'commission_option_id' => $option?->id,
                'artist_profile_id' => $service->artist_profile_id,
                'user_id' => $request->user()->id,
                'status' => CommissionStatus::PENDING,
                'total_price' => $totalPrice,
            ]);

            foreach ($selectedAddons as $item) {
                $addon = $item['addon'];
                $commission->addonsSelections()->create([
                    'commission_addon_id' => $addon->id,
                    'title' => $addon->title,
                    'price' => $item['price'],
                ]);
            }

            // Create initial commission message with the brief and attached references
            $initialMessage = CommissionMessage::create([
                'commission_id' => $commission->id,
                'sender_id' => $request->user()->id,
                'recipient_id' => $service->artistProfile?->user_id,
                'message' => $request->description,
                'message_type' => MessageType::USER,
            ]);

            foreach ($files as $index => $file) {
                if (! $file || ! $file->isValid()) {
                    continue;
                }

                $path = $file->store('commissions/messages', 'public');
                $mime = $file->getClientMimeType() ?: 'application/octet-stream';
                $mediaType = str_starts_with($mime, 'image/')
                    ? MediaType::IMAGE
                    : (str_starts_with($mime, 'video/') ? MediaType::VIDEO : MediaType::IMAGE);

                CommissionMessageMedia::create([
                    'commission_message_id' => $initialMessage->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize() ?: 0,
                    'media_type' => $mediaType,
                    'mime_type' => $mime,
                    'sort_order' => $index,
                ]);
            }

            return $commission;
        });

        if (! empty($clientLocation['arbitrage_blocked'])) {
            AntiArbitrageService::handleVpnArbitrageAttempt($request->user(), $commission, $clientLocation);
        }

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages.media', 'review', 'addonsSelections'])),
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
            new CommissionResource(
                $commission->load(['commissionService', 'commissionOption.addons', 'artistProfile.user', 'user', 'messages.user', 'review', 'addonsSelections', 'payout', 'payment', 'payments'])
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
            new CommissionResource(
                $commission->load(['commissionService', 'commissionOption.addons', 'artistProfile.user', 'user', 'messages.user', 'review', 'addonsSelections', 'payout', 'payment', 'payments'])
            ),
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

    public function deliver(DeliverCommissionRequest $request, Commission $commission): JsonResponse
    {
        Gate::authorize('markDelivered', $commission);

        if (!in_array($commission->status, [CommissionStatus::IN_PROGRESS, CommissionStatus::REVISION])) {
            return ApiResponseHelper::errorResponse(
                "Commission cannot be marked as delivered from status '{$commission->status->value}'. Expected in_progress or revision.",
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $files = $request->file('files') ?? $request->file('attachments') ?? [];
        if (!is_array($files)) {
            $files = $files ? [$files] : [];
        }

        $deliveryNote = $request->input('note') ?? $request->input('message') ?? 'Here are the completed deliverables for your review!';

        DB::transaction(function () use ($commission, $files, $deliveryNote, $request) {
            $commission->update([
                'status' => CommissionStatus::WAITING_FOR_CLIENT,
                'delivered_at' => now(),
                'review_deadline' => now()->addDays(7),
            ]);

            // Create a dedicated Delivery Message in the chat workspace
            $deliveryMessage = CommissionMessage::create([
                'commission_id' => $commission->id,
                'sender_id' => $request->user()->id,
                'recipient_id' => $commission->user_id,
                'message' => "[Final Work Delivered]: {$deliveryNote}",
                'message_type' => MessageType::USER,
            ]);

            foreach ($files as $index => $file) {
                if (!$file || !$file->isValid()) {
                    continue;
                }
                $path = $file->store('commissions/deliverables', 'public');
                $mime = $file->getClientMimeType() ?: 'application/octet-stream';
                $mediaType = str_starts_with($mime, 'image/')
                    ? MediaType::IMAGE
                    : (str_starts_with($mime, 'video/') ? MediaType::VIDEO : MediaType::IMAGE);

                CommissionMessageMedia::create([
                    'commission_message_id' => $deliveryMessage->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize() ?: 0,
                    'media_type' => $mediaType,
                    'mime_type' => $mime,
                    'sort_order' => $index,
                ]);
            }

            Notification::create([
                'user_id' => $commission->user_id,
                'type' => NotificationType::COMMISSION_MESSAGE,
                'title' => 'Deliverables submitted',
                'message' => 'The artist has delivered final work for your commission. Please review it within 7 days.',
                'notifiable_type' => Commission::class,
                'notifiable_id' => $commission->id,
            ]);
        });

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages.media', 'review', 'payout'])),
            'Completed work delivered! 7-day client review window has commenced.'
        );
    }

    public function confirm(Commission $commission, CommissionCompletionService $completionService): JsonResponse
    {
        Gate::authorize('confirmCompletion', $commission);

        try {
            $completed = $completionService->completeCommission($commission, false);

            return ApiResponseHelper::successResponse(
                new CommissionResource($completed->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review', 'payout'])),
                'Commission successfully confirmed and completed. Artist payout has been queued.'
            );
        } catch (Exception $e) {
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

    public function cancel(Request $request, Commission $commission, CommissionCancellationService $cancellationService): JsonResponse
    {
        Gate::authorize('cancel', $commission);

        try {
            $cancelled = $cancellationService->cancelImmediately($commission, $request->user());

            return ApiResponseHelper::successResponse(
                new CommissionResource($cancelled),
                'Commission cancelled successfully.'
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponseHelper::errorResponse(
                $e->getMessage(),
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }
    }

    public function requestCancellation(Request $request, Commission $commission, CommissionCancellationService $cancellationService): JsonResponse
    {
        Gate::authorize('requestCancellation', $commission);

        $validated = $request->validate([
            'reason' => 'required|string|min:5|max:1000',
        ]);

        $updated = $cancellationService->requestCancellation($commission, $request->user(), $validated['reason']);

        return ApiResponseHelper::successResponse(
            new CommissionResource($updated),
            'Cancellation request submitted successfully.'
        );
    }

    public function acceptCancellation(Commission $commission, CommissionCancellationService $cancellationService): JsonResponse
    {
        Gate::authorize('acceptCancellation', $commission);

        $result = $cancellationService->acceptCancellation($commission, auth()->user());

        if (isset($result['error'])) {
            return ApiResponseHelper::errorResponse($result['error'], $result['code'] ?? Response::HTTP_CONFLICT);
        }

        return ApiResponseHelper::successResponse(
            new CommissionResource($result['commission']),
            $result['message']
        );
    }

    public function declineCancellation(Commission $commission, CommissionCancellationService $cancellationService): JsonResponse
    {
        Gate::authorize('declineCancellation', $commission);

        $result = $cancellationService->declineCancellation($commission, auth()->user());

        return ApiResponseHelper::successResponse(
            new CommissionResource($result['commission']),
            $result['message']
        );
    }

    public function updateDeadline(UpdateCommissionDeadlineRequest $request, Commission $commission): JsonResponse
    {
        $activeStatuses = [
            CommissionStatus::ACCEPTED,
            CommissionStatus::IN_PROGRESS,
            CommissionStatus::WAITING_FOR_CLIENT,
            CommissionStatus::REVISION,
        ];

        if (! in_array($commission->status, $activeStatuses, true)) {
            return ApiResponseHelper::errorResponse(
                "Deadlines cannot be modified for commissions in '{$commission->status->value}' status.",
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if (is_null($commission->deadline)) {
            return ApiResponseHelper::errorResponse(
                'This commission has a flexible deadline. Deadline cannot be modified directly.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $commission->update($request->validated());

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])),
            'Commission deadline updated successfully.'
        );
    }

    public function proposeDeadline(ProposeCommissionDeadlineRequest $request, Commission $commission): JsonResponse
    {
        $activeStatuses = [
            CommissionStatus::ACCEPTED,
            CommissionStatus::IN_PROGRESS,
            CommissionStatus::WAITING_FOR_CLIENT,
            CommissionStatus::REVISION,
        ];

        if (! in_array($commission->status, $activeStatuses, true)) {
            return ApiResponseHelper::errorResponse(
                "Deadlines cannot be modified for commissions in '{$commission->status->value}' status.",
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if (is_null($commission->deadline)) {
            return ApiResponseHelper::errorResponse(
                'This commission has a flexible deadline. Deadline extensions cannot be requested for flexible orders.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $commission->update([
            'proposed_deadline' => $request->validated('proposed_deadline'),
            'deadline_proposal_note' => $request->validated('note'),
        ]);

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])),
            'Deadline proposal submitted successfully.'
        );
    }

    public function acceptDeadline(Commission $commission): JsonResponse
    {
        Gate::authorize('acceptDeadline', $commission);

        $activeStatuses = [
            CommissionStatus::ACCEPTED,
            CommissionStatus::IN_PROGRESS,
            CommissionStatus::WAITING_FOR_CLIENT,
            CommissionStatus::REVISION,
        ];

        if (! in_array($commission->status, $activeStatuses, true)) {
            return ApiResponseHelper::errorResponse(
                "Deadlines cannot be modified for commissions in '{$commission->status->value}' status.",
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if (!$commission->proposed_deadline) {
            return ApiResponseHelper::errorResponse(
                'There is no pending deadline proposal to accept.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $newDeadline = $commission->proposed_deadline;
        $commission->update([
            'deadline' => $newDeadline,
            'proposed_deadline' => null,
            'deadline_proposal_note' => null,
        ]);

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])),
            'Proposed deadline accepted.'
        );
    }

    public function declineDeadline(Commission $commission): JsonResponse
    {
        Gate::authorize('declineDeadline', $commission);

        $activeStatuses = [
            CommissionStatus::ACCEPTED,
            CommissionStatus::IN_PROGRESS,
            CommissionStatus::WAITING_FOR_CLIENT,
            CommissionStatus::REVISION,
        ];

        if (! in_array($commission->status, $activeStatuses, true)) {
            return ApiResponseHelper::errorResponse(
                "Deadlines cannot be modified for commissions in '{$commission->status->value}' status.",
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if (!$commission->proposed_deadline) {
            return ApiResponseHelper::errorResponse(
                'There is no pending deadline proposal.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $commission->update([
            'proposed_deadline' => null,
            'deadline_proposal_note' => null,
        ]);

        return ApiResponseHelper::successResponse(
            new CommissionResource($commission->load(['commissionService', 'commissionOption', 'artistProfile', 'user', 'messages', 'review'])),
            'Deadline proposal declined/withdrawn.'
        );
    }
}
