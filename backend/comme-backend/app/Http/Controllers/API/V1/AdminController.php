<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\ArtistApplicationStatus;
use App\Enum\ModerationActionType;
use App\Enum\PaymentStatus;
use App\Enum\ReportStatus;
use App\Enum\TicketStatus;
use App\Enum\UserRole;
use App\Http\Helpers\ApiResponseHelper;
use App\Http\Resources\API\V1\ModerationLogResource;
use App\Http\Resources\API\V1\UserManagementResource;
use App\Models\ArtistApplication;
use App\Models\ArtistProfile;
use App\Models\Commission;
use App\Models\CommissionPayment;
use App\Models\ModerationAction;
use App\Models\Report;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * Aggregated platform stats and real-time queues for Staff / Admin.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isStaff()) {
            return ApiResponseHelper::errorResponse('Unauthorized. Staff privileges required.', 403);
        }

        $pendingAppsCount = ArtistApplication::where('status', ArtistApplicationStatus::PENDING)->count();
        $openReportsCount = Report::whereIn('status', [ReportStatus::PENDING, ReportStatus::UNDER_REVIEW])->count();
        $activeTicketsCount = Ticket::whereNull('closed_at')->count();

        $stats = [
            'total_users' => User::count(),
            'total_artists' => ArtistProfile::count(),
            'total_moderators' => User::where('role', UserRole::MODERATOR)->count(),
            'total_admins' => User::where('role', UserRole::ADMIN)->count(),
            'pending_applications_count' => $pendingAppsCount,
            'open_reports_count' => $openReportsCount,
            'active_tickets_count' => $activeTicketsCount,
            'total_commissions_count' => Commission::count(),
            'completed_commissions_count' => Commission::where('status', 'completed')->count(),
            'total_volume_idr' => (float) CommissionPayment::where('status', PaymentStatus::PAID)->sum('gross_amount'),
            'recent_applications' => ArtistApplication::with('user:id,username,display_name,avatar')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($app) => [
                    'id' => $app->id,
                    'user' => [
                        'id' => $app->user->id,
                        'username' => $app->user->username,
                        'display_name' => $app->user->display_name,
                        'avatar_url' => $app->user->avatar ? asset('storage/' . $app->user->avatar) : null,
                    ],
                    'status' => $app->status->value,
                    'created_at' => $app->created_at?->toISOString(),
                ]),
            'recent_reports' => Report::with('reporter:id,username,display_name,avatar')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($rep) => [
                    'id' => $rep->id,
                    'reason' => $rep->reason->value,
                    'status' => $rep->status->value,
                    'reportable_type' => class_basename($rep->reportable_type),
                    'reporter' => [
                        'id' => $rep->reporter->id,
                        'username' => $rep->reporter->username,
                        'display_name' => $rep->reporter->display_name,
                    ],
                    'created_at' => $rep->created_at?->toISOString(),
                ]),
            'recent_tickets' => Ticket::with(['report.reporter:id,username,display_name', 'assignee:id,username,display_name'])
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($tick) => [
                    'id' => $tick->id,
                    'status' => $tick->closed_at ? 'closed' : 'open',
                    'priority' => $tick->priority->value,
                    'reporter' => $tick->report?->reporter ? [
                        'id' => $tick->report->reporter->id,
                        'username' => $tick->report->reporter->username,
                        'display_name' => $tick->report->reporter->display_name,
                    ] : null,
                    'created_at' => $tick->created_at?->toISOString(),
                ]),
        ];

        return ApiResponseHelper::successResponse($stats, 'Platform statistics retrieved successfully.');
    }

    /**
     * User Management: list all users with search, role filters, and pagination.
     */
    public function users(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isAdmin()) {
            return ApiResponseHelper::errorResponse('Unauthorized. Admin privileges required.', 403);
        }

        $query = User::with(['artistProfile:id,user_id,commission_open'])
            ->withCount(['commissions', 'posts', 'reports']);

        // Search filter (database-agnostic case-insensitive search)
        if ($request->filled('search')) {
            $search = mb_strtolower(trim($request->search));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(username) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(display_name) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"]);
            });
        }

        // Role filter
        if ($request->filled('role') && $request->role !== 'all') {
            if ($request->role === 'artist') {
                $query->whereHas('artistProfile');
            } else {
                $query->where('role', $request->role);
            }
        }

        $users = $query->latest()->paginate(15);

        return ApiResponseHelper::paginatedResponse(
            UserManagementResource::collection($users),
            'Users retrieved successfully.'
        );
    }

    /**
     * User Management: Update user system role (user / moderator / admin).
     */
    public function updateUserRole(Request $request, User $user): JsonResponse
    {
        $actor = $request->user();
        if (! $actor || ! $actor->isAdmin()) {
            return ApiResponseHelper::errorResponse('Unauthorized. Admin privileges required.', 403);
        }

        $validated = $request->validate([
            'role' => ['required', Rule::in(['user', 'moderator', 'admin'])],
        ]);

        // Guard against self-demotion
        if ($actor->id === $user->id && $validated['role'] !== 'admin') {
            return ApiResponseHelper::errorResponse('You cannot demote your own administrator account.', 422);
        }

        $previousRole = $user->role->value;
        $newRole = $validated['role'];

        $user->update([
            'role' => $newRole,
        ]);

        // Audit log the role change
        ModerationAction::create([
            'user_id' => $actor->id,
            'type' => ModerationActionType::ROLE_CHANGED,
            'notes' => "Changed role for @{$user->username} from [{$previousRole}] to [{$newRole}].",
        ]);

        return ApiResponseHelper::successResponse([
            'id' => $user->id,
            'username' => $user->username,
            'role' => $user->role->value,
        ], "Role updated to {$newRole} successfully.");
    }

    /**
     * Moderation Action Audit Logs.
     */
    public function moderationLogs(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isStaff()) {
            return ApiResponseHelper::errorResponse('Unauthorized. Staff privileges required.', 403);
        }

        $query = ModerationAction::with([
            'user:id,username,display_name,avatar,role',
            'ticket:id,report_id,priority,closed_at',
        ])->latest();

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $logs = $query->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            ModerationLogResource::collection($logs),
            'Moderation logs retrieved successfully.'
        );
    }
}
