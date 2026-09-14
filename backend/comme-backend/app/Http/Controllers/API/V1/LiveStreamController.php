<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Http\Resources\API\V1\CommissionMessageResource;
use App\Models\Commission;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LiveStreamController extends Controller
{
    /**
     * Server-Sent Events (SSE) endpoint for live commission chat messages.
     */
    public function streamCommission(Request $request, Commission $commission): StreamedResponse|\Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponseHelper::errorResponse('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
        }

        // Authorization check: buyer, artist, or staff
        $isParticipant = $user->id === $commission->user_id
            || $user->id === $commission->artistProfile?->user_id
            || $user->isStaff()
            || $user->isAdmin();

        if (! $isParticipant) {
            return ApiResponseHelper::errorResponse(
                'You are not authorized to stream events for this commission.',
                Response::HTTP_FORBIDDEN
            );
        }

        $lastId = (int) ($request->header('Last-Event-ID') ?: $request->query('last_id', 0));

        return response()->stream(function () use ($commission, $lastId) {
            $currentLastId = $lastId;
            $startTime = time();

            // Prevent PHP-FPM / CLI worker pool exhaustion: default to immediate burst return
            // Native EventSource automatically reconnects after the retry delay below.
            $maxDuration = (int) config('services.sse.max_duration', 0);

            // Instruct EventSource client to reconnect after 2.5 seconds upon stream close
            echo "retry: 2500\n\n";
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();

            do {
                if (connection_aborted()) {
                    break;
                }

                $newMessages = $commission->messages()
                    ->with(['sender', 'media'])
                    ->where('id', '>', $currentLastId)
                    ->oldest()
                    ->limit(20)
                    ->get();

                if ($newMessages->isNotEmpty()) {
                    foreach ($newMessages as $msg) {
                        $currentLastId = $msg->id;
                        echo "id: {$msg->id}\n";
                        echo "event: message\n";
                        echo "data: " . json_encode((new CommissionMessageResource($msg))->resolve()) . "\n\n";
                    }
                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                }

                echo ": heartbeat\n\n";
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();

                if ($maxDuration <= 0) {
                    break;
                }

                sleep(3);
            } while (time() - $startTime < $maxDuration);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Server-Sent Events (SSE) endpoint for user notifications.
     */
    public function streamNotifications(Request $request): StreamedResponse|\Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponseHelper::errorResponse('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
        }

        $lastId = (int) ($request->header('Last-Event-ID') ?: $request->query('last_id', 0));

        return response()->stream(function () use ($user, $lastId) {
            $currentLastId = $lastId;
            $startTime = time();

            // Prevent PHP-FPM / CLI worker pool exhaustion: default to immediate burst return
            $maxDuration = (int) config('services.sse.max_duration', 0);

            // Instruct EventSource client to reconnect after 2.5 seconds upon stream close
            echo "retry: 2500\n\n";
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();

            do {
                if (connection_aborted()) {
                    break;
                }

                $newNotifications = Notification::where('user_id', $user->id)
                    ->where('id', '>', $currentLastId)
                    ->oldest()
                    ->limit(10)
                    ->get();

                if ($newNotifications->isNotEmpty()) {
                    foreach ($newNotifications as $notification) {
                        $currentLastId = $notification->id;
                        echo "id: {$notification->id}\n";
                        echo "event: notification\n";
                        echo "data: " . json_encode($notification) . "\n\n";
                    }
                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                }

                echo ": heartbeat\n\n";
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();

                if ($maxDuration <= 0) {
                    break;
                }

                sleep(3);
            } while (time() - $startTime < $maxDuration);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
