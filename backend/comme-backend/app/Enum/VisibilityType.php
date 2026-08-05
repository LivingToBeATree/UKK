<?php

namespace App\Enums;

enum VisibilityType: string
{
    case PUBLIC = 'public';
    case PRIVATE = 'private';
    // visible to those who met the criteria set by the artist
    case RESTRICTED  = 'restricted';
    // visible to those who are enlisted by the artist
    case ENLISTED = 'enlisted';
}