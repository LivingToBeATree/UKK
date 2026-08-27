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
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types';

interface NotificationCardProps {
    notification: AppNotification;
    onMarkAsRead?: (id: string | number) => void;
    onActionClick?: (url: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
    onMarkAsRead,
    onActionClick,
}) => {
    const isUnread = !notification.read_at;

    const getNotificationMeta = (type: string) => {
        const lower = type.toLowerCase();
        if (lower.includes('commission')) {
            return {
                icon: Palette,
                badgeVariant: 'purple' as const,
                badgeText: 'Commission',
                iconColor: 'text-purple-400',
                bgColor: 'bg-purple-600/10',
            };
        }
        if (lower.includes('payment') && !lower.includes('fail')) {
            return {
                icon: CheckCircle2,
                badgeVariant: 'teal' as const,
                badgeText: 'Payment',
                iconColor: 'text-emerald-400',
                bgColor: 'bg-emerald-600/10',
            };
        }
        if (lower.includes('fail') || lower.includes('alert') || lower.includes('cancel')) {
            return {
                icon: AlertCircle,
                badgeVariant: 'rose' as const,
                badgeText: 'Alert',
                iconColor: 'text-rose-400',
                bgColor: 'bg-rose-600/10',
            };
        }
        if (lower.includes('message') || lower.includes('chat')) {
            return {
                icon: MessageSquare,
                badgeVariant: 'secondary' as const,
                badgeText: 'Message',
                iconColor: 'text-blue-400',
                bgColor: 'bg-blue-600/10',
            };
        }
        if (lower.includes('like') || lower.includes('comment') || lower.includes('follow')) {
            return {
                icon: Heart,
                badgeVariant: 'gold' as const,
                badgeText: 'Social',
                iconColor: 'text-amber-400',
                bgColor: 'bg-amber-600/10',
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className={cn(
                    'transition-all hover:border-purple-500/40 relative overflow-hidden',
                    isUnread
                        ? 'bg-purple-950/10 border-purple-500/30'
                        : 'bg-card border-border/80 opacity-90 hover:opacity-100'
                )}
            >
                {/* Unread Accent Bar */}
                {isUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-emerald-400" />
                )}

                <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                    {/* Notification Icon */}
                    <div
                        className={cn(
                            'p-2.5 rounded-xl shrink-0 flex items-center justify-center border border-border/40',
                            meta.bgColor
                        )}
                    >
                        <Icon className={cn('h-5 w-5', meta.iconColor)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Badge variant={meta.badgeVariant} className="text-[10px] py-0.5 px-2">
                                    {meta.badgeText}
                                </Badge>
                                {notification.data.title && (
                                    <h4 className="font-bold text-sm truncate text-foreground">
                                        {notification.data.title}
                                    </h4>
                                )}
                            </div>

                            {/* Timestamp */}
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
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
                            {notification.data.message}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                            {notification.data.action_url && (
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => onActionClick?.(notification.data.action_url!)}
                                >
                                    View Details <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                            )}

                            {isUnread && onMarkAsRead && (
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="text-[11px] text-muted-foreground hover:text-foreground"
                                >
                                    Mark as read
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
