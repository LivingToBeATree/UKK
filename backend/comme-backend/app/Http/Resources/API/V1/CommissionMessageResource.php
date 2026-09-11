<?php

namespace App\Http\Resources\API\V1;

use App\Enum\CommissionStatus;
use App\Models\Commission;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

class CommissionMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isDeliveryMessage = str_starts_with($this->message ?? '', '[Final Work Delivered]');

        $protectDeliverables = false;
        if ($isDeliveryMessage && $this->commission_id) {
            $commission = $this->relationLoaded('commission')
                ? $this->commission
                : Commission::find($this->commission_id);

            if ($commission) {
                $statusVal = $commission->status instanceof CommissionStatus
                    ? $commission->status->value
                    : $commission->status;
                $isCompleted = $statusVal === 'completed';
                $isBuyer = $user && $commission->user_id === $user->id;
                $isStaff = $user && ($user->isStaff() || $user->isAdmin());
                $protectDeliverables = $isBuyer && ! $isCompleted && ! $isStaff;
            }
        }

        $mediaData = $this->whenLoaded('media', function () use ($protectDeliverables) {
            return $this->media->map(function ($media) use ($protectDeliverables) {
                $base = (new MediaResource($media))->toArray(request());
                $mime = $media->mime_type ?: '';
                $isImage = ! $media->media_type || $media->media_type === 'image' || str_starts_with($mime, 'image/');

                if ($protectDeliverables) {
                    $base['is_protected'] = true;
                    if ($isImage) {
                        $proofUrl = url("/api/commissions/{$this->commission_id}/proof/{$media->id}");
                        $base['url'] = $proofUrl;
                        $base['thumbnail_url'] = $proofUrl;
                        $base['is_locked'] = false;
                    } else {
                        $base['is_locked'] = true;
                        $base['url'] = null;
                    }
                } else {
                    $base['is_protected'] = false;
                    $base['is_locked'] = false;
                }

                return $base;
            });
        });

        return [
            'id' => $this->id,
            'commission_id' => $this->commission_id,
            'sender_id' => $this->sender_id,
            'recipient_id' => $this->recipient_id,
            'user_id' => $this->sender_id,
            'message' => $this->message,
            'message_type' => $this->message_type?->value,
            'is_delivery' => $isDeliveryMessage,
            'created_at' => $this->created_at?->toISOString() ?? (string) $this->created_at,

            'user' => new UserResource($this->whenLoaded('user', fn () => $this->user, $this->whenLoaded('sender'))),
            'sender' => new UserResource($this->whenLoaded('sender', fn () => $this->sender, $this->whenLoaded('user'))),
            'recipient' => new UserResource($this->whenLoaded('recipient')),
            'media' => $mediaData,
        ];
    }
}
