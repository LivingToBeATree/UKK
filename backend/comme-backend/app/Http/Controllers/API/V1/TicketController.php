<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Requests\API\V1\Ticket\UpdateTicketRequest;
use App\Http\Resources\API\V1\TicketResource;
use App\Models\Ticket;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class TicketController extends Controller
{
    /**
     * No store() method or route at all — TicketPolicy::create() is
     * always false, matching the spec: tickets are created automatically
     * as a side effect of a Report being escalated, not through a direct
     * user-facing endpoint. That hookup would live in ReportController,
     * not here.
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', Ticket::class);

        $tickets = Ticket::with(['report', 'assignee'])->latest()->paginate(20);

        return ApiResponseHelper::successResponse(
            TicketResource::collection($tickets),
            'Tickets retrieved successfully.',
        );
    }

    /**
     * Store a newly created resource in storage. (Made them comment)
     */
    // public function store(Request $request)
    // {
    //     //
    // }

    /**
     * Display the specified resource.
     */
    public function show(Ticket $ticket): JsonResponse
    {
        Gate::authorize('view', $ticket);

        return ApiResponseHelper::successResponse(
            new TicketResource($ticket->load(['report', 'assignee', 'messages.user', 'moderationActions'])),
            'Ticket retrieved successfully.',
        );
    }

    /**
     * When assigned_to is present, assigned_at is always set alongside
     * it automatically — same "keep companion fields in sync" pattern as
     * CommissionReview's reply() and Report's update().
     */
    public function update(UpdateTicketRequest $request, Ticket $ticket): JsonResponse
    {
        $data = $request->validated();

        if (array_key_exists('assigned_to', $data)) {
            $data['assigned_at'] = $data['assigned_to'] ? now() : null;
        }

        $ticket->update($data);

        return ApiResponseHelper::successResponse(
            new TicketResource($ticket),
            'Ticket updated successfully.',
        );
    }

    public function close(Ticket $ticket): JsonResponse
    {
        Gate::authorize('update', $ticket);

        $ticket->update(['closed_at' => now()]);

        return ApiResponseHelper::successResponse(
            new TicketResource($ticket),
            'Ticket closed successfully.',
        );
    }

    // No destroy() — TicketPolicy::delete() is always false; moderation
    // history is preserved permanently. (Made them comment)
    // public function destroy(Ticket $ticket)
    // {
    //     //
    // }
}
