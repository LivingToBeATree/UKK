<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Http\Resources\API\V1\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->notifications()->with('actor')->latest();

        if ($request->boolean('unread')) {
            $query->whereNull('read_at');
        }

        $notifications = $query->paginate(20);

        return ApiResponseHelper::paginatedResponse(
            NotificationResource::collection($notifications),
            'Notifications retrieved successfully.'
        );
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()->notifications()->whereNull('read_at')->count();

        return ApiResponseHelper::successResponse(
            ['unread_count' => $count],
            'Unread notification count retrieved successfully.'
        );
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            throw new AccessDeniedHttpException('You are not authorized to access this notification.');
        }

        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return ApiResponseHelper::successResponse(
            new NotificationResource($notification->load('actor')),
            'Notification marked as read.'
        );
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $affected = $request->user()->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return ApiResponseHelper::successResponse(
            ['updated_count' => $affected],
            'All notifications marked as read.'
        );
    }

    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            throw new AccessDeniedHttpException('You are not authorized to access this notification.');
        }

        $notification->delete();

        return ApiResponseHelper::successResponse(
            null,
            'Notification deleted successfully.'
        );
    }
}
