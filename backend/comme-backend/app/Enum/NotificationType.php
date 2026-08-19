<?php

namespace App\Enum;

enum NotificationType: string
{
    case FOLLOW = 'follow';
    case POST_LIKE = 'post_like';
    case POST_COMMENT = 'post_comment';
    case POST_BOOKMARK = 'post_bookmark';
    case COMMISSION_REQUEST = 'commission_request';
    case COMMISSION_ACCEPTED = 'commission_accepted';
    case COMMISSION_COMPLETED = 'commission_completed';
    case COMMISSION_MESSAGE = 'commission_message';
    case REVISION_REQUEST = 'revision_request';
    case REVISION_ACCEPTED = 'revision_accepted';
    case REVIEW_RECEIVED = 'review_received';
    case PAYMENT_RECEIVED = 'payment_received';
    case ARTIST_APPLICATION_SUBMITTED = 'artist_application_submitted';
    case ARTIST_APPLICATION_APPROVED = 'artist_application_approved';
    case ARTIST_APPLICATION_REJECTED = 'artist_application_rejected';
    case SYSTEM = 'system';
}
