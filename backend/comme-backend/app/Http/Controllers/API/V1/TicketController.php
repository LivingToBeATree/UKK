<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Requests\API\V1\Ticket\UpdateTicketRequest;
use App\Http\Resources\API\V1\TicketResource;
use App\Models\Ticket;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TicketController extends Controller
{
    /**
     * Display a listing of tickets. Staff see all tickets with priority/status filters; users see their own.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Ticket::class);

        $user = $request->user();
        $query = Ticket::with(['report.reporter', 'report.reportable', 'assignee', 'messages.user'])->latest();

        if (! $user->isStaff() && ! $user->isAdmin()) {
            $query->whereHas('report', fn ($q) => $q->where('user_id', $user->id));
        } else {
            if ($request->filled('priority')) {
                $query->where('priority', $request->priority);
            }
            if ($request->filled('status')) {
                if ($request->status === 'closed') {
                    $query->whereNotNull('closed_at');
                } elseif ($request->status === 'open') {
                    $query->whereNull('closed_at');
                } else {
                    $query->whereHas('report', fn ($q) => $q->where('status', $request->status));
                }
            }
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereHas('report', function ($rq) use ($search) {
                        $rq->where('description', 'ILIKE', "%{$search}%")
                           ->orWhereHas('reporter', function ($uq) use ($search) {
                               $uq->where('username', 'ILIKE', "%{$search}%")
                                  ->orWhere('display_name', 'ILIKE', "%{$search}%");
                           });
                    });
                });
            }
        }

        $tickets = $query->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            TicketResource::collection($tickets),
            'Tickets retrieved successfully.',
        );
    }

    /**
     * Display the specified ticket.
     */
    public function show(Ticket $ticket): JsonResponse
    {
        Gate::authorize('view', $ticket);

        return ApiResponseHelper::successResponse(
            new TicketResource($ticket->load(['report.reporter', 'report.reportable', 'report.handledBy', 'assignee', 'messages.user', 'moderationActions.user'])),
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
            new TicketResource($ticket->load(['report', 'assignee', 'messages.user', 'moderationActions'])),
            'Ticket updated successfully.',
        );
    }

    public function close(Ticket $ticket): JsonResponse
    {
        Gate::authorize('update', $ticket);

        $ticket->update(['closed_at' => now()]);

        return ApiResponseHelper::successResponse(
            new TicketResource($ticket->load(['report', 'assignee', 'messages.user', 'moderationActions'])),
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
