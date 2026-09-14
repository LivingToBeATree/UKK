<?php

namespace App\Enum;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case FAILED = 'failed';
    case EXPIRED = 'expired';
    case CANCELLED = 'canceled';
    case REFUNDED = 'refunded';
    case PENDING_MANUAL_REFUND = 'pending_manual_refund';
    case REFUND_FAILED = 'refund_failed';
}
