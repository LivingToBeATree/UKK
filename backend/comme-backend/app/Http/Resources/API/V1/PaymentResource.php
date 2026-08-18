<?php

namespace App\Http\Resources\API\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * snap_token is included — the frontend needs it to open the Snap
     * popup. midtrans_transaction_id and raw_response are NOT exposed —
     * raw_response in particular could contain more payment-method detail
     * than the frontend has any reason to see (masked card info, etc).
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'snap_token' => $this->snap_token,
            'status' => $this->status?->value,
            'payment_type' => $this->payment_type,
            'gross_amount' => (float) $this->gross_amount,
            'paid_at' => $this->paid_at,
        ];
    }
}
