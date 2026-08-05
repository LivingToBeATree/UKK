<?php

namespace App\Enums;

enum MessageType: string
{
    case USER = 'user';
    case SYSTEM = 'system';
}
