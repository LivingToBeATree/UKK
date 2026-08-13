<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\ReportStatus;
use App\Enum\TicketPriority;
use App\Http\Requests\API\V1\Report\StoreReportRequest;
use App\Http\Requests\API\V1\Report\UpdateReportRequest;
use App\Http\Resources\API\V1\ReportResource;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ReportController extends Controller
{
    /**
     * ReportPolicy::viewAny() is staff-only — normal users never browse
     * the full report queue.
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', Report::class);

        $reports = Report::with(['reporter', 'reportable', 'ticket'])->latest()->paginate(20);

        return response()->json(new ReportResource($reports));
    }

    /**
     * A Ticket is created automatically alongside every Report — per your
     * spec, tickets are never created directly by users (TicketPolicy::
     * create() is always false), so this is the one and only place a
     * Ticket ever gets made. It starts unassigned (assigned_to null) and
     * at normal priority; staff picks it up later via TicketController.
     */
    public function store(StoreReportRequest $request): JsonResponse
    {
        $report = Report::create([
            'reportable_type' => $request->resolveReportableType(),
            'reportable_id' => $request->reportable_id,
            'reason' => $request->reason,
            'description' => $request->description,
            'user_id' => $request->user()->id,
            'status' => ReportStatus::PENDING,
        ]);

        $report->ticket()->create([
            'priority' => TicketPriority::NORMAL,
        ]);

        return response()->json(new ReportResource($report->load('ticket')), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Report $report): JsonResponse
    {
        Gate::authorize('view', $report);

        return response()->json(new ReportResource($report->load(['reporter', 'reportable', 'handledBy', 'ticket'])));
    }

    /**
     * handled_by / handled_at are always set together here, the moment
     * staff changes the status — same "keep companion fields in sync"
     * pattern as CommissionReview's reply().
     */
    public function update(UpdateReportRequest $request, Report $report): JsonResponse
    {
        $report->update([
            'status' => $request->status,
            'handled_by' => $request->user()->id,
            'handled_at' => now(),
        ]);

        return response()->json(new ReportResource($report));
    }

    /**
     * Remove the specified resource from storage. (now are comment)
     */
    // public function destroy(Report $report)
    // {
    //     //
    // }
}
