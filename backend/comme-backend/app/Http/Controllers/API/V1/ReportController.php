<?php

namespace App\Http\Controllers\API\V1;

use Illuminate\Support\Facades\Gate;
use Illuminate\Http\JsonResponse;
use App\Models\Report;
use App\Http\Requests\API\V1\Report\StoreReportRequest;
use App\Http\Requests\API\V1\Report\UpdateReportRequest;

class ReportController extends Controller
{
    /**
     * ReportPolicy::viewAny() is staff-only — normal users never browse
     * the full report queue.
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', Report::class);

        $reports = Report::with(['reporter', 'reportable'])->latest()->paginate(20);

        return response()->json($reports);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreReportRequest $request): JsonResponse
    {
        $report = Report::create([
            'reportable_type' => $request->resolveReportableType(),
            'reportable_id' => $request->reportable_id,
            'reason' => $request->reason,
            'description' => $request->description,
            'user_id' => $request->user()->id,
            // status intentionally hardcoded, never taken from input.
            'status' => \App\Enum\ReportStatus::PENDING,
        ]);

        return response()->json($report, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Report $report): JsonResponse
    {
        Gate::authorize('view', $report);

        return response()->json($report->load(['reporter', 'reportable', 'handledBy']));
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

        return response()->json($report);
    }

    /**
     * Remove the specified resource from storage. (now are comment)
     */
    // public function destroy(Report $report)
    // {
    //     //
    // }
}
