<?php

namespace App\Enum;

enum PostVisibilityType: string
{
    case PUBLIC = 'public';
    case PRIVATE = 'private';
    case FOLLOWERS = 'followers';
}