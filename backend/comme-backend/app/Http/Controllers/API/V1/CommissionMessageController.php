<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\MessageType;
use App\Enum\NotificationType;
use App\Http\Helpers\ApiResponseHelper;
use App\Http\Requests\API\V1\CommissionMessage\StoreCommissionMessageRequest;
use App\Http\Resources\API\V1\CommissionMessageResource;
use App\Models\Commission;
use App\Models\CommissionMessage;
use App\Models\Notification as InAppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class CommissionMessageController extends Controller
{
    public function index(Request $request, Commission $commission): JsonResponse
    {
        $currentUser = $request->user();
        $artistUserId = $commission->artistProfile?->user_id;

        $isParticipant = $currentUser->id === $commission->user_id
            || $currentUser->id === $artistUserId
            || $currentUser->isStaff();

        if (! $isParticipant) {
            throw new AccessDeniedHttpException('You are not authorized to view messages for this commission.');
        }

        $messages = $commission->messages()
            ->with(['sender', 'recipient', 'media'])
            ->oldest()
            ->paginate(50);

        return ApiResponseHelper::paginatedResponse(
            CommissionMessageResource::collection($messages),
            'Commission messages retrieved successfully.'
        );
    }

    public function store(
        StoreCommissionMessageRequest $request,
        Commission $commission,
    ): JsonResponse {
        $currentUser = $request->user();
        $artistUserId = $commission->artistProfile?->user_id;

        if ($currentUser->id === $commission->user_id) {
            // Client is sender -> recipient is artist
            $recipientId = $artistUserId;
        } elseif ($currentUser->id === $artistUserId) {
            // Artist is sender -> recipient is client
            $recipientId = $commission->user_id;
        } else {
            throw new AccessDeniedHttpException('Only the buyer or artist can send messages for this commission.');
        }

        $message = CommissionMessage::create([
            'commission_id' => $commission->id,
            'sender_id' => $currentUser->id,
            'recipient_id' => $recipientId,
            'message' => $request->validated('message') ?? '',
            'message_type' => $request->validated('message_type') ?? MessageType::USER,
        ]);

        // Handle uploaded attachments / media
        $files = [];
        if ($request->hasFile('attachments')) {
            $uploaded = $request->file('attachments');
            $files = is_array($uploaded) ? $uploaded : [$uploaded];
        } elseif ($request->hasFile('media')) {
            $uploaded = $request->file('media');
            $files = is_array($uploaded) ? $uploaded : [$uploaded];
        }

        if ($request->hasFile('attachment')) {
            $files[] = $request->file('attachment');
        }

        if (!empty($files)) {
            foreach ($files as $index => $file) {
                if (!$file || !$file->isValid()) {
                    continue;
                }
                $path = $file->store('commissions/messages', 'public');
                $mime = $file->getClientMimeType() ?: 'application/octet-stream';
                $mediaType = str_starts_with($mime, 'image/') 
                    ? \App\Enum\MediaType::IMAGE 
                    : (str_starts_with($mime, 'video/') ? \App\Enum\MediaType::VIDEO : \App\Enum\MediaType::IMAGE);

                \App\Models\CommissionMessageMedia::create([
                    'commission_message_id' => $message->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize() ?: 0,
                    'media_type' => $mediaType,
                    'mime_type' => $mime,
                    'sort_order' => $index,
                ]);
            }
        }

        if ($recipientId) {
            $hasFiles = !empty($files);
            $notificationSnippet = filled($message->message)
                ? $message->message
                : ($hasFiles ? 'Sent an attachment' : 'Sent a message');

            InAppNotification::create([
                'user_id' => $recipientId,
                'actor_id' => $currentUser->id,
                'type' => NotificationType::COMMISSION_MESSAGE,
                'title' => 'New Commission Message',
                'message' => "{$currentUser->display_name}: {$notificationSnippet}",
                'notifiable_type' => Commission::class,
                'notifiable_id' => $commission->id,
            ]);
        }

        return ApiResponseHelper::successResponse(
            new CommissionMessageResource($message->load(['sender', 'recipient', 'media'])),
            'Message sent successfully.',
            Response::HTTP_CREATED,
        );
    }
}
