import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Bell,
    CheckCheck,
    Inbox,
    Filter,
    Palette,
    Sparkles,
    ShieldAlert,
    RefreshCw,
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { NotificationCard } from '@/components/NotificationCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import type { AppNotification } from '@/types';

type NotificationTab = 'all' | 'unread' | 'commissions' | 'applications' | 'system';

export const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<NotificationTab>('all');

    const fetchNotifications = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await notificationService.list();
            setNotifications(res.data || []);
        } catch {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkRead = async (id: string | number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, read_at: new Date().toISOString(), is_read: true } : n
                )
            );
        } catch {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString(), is_read: true }))
            );
            toast.success('All notifications marked as read');
        } catch {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (id: string | number) => {
        try {
            await notificationService.delete(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            toast.success('Notification deleted');
        } catch {
            toast.error('Failed to delete notification');
        }
    };

    const handleActionClick = (url: string) => {
        if (url.startsWith('http')) {
            window.open(url, '_blank');
        } else {
            navigate(url);
        }
    };

    // Filter counts
    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read_at && !n.is_read).length,
        [notifications]
    );

    const filteredNotifications = useMemo(() => {
        return notifications.filter((n) => {
            const isUnread = !n.read_at && !n.is_read;
            const type = n.type.toLowerCase();

            switch (activeTab) {
                case 'unread':
                    return isUnread;
                case 'commissions':
                    return type.includes('commission') || type.includes('order') || type.includes('payment');
                case 'applications':
                    return type.includes('artist_application') || type.includes('verified');
                case 'system':
                    return !type.includes('commission') && !type.includes('artist_application') && !type.includes('social');
                case 'all':
                default:
                    return true;
            }
        });
    }, [notifications, activeTab]);

    const tabs: { id: NotificationTab; label: string; icon: React.ElementType; badge?: number }[] = [
        { id: 'all', label: 'All', icon: Inbox, badge: notifications.length },
        { id: 'unread', label: 'Unread', icon: Bell, badge: unreadCount },
        { id: 'commissions', label: 'Commissions', icon: Palette },
        { id: 'applications', label: 'Applications', icon: Sparkles },
        { id: 'system', label: 'System', icon: ShieldAlert },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
                                Notifications
                                {unreadCount > 0 && (
                                    <Badge variant="default" className="text-xs px-2 py-0.5 rounded-full font-mono">
                                        {unreadCount} new
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Stay up-to-date with your commission requests, milestones, and artist alerts.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNotifications(true)}
                        disabled={refreshing || loading}
                        className="rounded-xl text-xs gap-1.5"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    {unreadCount > 0 && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="rounded-xl text-xs font-semibold gap-1.5 bg-secondary hover:bg-secondary/80 text-foreground"
                        >
                            <CheckCheck className="h-3.5 w-3.5 text-primary" />
                            Mark All Read
                        </Button>
                    )}
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                                isActive
                                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{tab.label}</span>
                            {typeof tab.badge === 'number' && tab.badge > 0 && (
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                        isActive
                                            ? 'bg-primary-foreground/20 text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Notification List */}
            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                    ))
                ) : filteredNotifications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-12 text-center rounded-3xl bg-muted/20 border border-border/60 space-y-3.5"
                    >
                        <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground/40">
                            <Inbox className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-foreground">
                                {activeTab === 'unread'
                                    ? "You're all caught up!"
                                    : 'No notifications in this category'}
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                {activeTab === 'unread'
                                    ? 'There are no unread notifications right now. Check back later for order updates.'
                                    : 'When you receive order updates, messages, or platform notifications, they will appear here.'}
                            </p>
                        </div>
                        {activeTab !== 'all' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setActiveTab('all')}
                                className="rounded-xl text-xs gap-1.5 mt-2"
                            >
                                <Filter className="h-3.5 w-3.5" /> View All Notifications
                            </Button>
                        )}
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredNotifications.map((n) => (
                            <NotificationCard
                                key={n.id}
                                notification={n}
                                onMarkAsRead={handleMarkRead}
                                onDelete={handleDelete}
                                onActionClick={handleActionClick}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
