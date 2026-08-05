<?php

namespace App\Enums;

enum CommissionStatus: string
{
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case IN_PROGRESS = 'in_progress';
    case WAITING_FOR_CLIENT = 'waiting_for_client';
    case REVISION = 'revision';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case DECLINED = 'declined';
}