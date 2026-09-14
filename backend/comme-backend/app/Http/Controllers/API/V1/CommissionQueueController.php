<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\CommissionStatus;
use App\Http\Helpers\ApiResponseHelper;
use App\Models\ArtistProfile;
use App\Models\Commission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionQueueController extends Controller
{
    /**
     * Display the public commission queue and capacity tracker for an artist.
     */
    public function index(Request $request, ArtistProfile $artistProfile): JsonResponse
    {
        $viewer = $request->user('sanctum') ?? $request->user();

        // Active queue commissions: accepted, in_progress, waiting_for_client, revision
        $activeCommissions = Commission::where('artist_profile_id', $artistProfile->id)
            ->whereIn('status', [
                CommissionStatus::ACCEPTED,
                CommissionStatus::IN_PROGRESS,
                CommissionStatus::WAITING_FOR_CLIENT,
                CommissionStatus::REVISION,
            ])
            ->with(['user:id,username,display_name', 'commissionService:id,name,slug', 'commissionOption:id,title'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Recent completed commissions for transparency
        $completedCommissions = Commission::where('artist_profile_id', $artistProfile->id)
            ->where('status', CommissionStatus::COMPLETED)
            ->with(['user:id,username,display_name', 'commissionService:id,name,slug'])
            ->latest('completed_at')
            ->take(6)
            ->get();

        $maskName = function (?string $name): string {
            if (!$name) {
                return 'Anonymous Client';
            }
            $len = mb_strlen($name);
            if ($len <= 2) {
                return mb_substr($name, 0, 1) . '***';
            }
            return mb_substr($name, 0, 1) . '***' . mb_substr($name, -1, 1);
        };

        $mapItem = function (Commission $c, ?int $position, bool $isActive) use ($viewer, $artistProfile, $maskName) {
            $isOwner = $viewer && $viewer->id === $c->user_id;
            $isArtist = $viewer && $viewer->id === $artistProfile->user_id;

            $stage = match ($c->status) {
                CommissionStatus::ACCEPTED => 'waitlist',
                CommissionStatus::IN_PROGRESS => 'in_progress',
                CommissionStatus::WAITING_FOR_CLIENT => 'review',
                CommissionStatus::REVISION => 'revision',
                CommissionStatus::COMPLETED => 'completed',
                default => 'other',
            };

            $stageLabel = match ($stage) {
                'waitlist' => 'Queued / Waitlist',
                'in_progress' => 'Active Production',
                'review' => 'Delivered (In Review)',
                'revision' => 'Revision Polish',
                'completed' => 'Delivered & Accepted',
                default => ucfirst($stage),
            };

            $clientDisplayName = ($isOwner || $isArtist)
                ? ($c->user?->display_name ?: $c->user?->username ?: 'Client')
                : $maskName($c->user?->username ?: $c->user?->display_name);

            return [
                'id' => $c->id,
                'code' => 'COM-#' . $c->id,
                'slug' => $c->slug,
                'stage' => $stage,
                'stage_label' => $stageLabel,
                'status' => $c->status->value,
                'position' => $isActive ? $position : null,
                'service_name' => $c->commissionService?->name ?? 'Custom Commission',
                'option_name' => $c->commissionOption?->title,
                'client_name' => $clientDisplayName,
                'is_current_user' => (bool) $isOwner,
                'deadline' => $c->deadline?->toDateString(),
                'review_deadline' => $c->review_deadline?->toIso8601String(),
                'completed_at' => $c->completed_at?->toIso8601String(),
                'created_at' => $c->created_at?->toIso8601String(),
            ];
        };

        $queueItems = [];
        $position = 1;
        foreach ($activeCommissions as $commission) {
            $queueItems[] = $mapItem($commission, $position++, true);
        }

        $completedItems = [];
        foreach ($completedCommissions as $commission) {
            $completedItems[] = $mapItem($commission, null, false);
        }

        $capacity = 5; // Standard studio active capacity slots
        $activeCount = count($queueItems);

        $stats = [
            'total_active' => $activeCount,
            'capacity' => $capacity,
            'waitlist_count' => collect($queueItems)->where('stage', 'waitlist')->count(),
            'in_progress_count' => collect($queueItems)->where('stage', 'in_progress')->count(),
            'review_count' => collect($queueItems)->whereIn('stage', ['review', 'revision'])->count(),
            'completed_recent_count' => count($completedItems),
            'is_full' => $activeCount >= $capacity,
            'commission_open' => (bool) ($artistProfile->commission_open ?? true),
            'commission_status' => $artistProfile->commission_status ?? 'open',
        ];

        return ApiResponseHelper::successResponse([
            'artist' => [
                'id' => $artistProfile->id,
                'username' => $artistProfile->user?->username,
                'display_name' => $artistProfile->user?->display_name,
            ],
            'stats' => $stats,
            'queue' => $queueItems,
            'recent_completed' => $completedItems,
        ], 'Commission queue retrieved successfully.');
    }
}
