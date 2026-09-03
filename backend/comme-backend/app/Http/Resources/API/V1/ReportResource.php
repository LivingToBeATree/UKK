<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Requests\API\V1\Report\StoreReportRequest;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            // Reversed lookup through the same whitelist used on input —
            // one source of truth for the friendly-name mapping, instead
            // of maintaining it twice and risking the two drifting apart.
            'reportable_type' => array_search(
                $this->reportable_type,
                StoreReportRequest::REPORTABLE_TYPES,
            ) ?: $this->reportable_type,
            'reportable_id' => $this->reportable_id,
            'reason' => $this->reason?->value,
            'description' => $this->description,
            'status' => $this->status?->value,
            'handled_at' => $this->handled_at,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'reporter' => new UserResource($this->whenLoaded('reporter')),
            'handled_by' => new UserResource($this->whenLoaded('handledBy')),
            'reportable' => $this->whenLoaded('reportable'),
            'ticket' => new TicketResource($this->whenLoaded('ticket')),
        ];
    }
}
