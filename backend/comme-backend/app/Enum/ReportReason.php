<?php

namespace App\Enum;

enum ReportReason: string
{
    case SPAM = 'spam';
    case HARASSMENT = 'harassment';
    case HATE_SPEECH = 'hate_speech';
    case COPYRIGHT = 'copyright';
    case IMPERSONATION = 'impersonation';
    case SCAM = 'scam';
    case APPEAL = 'appeal';
    case INQUIRY = 'inquiry';
    case OTHER = 'other';
}