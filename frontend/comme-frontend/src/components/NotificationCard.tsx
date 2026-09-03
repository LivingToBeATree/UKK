import React from 'react';
import { motion } from 'motion/react';
import {
    Palette,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    Heart,
    Bell,
    ExternalLink,
    Clock,
    Trash2,
    Sparkles,
    ShieldCheck,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types';

interface NotificationCardProps {
    notification: AppNotification;
    onMarkAsRead?: (id: string | number) => void;
    onDelete?: (id: string | number) => void;
    onActionClick?: (url: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
    onMarkAsRead,
    onDelete,
    onActionClick,
}) => {
    const isUnread = !notification.read_at && !notification.is_read;

    const title = notification.title || notification.data?.title;
    const message = notification.message || notification.data?.message || '';

    // Determine target URL if not provided directly
    const resolveActionUrl = (): string | undefined => {
        if (notification.data?.action_url) return notification.data.action_url;
        if (notification.notifiable_type?.includes('Commission')) {
            return `/commissions/${notification.notifiable_id}`;
        }
        if (notification.notifiable_type?.includes('ArtistApplication')) {
            return `/apply-artist/status`;
        }
        if (notification.notifiable_type?.includes('ArtistProfile')) {
            return `/dashboard`;
        }
        if (notification.notifiable_type?.includes('Post')) {
            return `/posts/${notification.notifiable_id}`;
        }
        return undefined;
    };

    const actionUrl = resolveActionUrl();

    const getNotificationMeta = (type: string) => {
        const lower = type.toLowerCase();
        if (lower.includes('artist_application_approved') || lower.includes('verified')) {
            return {
                icon: ShieldCheck,
                badgeVariant: 'default' as const,
                badgeText: 'Artist Verified',
                iconColor: 'text-primary',
                bgColor: 'bg-primary/10',
            };
        }
        if (lower.includes('artist_application')) {
            return {
                icon: Sparkles,
                badgeVariant: 'secondary' as const,
                badgeText: 'Application',
                iconColor: 'text-primary',
                bgColor: 'bg-primary/10',
            };
        }
        if (lower.includes('commission')) {
            return {
                icon: Palette,
                badgeVariant: 'secondary' as const,
                badgeText: 'Commission',
                iconColor: 'text-primary',
                bgColor: 'bg-primary/10',
            };
        }
        if (lower.includes('payment') && !lower.includes('fail')) {
            return {
                icon: CheckCircle2,
                badgeVariant: 'secondary' as const,
                badgeText: 'Payment',
                iconColor: 'text-primary',
                bgColor: 'bg-primary/10',
            };
        }
        if (lower.includes('fail') || lower.includes('alert') || lower.includes('cancel') || lower.includes('reject')) {
            return {
                icon: AlertCircle,
                badgeVariant: 'rose' as const,
                badgeText: 'Alert',
                iconColor: 'text-destructive',
                bgColor: 'bg-destructive/10',
            };
        }
        if (lower.includes('message') || lower.includes('chat')) {
            return {
                icon: MessageSquare,
                badgeVariant: 'secondary' as const,
                badgeText: 'Message',
                iconColor: 'text-foreground',
                bgColor: 'bg-muted',
            };
        }
        if (lower.includes('like') || lower.includes('comment') || lower.includes('follow')) {
            return {
                icon: Heart,
                badgeVariant: 'secondary' as const,
                badgeText: 'Social',
                iconColor: 'text-primary',
                bgColor: 'bg-primary/10',
            };
        }
        return {
            icon: Bell,
            badgeVariant: 'secondary' as const,
            badgeText: 'System',
            iconColor: 'text-muted-foreground',
            bgColor: 'bg-muted',
        };
    };

    const meta = getNotificationMeta(notification.type);
    const Icon = meta.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className={cn(
                    'transition-all hover:border-primary/40 relative overflow-hidden rounded-2xl group shadow-xs',
                    isUnread
                        ? 'bg-secondary/40 border-primary/30 shadow-primary/5'
                        : 'bg-card border-border/80 opacity-90 hover:opacity-100'
                )}
            >
                {/* Unread Accent Bar */}
                {isUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}

                <CardContent className="p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4">
                    {/* Actor Avatar or Notification Icon */}
                    {notification.actor ? (
                        <div className="relative shrink-0">
                            <Avatar
                                size="md"
                                fallback={notification.actor.display_name || notification.actor.username || '?'}
                                src={notification.actor.avatar_url}
                            />
                            <div
                                className={cn(
                                    'absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-card flex items-center justify-center',
                                    meta.bgColor
                                )}
                            >
                                <Icon className={cn('h-3 w-3', meta.iconColor)} />
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'p-2.5 rounded-2xl shrink-0 flex items-center justify-center border border-border/40',
                                meta.bgColor
                            )}
                        >
                            <Icon className={cn('h-5 w-5', meta.iconColor)} />
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 min-w-0">
                                <Badge variant={meta.badgeVariant} className="text-[10px] py-0.5 px-2 font-mono">
                                    {meta.badgeText}
                                </Badge>
                                {title && (
                                    <h4 className="font-bold text-sm truncate text-foreground">
                                        {title}
                                    </h4>
                                )}
                            </div>

                            {/* Timestamp */}
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0 font-mono">
                                <Clock className="h-3 w-3" />
                                {new Date(notification.created_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {message}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                            <div className="flex items-center gap-2">
                                {actionUrl && (
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={() => onActionClick?.(actionUrl)}
                                        className="rounded-lg text-xs font-semibold hover:border-primary/50"
                                    >
                                        View Details <ExternalLink className="h-3 w-3 ml-1 text-primary" />
                                    </Button>
                                )}

                                {isUnread && onMarkAsRead && (
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => onMarkAsRead(notification.id)}
                                        className="text-[11px] text-muted-foreground hover:text-foreground rounded-lg"
                                    >
                                        Mark as read
                                    </Button>
                                )}
                            </div>

                            {onDelete && (
                                <button
                                    onClick={() => onDelete(notification.id)}
                                    title="Delete notification"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
