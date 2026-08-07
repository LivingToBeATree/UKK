<?php

namespace App\Enum;

enum MessageType: string
{
    case USER = 'user';
    case SYSTEM = 'system';
}
