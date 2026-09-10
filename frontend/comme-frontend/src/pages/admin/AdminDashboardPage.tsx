import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    LayoutDashboard,
    Users,
    Flag,
    MessageSquare,
    FileCheck,
    ArrowRight,
    RefreshCw,
    DollarSign,
    Activity,
    ExternalLink,
    HardDrive,
    Database,
    Zap,
    Terminal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { adminApi, type AdminStats, type HealthTelemetry } from '@/services/adminService';
import { formatCurrencySafe, formatDateSafe } from '@/utils/format';
import { toast } from '@/components/ui/sonner';

export const AdminDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [health, setHealth] = useState<HealthTelemetry | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Moderators don't have access to the admin dashboard — redirect to applications
    if (user?.role === 'moderator') {
        return <Navigate to="/admin/applications" replace />;
    }

    const fetchStats = async () => {
        try {
            const [statsRes, healthRes] = await Promise.allSettled([
                adminApi.getStats(),
                adminApi.getHealth(),
            ]);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
            if (healthRes.status === 'fulfilled') setHealth(healthRes.value.data);
        } catch {
            toast.error('Failed to load platform statistics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (location.hash === '#observability') {
            const el = document.getElementById('observability');
            if (el) {
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 120);
            }
        }
    }, [location.hash, loading]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2.5">
                        <LayoutDashboard className="h-6 w-6 text-primary" /> Platform Overview
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Real-time system metrics, staff queues, and operations overview
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="rounded-xl gap-2 font-medium"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
                    Refresh Metrics
                </Button>
            </div>

            {/* Top Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <Link to="/admin/users" className="group">
                    <Card className="border border-border/80 bg-card hover:border-blue-500/40 transition-all shadow-xs h-full">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wide">
                                    Total Users
                                </p>
                                {loading ? (
                                    <Skeleton className="h-8 w-16" />
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-extrabold text-foreground">{stats?.total_users ?? 0}</p>
                                        <span className="text-[11px] text-muted-foreground">
                                            ({stats?.total_artists ?? 0} artists)
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Pending Applications */}
                <Link to="/admin/applications" className="group">
                    <Card className="border border-border/80 bg-card hover:border-amber-500/40 transition-all shadow-xs h-full">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wide">
                                    Artist Applications
                                </p>
                                {loading ? (
                                    <Skeleton className="h-8 w-16" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="text-3xl font-extrabold text-foreground">
                                            {stats?.pending_applications_count ?? 0}
                                        </p>
                                        {(stats?.pending_applications_count ?? 0) > 0 && (
                                            <Badge variant="gold" className="text-[10px] animate-pulse">
                                                Requires Review
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileCheck className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Open Reports */}
                <Link to="/admin/reports" className="group">
                    <Card className="border border-border/80 bg-card hover:border-rose-500/40 transition-all shadow-xs h-full">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wide">
                                    Open Reports
                                </p>
                                {loading ? (
                                    <Skeleton className="h-8 w-16" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="text-3xl font-extrabold text-foreground">
                                            {stats?.open_reports_count ?? 0}
                                        </p>
                                        {(stats?.open_reports_count ?? 0) > 0 && (
                                            <Badge variant="rose" className="text-[10px] animate-pulse">
                                                Active Queue
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Flag className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Active Tickets */}
                <Link to="/admin/tickets" className="group">
                    <Card className="border border-border/80 bg-card hover:border-purple-500/40 transition-all shadow-xs h-full">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wide">
                                    Active Tickets
                                </p>
                                {loading ? (
                                    <Skeleton className="h-8 w-16" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="text-3xl font-extrabold text-foreground">
                                            {stats?.active_tickets_count ?? 0}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Financials & Platform Commerce Banner */}
            <Card className="border border-border/80 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-md rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                                    <DollarSign className="h-4 w-4" />
                                </div>
                                <h3 className="font-bold text-base text-foreground">Settled Platform Volume</h3>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-md">
                                Cumulative GMV secured and processed through Midtrans escrow with automated creator ledger settlement.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 shrink-0">
                            <div>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase font-mono">Gross Volume</p>
                                {loading ? (
                                    <Skeleton className="h-7 w-28 mt-1" />
                                ) : (
                                    <p className="text-xl sm:text-2xl font-black text-emerald-400">
                                        {formatCurrencySafe(stats?.total_volume_idr ?? 0)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase font-mono">Total Orders</p>
                                {loading ? (
                                    <Skeleton className="h-7 w-16 mt-1" />
                                ) : (
                                    <p className="text-xl sm:text-2xl font-extrabold text-foreground">
                                        {stats?.total_commissions_count ?? 0}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase font-mono">Completed</p>
                                {loading ? (
                                    <Skeleton className="h-7 w-16 mt-1" />
                                ) : (
                                    <p className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                                        {stats?.completed_commissions_count ?? 0}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Observability & System Telemetry Widget */}
            <Card id="observability" className="border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl shadow-xs overflow-hidden scroll-mt-20">
                <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                System Health & Real-Time Observability
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {health?.status === 'healthy' ? 'Operational' : 'Online'}
                                </span>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Live APM diagnostics, query latency metrics, and backend log streaming
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(health?.links?.pulse || 'http://localhost:8000/pulse', '_blank')}
                            className="rounded-xl text-xs gap-1.5 h-9 font-semibold border-border hover:border-primary/50 cursor-pointer"
                        >
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            Laravel Pulse
                            <ExternalLink className="h-3 w-3 opacity-60" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(health?.links?.log_viewer || 'http://localhost:8000/log-viewer', '_blank')}
                            className="rounded-xl text-xs gap-1.5 h-9 font-semibold border-border hover:border-primary/50 cursor-pointer"
                        >
                            <Terminal className="h-3.5 w-3.5 text-blue-400" />
                            Log Viewer
                            <ExternalLink className="h-3 w-3 opacity-60" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5 pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                                <span>Database</span>
                                <Database className="h-3.5 w-3.5 text-blue-400" />
                            </div>
                            <div className="mt-1 flex items-baseline gap-2">
                                <p className="text-lg font-bold text-foreground">
                                    {health ? `${health.database.latency_ms} ms` : '...'}
                                </p>
                                <span className="text-[10px] text-emerald-400 font-semibold">
                                    {health?.database.driver ?? 'PostgreSQL'}
                                </span>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                                <span>Cache Store</span>
                                <Zap className="h-3.5 w-3.5 text-amber-400" />
                            </div>
                            <div className="mt-1 flex items-baseline gap-2">
                                <p className="text-lg font-bold text-foreground">
                                    {health ? `${health.cache.latency_ms} ms` : '...'}
                                </p>
                                <span className="text-[10px] text-emerald-400 font-semibold">
                                    {health?.cache.driver ?? 'Database'}
                                </span>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                                <span>Disk Storage</span>
                                <HardDrive className="h-3.5 w-3.5 text-indigo-400" />
                            </div>
                            <div className="mt-1 flex items-baseline gap-2">
                                <p className="text-lg font-bold text-foreground">
                                    {health?.storage.free_space_mb ? `${Math.round(health.storage.free_space_mb / 1024)} GB` : 'Available'}
                                </p>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    Free
                                </span>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                                <span>Queue Worker</span>
                                <Activity className="h-3.5 w-3.5 text-purple-400" />
                            </div>
                            <div className="mt-1 flex items-baseline gap-2">
                                <p className="text-lg font-bold text-foreground">
                                    {health?.queue ? `${health.queue.pending_jobs} jobs` : '0 jobs'}
                                </p>
                                <span className="text-[10px] text-purple-400 font-semibold">
                                    {health?.queue.driver ?? 'Database'}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Queues & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Applications Queue */}
                <Card className="border border-border/80 bg-card rounded-2xl shadow-xs flex flex-col">
                    <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                            <FileCheck className="h-4 w-4 text-amber-400" /> Recent Applications
                        </CardTitle>
                        <Link to="/admin/applications" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                            View all <ArrowRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 space-y-3">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
                        ) : !stats?.recent_applications || stats.recent_applications.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                No applications yet.
                            </div>
                        ) : (
                            stats.recent_applications.map((app) => (
                                <Link
                                    key={app.id}
                                    to="/admin/applications"
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 border border-transparent hover:border-border/60 transition-all text-xs"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Avatar size="sm" fallback={app.user.display_name || app.user.username} src={app.user.avatar_url || undefined} />
                                        <div className="min-w-0">
                                            <p className="font-bold text-foreground truncate">{app.user.display_name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">@{app.user.username}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={app.status === 'pending' ? 'gold' : app.status === 'approved' ? 'teal' : 'rose'}
                                        className="text-[10px] uppercase font-mono shrink-0"
                                    >
                                        {app.status}
                                    </Badge>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Recent Reports Queue */}
                <Card className="border border-border/80 bg-card rounded-2xl shadow-xs flex flex-col">
                    <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                            <Flag className="h-4 w-4 text-rose-400" /> Moderation Reports
                        </CardTitle>
                        <Link to="/admin/reports" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                            Workbench <ArrowRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 space-y-3">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
                        ) : !stats?.recent_reports || stats.recent_reports.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                No open reports in queue.
                            </div>
                        ) : (
                            stats.recent_reports.map((rep) => (
                                <Link
                                    key={rep.id}
                                    to="/admin/reports"
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 border border-transparent hover:border-border/60 transition-all text-xs"
                                >
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="font-bold text-foreground capitalize truncate">
                                            {rep.reason.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {rep.reportable_type} • by @{rep.reporter.username}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={rep.status === 'resolved' ? 'teal' : rep.status === 'rejected' ? 'secondary' : 'rose'}
                                        className="text-[10px] uppercase font-mono shrink-0"
                                    >
                                        {rep.status}
                                    </Badge>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Recent Support Tickets */}
                <Card className="border border-border/80 bg-card rounded-2xl shadow-xs flex flex-col">
                    <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                            <MessageSquare className="h-4 w-4 text-purple-400" /> Support Tickets
                        </CardTitle>
                        <Link to="/admin/tickets" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                            Tickets <ArrowRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 space-y-3">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
                        ) : !stats?.recent_tickets || stats.recent_tickets.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                No active support tickets.
                            </div>
                        ) : (
                            stats.recent_tickets.map((tick) => (
                                <Link
                                    key={tick.id}
                                    to={`/admin/tickets/${tick.id}`}
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 border border-transparent hover:border-border/60 transition-all text-xs"
                                >
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="font-bold text-foreground truncate">
                                            Ticket #{tick.id}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Priority: {tick.priority} • {formatDateSafe(tick.created_at)}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={tick.status === 'closed' ? 'secondary' : 'purple'}
                                        className="text-[10px] uppercase font-mono shrink-0"
                                    >
                                        {tick.status}
                                    </Badge>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
};
