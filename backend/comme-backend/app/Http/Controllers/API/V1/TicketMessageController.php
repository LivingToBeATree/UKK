<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Http\Resources\API\V1\TicketMessageResource;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class TicketMessageController extends Controller
{
    /**
     * Post a new message to a ticket thread.
     */
    public function store(Request $request, Ticket $ticket): JsonResponse
    {
        Gate::authorize('create', [TicketMessage::class, $ticket]);

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:1', 'max:3000'],
        ]);

        $message = $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        return ApiResponseHelper::successResponse(
            new TicketMessageResource($message->load('user')),
            'Ticket message sent successfully.',
            Response::HTTP_CREATED
        );
    }
}
