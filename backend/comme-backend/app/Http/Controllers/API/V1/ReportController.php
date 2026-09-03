<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\ReportStatus;
use App\Enum\TicketPriority;
use App\Http\Requests\API\V1\Report\StoreReportRequest;
use App\Http\Requests\API\V1\Report\UpdateReportRequest;
use App\Http\Resources\API\V1\ReportResource;
use App\Models\Report;
use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display a listing of reports. Staff see all reports with filters; regular users see their own.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Report::class);

        $user = $request->user();
        $query = Report::with(['reporter', 'reportable', 'handledBy', 'ticket.assignee'])->latest();

        if (! $user->isStaff() && ! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        } else {
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            if ($request->filled('reason')) {
                $query->where('reason', $request->reason);
            }
            if ($request->filled('reportable_type')) {
                $query->where('reportable_type', $request->reportable_type);
            }
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'ILIKE', "%{$search}%")
                      ->orWhereHas('reporter', function ($uq) use ($search) {
                          $uq->where('username', 'ILIKE', "%{$search}%")
                             ->orWhere('display_name', 'ILIKE', "%{$search}%");
                      });
                });
            }
        }

        $reports = $query->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            ReportResource::collection($reports),
            'Reports retrieved successfully.',
        );
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
        $report = DB::transaction(function () use ($request): Report {
            $isAppeal = $request->reason === 'appeal' || (is_object($request->reason) && $request->reason->value === 'appeal');

            $report = Report::create([
                'reportable_type' => $request->resolveReportableClass(),
                'reportable_id' => $request->reportable_id,
                'reason' => $request->reason,
                'description' => $request->description,
                'user_id' => $request->user()->id,
                'status' => ReportStatus::PENDING,
            ]);

            $ticket = $report->ticket()->create([
                'priority' => $isAppeal ? TicketPriority::HIGH : TicketPriority::NORMAL,
            ]);

            if ($isAppeal && !empty($request->description)) {
                $ticket->messages()->create([
                    'user_id' => $request->user()->id,
                    'content' => "⚖️ Appeal Submitted: " . $request->description,
                ]);
            }

            return $report;
        });

        return ApiResponseHelper::successResponse(
            new ReportResource($report->load(['reporter', 'reportable', 'handledBy', 'ticket'])),
            'Report submitted successfully.',
            Response::HTTP_CREATED
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Report $report): JsonResponse
    {
        Gate::authorize('view', $report);

        return ApiResponseHelper::successResponse(
            new ReportResource($report->load(['reporter', 'reportable', 'handledBy', 'ticket'])),
            'Report retrieved successfully.',
        );
    }

    /**
     * handled_by / handled_at are always set together here, the moment
     * staff changes the status — same "keep companion fields in sync"
     * pattern as CommissionReview's reply().
     */
    public function update(UpdateReportRequest $request, Report $report): JsonResponse
    {
        $statusEnum = $request->status instanceof ReportStatus ? $request->status : ReportStatus::from($request->status);
        $report->update([
            'status' => $statusEnum,
            'handled_by' => $request->user()->id,
            'handled_at' => now(),
        ]);

        if ($statusEnum === ReportStatus::RESOLVED || $statusEnum === ReportStatus::DISMISSED) {
            $report->ticket?->update(['closed_at' => now()]);
        }

        return ApiResponseHelper::successResponse(
            new ReportResource($report->load(['reporter', 'reportable', 'handledBy', 'ticket'])),
            'Report updated successfully.',
        );
    }

    /**
     * Staff execution of punitive/remediation moderation actions on a report.
     */
    public function executeAction(Request $request, Report $report): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isStaff()) {
            return ApiResponseHelper::errorResponse('Unauthorized. Staff privileges required.', 403);
        }

        $validated = $request->validate([
            'action_type' => ['required', \Illuminate\Validation\Rule::in(['warning', 'remove_content', 'restore_content', 'suspend_user', 'unsuspend_user'])],
            'notes' => ['required', 'string', 'max:1000'],
        ]);

        $actionType = $validated['action_type'];
        $notes = $validated['notes'];

        // 1. Perform action on reportable entity
        $targetUser = null;
        $targetTitle = 'Reported Item';

        if ($report->reportable) {
            if ($report->reportable instanceof \App\Models\Post) {
                $post = $report->reportable;
                $targetUser = $post->user;
                $targetTitle = "Post #{$post->id}";
                if ($actionType === 'remove_content') {
                    $post->update([
                        'visibility' => \App\Enum\PostVisibilityType::PRIVATE,
                        'is_taken_down' => true,
                        'taken_down_reason' => $notes,
                    ]);
                    if ($post->portfolio_id) {
                        $post->portfolio?->update([
                            'visibility' => \App\Enum\CommissionVisibility::PRIVATE,
                            'is_taken_down' => true,
                            'taken_down_reason' => $notes,
                        ]);
                    }
                } elseif ($actionType === 'restore_content') {
                    $post->update([
                        'visibility' => \App\Enum\PostVisibilityType::PUBLIC,
                        'is_taken_down' => false,
                        'taken_down_reason' => null,
                    ]);
                    if ($post->portfolio_id) {
                        $post->portfolio?->update([
                            'visibility' => \App\Enum\CommissionVisibility::PUBLIC,
                            'is_taken_down' => false,
                            'taken_down_reason' => null,
                        ]);
                    }
                }
            } elseif ($report->reportable instanceof \App\Models\Portfolio) {
                $portfolio = $report->reportable;
                $targetUser = $portfolio->artistProfile?->user;
                $targetTitle = "Artwork '{$portfolio->title}'";
                if ($actionType === 'remove_content') {
                    $portfolio->update([
                        'visibility' => \App\Enum\CommissionVisibility::PRIVATE,
                        'is_taken_down' => true,
                        'taken_down_reason' => $notes,
                    ]);
                    \App\Models\Post::where('portfolio_id', $portfolio->id)->update([
                        'visibility' => \App\Enum\PostVisibilityType::PRIVATE,
                        'is_taken_down' => true,
                        'taken_down_reason' => $notes,
                    ]);
                } elseif ($actionType === 'restore_content') {
                    $portfolio->update([
                        'visibility' => \App\Enum\CommissionVisibility::PUBLIC,
                        'is_taken_down' => false,
                        'taken_down_reason' => null,
                    ]);
                    \App\Models\Post::where('portfolio_id', $portfolio->id)->update([
                        'visibility' => \App\Enum\PostVisibilityType::PUBLIC,
                        'is_taken_down' => false,
                        'taken_down_reason' => null,
                    ]);
                }
            } elseif ($report->reportable instanceof \App\Models\User) {
                $targetUser = $report->reportable;
                $targetTitle = "User @{$targetUser->username}";
            }
        }

        // Apply user-level warning/suspension if target user exists
        if ($targetUser) {
            if ($actionType === 'warning') {
                $targetUser->update([
                    'active_warning' => $notes,
                    'warning_acknowledged_at' => null,
                ]);
            } elseif ($actionType === 'suspend_user') {
                $targetUser->update([
                    'suspended_at' => now(),
                    'suspension_reason' => $notes,
                ]);
                $targetUser->tokens()->delete();
            } elseif ($actionType === 'unsuspend_user') {
                $targetUser->update([
                    'suspended_at' => null,
                    'suspension_reason' => null,
                ]);
            }
        }

        // 2. Audit log to ModerationAction
        $moderationAction = \App\Models\ModerationAction::create([
            'ticket_id' => $report->ticket?->id,
            'user_id' => $user->id,
            'type' => $actionType,
            'notes' => $notes,
        ]);

        // 3. If ticket exists, post an official message to the ticket thread
        if ($report->ticket) {
            \App\Models\TicketMessage::create([
                'ticket_id' => $report->ticket->id,
                'user_id' => $user->id,
                'content' => "🛡️ [STAFF ACTION TAKEN - " . strtoupper(str_replace('_', ' ', $actionType)) . "]: {$notes}",
            ]);
        }

        // 4. Send Notification to target user if identified
        if ($targetUser && $targetUser->id !== $user->id) {
            $notificationTitle = match ($actionType) {
                'warning' => 'Official Warning Notice',
                'suspend_user' => 'Account Suspension Notice',
                'unsuspend_user' => 'Account Reinstated',
                'remove_content' => 'Content Taken Down',
                'restore_content' => 'Content Restored',
                default => 'Moderation Notice',
            };

            \App\Models\Notification::create([
                'user_id' => $targetUser->id,
                'actor_id' => $user->id,
                'type' => \App\Enum\NotificationType::SYSTEM,
                'title' => $notificationTitle,
                'message' => "Moderation action taken regarding {$targetTitle}: {$notes}",
            ]);
        }

        // 5. Update report status to resolved & close ticket
        $report->update([
            'status' => \App\Enum\ReportStatus::RESOLVED,
            'handled_by' => $user->id,
            'handled_at' => now(),
        ]);

        $report->ticket?->update(['closed_at' => now()]);

        return ApiResponseHelper::successResponse([
            'report' => new ReportResource($report->fresh()->load(['reporter', 'reportable', 'handledBy', 'ticket.messages.user', 'ticket.moderationActions'])),
            'moderation_action' => $moderationAction,
        ], 'Moderation action executed and logged successfully.');
    }

    /**
     * Remove the specified resource from storage. (now are comment)
     */
    // public function destroy(Report $report)
    // {
    //     //
    // }
}
