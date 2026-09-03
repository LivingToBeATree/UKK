<?php

namespace App\Enum;

enum ModerationActionType: string
{
    case WARNING = 'warning';
    case REMOVE_CONTENT = 'remove_content';
    case RESTORE_CONTENT = 'restore_content';
    case SUSPEND_USER = 'suspend_user';
    case UNSUSPEND_USER = 'unsuspend_user';
    case ROLE_CHANGED = 'role_changed';
}