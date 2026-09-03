import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Shield,
    FileText,
    RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi, type ModerationLogItem } from '@/services/adminService';
import { formatDateSafe } from '@/utils/format';
import { toast } from '@/components/ui/sonner';

export const ModerationLogPage: React.FC = () => {
    const [logs, setLogs] = useState<ModerationLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLogs = async () => {
        try {
            const res = await adminApi.getModerationLogs();
            setLogs(res.data);
        } catch {
            toast.error('Failed to load moderation logs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchLogs();
    };

    const getActionBadge = (type: string) => {
        switch (type) {
            case 'role_changed':
                return <Badge variant="purple" className="text-[10px] font-mono uppercase">Role Changed</Badge>;
            case 'warning':
                return <Badge variant="gold" className="text-[10px] font-mono uppercase">Warning Issued</Badge>;
            case 'remove_content':
                return <Badge variant="rose" className="text-[10px] font-mono uppercase">Content Removed</Badge>;
            case 'suspend_user':
                return <Badge variant="rose" className="text-[10px] font-mono uppercase">User Suspended</Badge>;
            case 'restore_content':
                return <Badge variant="teal" className="text-[10px] font-mono uppercase">Content Restored</Badge>;
            default:
                return <Badge variant="secondary" className="text-[10px] font-mono uppercase">{type}</Badge>;
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2.5">
                        <Shield className="h-6 w-6 text-primary" /> Moderation &amp; Audit Log
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Immutable record of all administrator and moderator actions across the platform
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="rounded-xl gap-2 font-medium"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-primary' : ''}`} /> Refresh
                </Button>
            </div>

            {/* Audit Log Card */}
            <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
                <CardHeader className="p-5 border-b border-border/60">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                        <FileText className="h-4 w-4 text-primary" /> System Action Records
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Tracks role promotions, ticket interventions, reports resolution, and warning actions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <Shield className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-sm font-bold text-foreground">No moderation actions recorded</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Staff actions (such as role modifications, content resolutions, and warnings) will appear here in chronological order.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/60">
                            {logs.map((log) => (
                                <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {getActionBadge(log.type)}
                                            {log.ticket && (
                                                <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                                                    Ticket #{log.ticket.id}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-foreground font-medium">
                                            {log.notes || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {log.actor && (
                                            <div className="flex items-center gap-2 text-right">
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-foreground">{log.actor.display_name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono">@{log.actor.username}</p>
                                                </div>
                                                <Avatar size="sm" fallback={log.actor.display_name || log.actor.username} src={log.actor.avatar_url || undefined} />
                                            </div>
                                        )}
                                        <span className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                                            {formatDateSafe(log.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};
