import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { NotificationCard } from '@/components/NotificationCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { AppNotification } from '@/types';

export const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await notificationService.list();
                setNotifications(res.data);
            } catch {
                toast.error('Failed to load notifications');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleMarkRead = async (id: string | number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
            );
        } catch {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
            );
            toast.success('All notifications marked as read');
        } catch {
            toast.error('Failed');
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6" /> Notifications
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {notifications.filter((n) => !n.read_at).length} unread
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                    <CheckCheck className="h-4 w-4 mr-2" /> Mark All Read
                </Button>
            </div>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20">
                        <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">No notifications yet</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {notifications.map((n) => (
                            <NotificationCard
                                key={n.id}
                                notification={n}
                                onMarkAsRead={handleMarkRead}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
