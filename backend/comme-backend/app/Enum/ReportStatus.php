<?php

namespace App\Enum;

enum ReportStatus: string
{
    case PENDING = 'pending';
    case UNDER_REVIEW = 'under_review';
    case INVESTIGATING = 'investigating';
    case RESOLVED = 'resolved';
    case REJECTED = 'rejected';
    case DISMISSED = 'dismissed';
}