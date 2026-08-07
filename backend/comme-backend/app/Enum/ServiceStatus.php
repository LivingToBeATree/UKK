<?php

namespace App\Enum;

enum ServiceStatus: string
{
    case OPEN = 'open';
    case PAUSED = 'paused';
    case CLOSED = 'closed';
    case DRAFT = 'draft';
}