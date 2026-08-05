<?php

namespace App\Enums;

enum PostVisibilityType: string
{
    case PUBLIC = 'public';
    case PRIVATE = 'private';
    case FOLLOWERS = 'followers';
}