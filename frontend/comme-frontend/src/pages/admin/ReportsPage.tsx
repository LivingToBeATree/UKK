import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Flag,
    CheckCircle2,
    Clock,
    AlertTriangle,
    MessageSquare,
    Send,
    Search,
    RefreshCw,
    AlertCircle,
    ChevronRight,
    Ban,
    FileWarning,
    Copyright,
    UserX,
    UserCheck,
    DollarSign,
    HelpCircle,
    ExternalLink,
    ShieldAlert,
    Trash2,
    RotateCcw,
    X,
    Lock,
} from 'lucide-react';
import { reportService } from '@/services/reportService';
import { ticketService } from '@/services/ticketService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { formatDateTimeSafe } from '@/utils/format';
import { toast } from '@/components/ui/sonner';
import type { Report, Ticket, TicketPriority, ReportStatus } from '@/types';

export const ReportsPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [ticketDetail, setTicketDetail] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    // Filters & Search
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Message composer
    const [staffMessage, setStaffMessage] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Moderation Action Modal
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'warning' | 'remove_content' | 'restore_content' | 'suspend_user' | 'unsuspend_user'>('remove_content');
    const [actionNotes, setActionNotes] = useState('');
    const [actionSubmitting, setActionSubmitting] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await reportService.list(1, params);
            setReports(res.data || []);

            if (res.data && res.data.length > 0) {
                const currentId = selectedReport?.id;
                const match = currentId ? res.data.find((r) => r.id === currentId) : null;
                const target = match || res.data[0];
                handleSelectReport(target);
            } else {
                setSelectedReport(null);
                setTicketDetail(null);
            }
        } catch {
            toast.error('Failed to load moderation reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    const handleSelectReport = async (report: Report) => {
        setSelectedReport(report);
        if (report.ticket?.id) {
            try {
                setDetailLoading(true);
                const ticketData = await ticketService.show(report.ticket.id);
                setTicketDetail(ticketData);
            } catch {
                setTicketDetail(null);
            } finally {
                setDetailLoading(false);
            }
        } else {
            setTicketDetail(null);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticketDetail?.messages]);

    const handleUpdateStatus = async (newStatus: ReportStatus) => {
        if (!selectedReport) return;
        const toastId = toast.loading(`Updating report #${selectedReport.id} to ${newStatus}...`);

        try {
            await reportService.update(selectedReport.id, { status: newStatus });
            toast.dismiss(toastId);
            toast.success(`Report #${selectedReport.id} marked as ${newStatus}`);

            setSelectedReport((prev) => prev ? { ...prev, status: newStatus } : null);
            setReports((prev) =>
                prev.map((r) => (r.id === selectedReport.id ? { ...r, status: newStatus } : r))
            );
        } catch {
            toast.dismiss(toastId);
            toast.error('Failed to update report status');
        }
    };

    const handleOpenActionModal = (type: 'warning' | 'remove_content' | 'restore_content' | 'suspend_user' | 'unsuspend_user') => {
        setActionType(type);
        if (type === 'remove_content') {
            setActionNotes('Confirmed policy violation. Taking down reported content from public feed.');
        } else if (type === 'warning') {
            setActionNotes('Official warning issued for violating community guidelines.');
        } else if (type === 'suspend_user') {
            setActionNotes('Account suspended due to serious or repeated community violations.');
        } else if (type === 'unsuspend_user') {
            setActionNotes('Account suspension lifted after staff review and compliance.');
        } else {
            setActionNotes('Report reviewed and content confirmed legitimate. Restored to public.');
        }
        setActionModalOpen(true);
    };

    const handleExecuteAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReport || !actionNotes.trim() || actionSubmitting) return;

        setActionSubmitting(true);
        const toastId = toast.loading('Executing staff enforcement action...');

        try {
            const res = await reportService.executeAction(selectedReport.id, {
                action_type: actionType,
                notes: actionNotes.trim(),
            });

            setActionModalOpen(false);
            if (res.report) {
                setSelectedReport(res.report);
                setReports((prev) =>
                    prev.map((r) => (r.id === res.report.id ? res.report : r))
                );
                if (res.report.ticket?.id) {
                    try {
                        const ticketData = await ticketService.show(res.report.ticket.id);
                        setTicketDetail(ticketData);
                    } catch {
                        // Ticket detail refresh fallback
                    }
                }
            }

            toast.dismiss(toastId);
            toast.success(`Moderation action '${actionType.replace('_', ' ')}' successfully executed & logged.`);
        } catch {
            toast.dismiss(toastId);
            toast.error('Failed to execute moderation action');
        } finally {
            setActionSubmitting(false);
        }
    };

    const handleUpdatePriority = async (newPriority: TicketPriority) => {
        if (!ticketDetail) return;
        try {
            await ticketService.update(ticketDetail.id, { priority: newPriority });
            setTicketDetail((prev) => prev ? { ...prev, priority: newPriority } : null);
            toast.success(`Ticket priority changed to ${newPriority}`);
        } catch {
            toast.error('Failed to update ticket priority');
        }
    };

    const handleCloseTicket = async () => {
        if (!ticketDetail) return;
        try {
            await ticketService.close(ticketDetail.id);
            setTicketDetail((prev) => prev ? { ...prev, closed_at: new Date().toISOString() } : null);
            toast.success(`Ticket #${ticketDetail.id} closed`);
        } catch {
            toast.error('Failed to close ticket');
        }
    };

    const handleSendStaffMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketDetail || !staffMessage.trim() || sendingMsg) return;

        setSendingMsg(true);
        try {
            const sent = await ticketService.sendMessage(ticketDetail.id, staffMessage.trim());
            setTicketDetail((prev) => {
                if (!prev) return prev;
                const existing = prev.messages || [];
                return {
                    ...prev,
                    messages: [...existing, sent],
                };
            });
            setStaffMessage('');
            toast.success('Reply sent to reporter');
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSendingMsg(false);
        }
    };

    const getReasonIcon = (reason: string) => {
        switch (reason) {
            case 'spam':
                return <FileWarning className="h-3.5 w-3.5 text-amber-400" />;
            case 'harassment':
                return <Ban className="h-3.5 w-3.5 text-rose-400" />;
            case 'hate_speech':
                return <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />;
            case 'copyright':
                return <Copyright className="h-3.5 w-3.5 text-indigo-400" />;
            case 'impersonation':
                return <UserX className="h-3.5 w-3.5 text-purple-400" />;
            case 'scam':
                return <DollarSign className="h-3.5 w-3.5 text-emerald-400" />;
            default:
                return <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'resolved':
                return (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Resolved
                    </Badge>
                );
            case 'investigating':
            case 'under_review':
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] uppercase font-bold">
                        <Clock className="h-3 w-3 mr-1" /> Investigating
                    </Badge>
                );
            case 'dismissed':
            case 'rejected':
                return (
                    <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-[10px] uppercase font-bold">
                        Dismissed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] uppercase font-bold">
                        <AlertCircle className="h-3 w-3 mr-1" /> Pending
                    </Badge>
                );
        }
    };

    const getTargetUrl = (type?: string, id?: number, reportable?: unknown) => {
        if (!type || !id) return null;
        const lower = type.toLowerCase();
        const rep = reportable as Record<string, unknown> | undefined;
        if (lower.includes('post_comment')) return `/posts/${rep?.post_id || ''}`;
        if (lower.includes('post')) return `/posts/${id}`;
        if (lower.includes('portfolio')) return `/portfolio/${id}`;
        if (lower.includes('commission_service') || lower.includes('service')) return `/store/${id}`;
        if (lower.includes('commission')) return `/commissions/${id}`;
        if (lower.includes('user')) {
            const handle = (rep?.username as string) || id;
            return `/users/${handle}`;
        }
        return `/users/${id}`;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
                        <Flag className="h-6 w-6 text-rose-400" /> Moderation &amp; Reports Workbench
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Review user-submitted violations, inspect reported content, take enforcement actions, and communicate via support tickets.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchReports}
                    disabled={loading}
                    className="rounded-xl text-xs font-bold gap-2 shrink-0 self-start sm:self-auto"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Queue
                </Button>
            </div>

            {/* Filter Bar & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                        { id: 'all', label: 'All Reports' },
                        { id: 'pending', label: 'Pending' },
                        { id: 'investigating', label: 'Investigating' },
                        { id: 'resolved', label: 'Resolved' },
                        { id: 'dismissed', label: 'Dismissed' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStatusFilter(tab.id)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                                statusFilter === tab.id
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        fetchReports();
                    }}
                    className="flex items-center gap-2"
                >
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search description or reporter..."
                            className="h-9 pl-9 text-xs rounded-xl bg-secondary/30 border-border/80"
                        />
                    </div>
                    <Button type="submit" size="sm" variant="secondary" className="rounded-xl text-xs font-bold h-9">
                        Search
                    </Button>
                </form>
            </div>

            {/* Main Moderation Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── Left Pane: Reports Queue ── */}
                <div className="lg:col-span-5 space-y-3">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="rounded-3xl border-border/80 bg-card/60 p-4 space-y-2">
                                <Skeleton className="h-4 w-28 rounded-lg" />
                                <Skeleton className="h-4 w-full rounded-lg" />
                                <Skeleton className="h-3 w-36 rounded-lg" />
                            </Card>
                        ))
                    ) : reports.length === 0 ? (
                        <Card className="rounded-3xl border-border/80 bg-card/60 p-8 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Moderation Queue Clear</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    No reports found matching your current filter.
                                </p>
                            </div>
                        </Card>
                    ) : (
                        reports.map((report) => {
                            const isSelected = selectedReport?.id === report.id;
                            return (
                                <Card
                                    key={report.id}
                                    onClick={() => handleSelectReport(report)}
                                    className={`rounded-3xl border transition-all cursor-pointer overflow-hidden ${
                                        isSelected
                                            ? 'border-purple-500 bg-purple-500/10 shadow-md ring-1 ring-purple-500/30'
                                            : 'border-border/80 bg-card/60 hover:border-purple-500/40 hover:bg-secondary/30'
                                    }`}
                                >
                                    <CardContent className="p-4 space-y-2.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded-lg bg-secondary/80">
                                                    {getReasonIcon(report.reason)}
                                                </div>
                                                <span className="font-bold text-xs text-foreground capitalize">
                                                    {report.reason?.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            {getStatusBadge(report.status)}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                                                    {report.reportable_type} #{report.reportable_id}
                                                </Badge>
                                                {report.reporter && (
                                                    <span className="text-[11px] truncate">
                                                        by @{report.reporter.username}
                                                    </span>
                                                )}
                                            </div>
                                            {report.description && (
                                                <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed">
                                                    {report.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                                            <span>
                                                {formatDateTimeSafe(report.created_at)}
                                            </span>
                                            <div className="flex items-center gap-1 text-purple-400 font-bold">
                                                <span>Inspect &amp; Action</span>
                                                <ChevronRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* ── Right Pane: Detailed Inspection & Ticket Chat ── */}
                <div className="lg:col-span-7">
                    {selectedReport ? (
                        <Card className="rounded-3xl border-border/80 bg-card/60 overflow-hidden shadow-sm flex flex-col min-h-[600px]">
                            {/* Header / Report Overview */}
                            <div className="p-5 border-b border-border/60 bg-secondary/20 space-y-4">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-black text-foreground">
                                                Report #{selectedReport.id}
                                            </h2>
                                            {getStatusBadge(selectedReport.status)}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                            <span>
                                                Target: <strong className="text-foreground capitalize">{selectedReport.reportable_type} #{selectedReport.reportable_id}</strong>
                                            </span>
                                            {getTargetUrl(selectedReport.reportable_type, selectedReport.reportable_id, selectedReport.reportable) && (
                                                <a
                                                    href={getTargetUrl(selectedReport.reportable_type, selectedReport.reportable_id, selectedReport.reportable)!}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 font-bold text-[11px] border border-purple-500/30 transition-all shadow-xs cursor-pointer"
                                                >
                                                    <span>Survey Target Live</span>
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            <span>•</span>
                                            <span>
                                                Created: {formatDateTimeSafe(selectedReport.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Status State Controls */}
                                    {(() => {
                                        const isResolvedOrDismissed = selectedReport.status === 'resolved' || selectedReport.status === 'dismissed';

                                        if (isResolvedOrDismissed) {
                                            return (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary/70 border border-border/80 text-muted-foreground text-xs font-semibold">
                                                        <Lock className="h-3 w-3 text-zinc-400" />
                                                        <span className="capitalize">{selectedReport.status} &amp; Locked</span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleUpdateStatus('investigating')}
                                                        className="rounded-xl text-[11px] font-bold h-7 text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                                                        title="Re-open report investigation"
                                                    >
                                                        Reopen
                                                    </Button>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {selectedReport.status !== 'investigating' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleUpdateStatus('investigating')}
                                                        className="rounded-xl text-xs font-bold h-8 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                                                    >
                                                        <Clock className="h-3 w-3 mr-1" /> Investigating
                                                    </Button>
                                                )}
                                                {selectedReport.status !== 'resolved' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus('resolved')}
                                                        className="rounded-xl text-xs font-bold h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Resolved
                                                    </Button>
                                                )}
                                                {selectedReport.status !== 'dismissed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleUpdateStatus('dismissed')}
                                                        className="rounded-xl text-xs font-bold h-8 text-zinc-400 hover:bg-secondary cursor-pointer"
                                                    >
                                                        Dismiss
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* ── Staff Enforcement Actions Bar ── */}
                                {(() => {
                                    const isResolvedOrDismissed = selectedReport.status === 'resolved' || selectedReport.status === 'dismissed';
                                    if (isResolvedOrDismissed) {
                                        return null;
                                    }

                                    const isUserReport = selectedReport.reportable_type?.toLowerCase() === 'user';
                                    const isAppeal = selectedReport.reason?.toLowerCase() === 'appeal';
                                    const reportableObj: any = selectedReport.reportable;
                                    const isContentTakenDown = Boolean(reportableObj?.is_taken_down);
                                    const isUserSuspended = Boolean(reportableObj?.is_suspended || reportableObj?.suspended_at);
                                    const isAppealOrTakenDown = isAppeal || isContentTakenDown || isUserSuspended;

                                    return (
                                        <div className={`p-3.5 rounded-2xl border space-y-2 ${
                                            isAppealOrTakenDown
                                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                                : 'bg-rose-500/5 border-rose-500/20'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {isAppealOrTakenDown ? (
                                                        <ShieldAlert className="h-4 w-4 text-emerald-400" />
                                                    ) : (
                                                        <ShieldAlert className="h-4 w-4 text-rose-400" />
                                                    )}
                                                    <span className="text-xs font-bold text-foreground">
                                                        {isAppeal
                                                            ? `Staff Appeal Resolution (${isUserReport ? 'User Account' : 'Content'})`
                                                            : isAppealOrTakenDown
                                                            ? `Moderation Review (${isUserReport ? 'Suspended User' : 'Taken-Down Item'})`
                                                            : `Staff Enforcement Actions (${isUserReport ? 'User Account' : 'Content'})`}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {isAppeal || isAppealOrTakenDown
                                                        ? isUserReport
                                                            ? 'Account Suspended — Review to Reinstate'
                                                            : 'Content Offline — Review Appeal to Restore'
                                                        : isUserReport
                                                        ? 'Account Policy Enforcement'
                                                        : 'Automated Take-down & Notice'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {isUserReport ? (
                                                    isUserSuspended || isAppeal ? (
                                                        <>
                                                            {/* Suspended User / Appeal: Primary is Unsuspend */}
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleOpenActionModal('unsuspend_user')}
                                                                className="rounded-xl text-xs font-bold h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 cursor-pointer"
                                                            >
                                                                <UserCheck className="h-3.5 w-3.5" /> Unsuspend Account (Approve Appeal)
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleOpenActionModal('warning')}
                                                                className="rounded-xl text-xs font-bold h-8 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 gap-1.5 cursor-pointer"
                                                            >
                                                                <AlertTriangle className="h-3.5 w-3.5" /> Issue Warning
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* User Entity: Show Ban/Suspend and Warning */}
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleOpenActionModal('suspend_user')}
                                                                className="rounded-xl text-xs font-bold h-8 bg-rose-600 hover:bg-rose-700 text-white shadow-xs gap-1.5 cursor-pointer"
                                                            >
                                                                <UserX className="h-3.5 w-3.5" /> Suspend Account (Ban)
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleOpenActionModal('warning')}
                                                                className="rounded-xl text-xs font-bold h-8 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 gap-1.5 cursor-pointer"
                                                            >
                                                                <AlertTriangle className="h-3.5 w-3.5" /> Issue Official Warning
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleOpenActionModal('unsuspend_user')}
                                                                className="rounded-xl text-xs font-bold h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1.5 cursor-pointer"
                                                            >
                                                                <UserCheck className="h-3.5 w-3.5" /> Unsuspend Account
                                                            </Button>
                                                        </>
                                                    )
                                                ) : (
                                                    isAppeal || isContentTakenDown ? (
                                                        <>
                                                            {/* Appeal / Taken-Down Item: Hide "Take Down" and show "Restore Content" as Primary */}
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleOpenActionModal('restore_content')}
                                                                className="rounded-xl text-xs font-bold h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 cursor-pointer"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" /> Restore Content (Approve Appeal)
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleOpenActionModal('warning')}
                                                                className="rounded-xl text-xs font-bold h-8 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 gap-1.5 cursor-pointer"
                                                            >
                                                                <AlertTriangle className="h-3.5 w-3.5" /> Issue Warning
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleOpenActionModal('suspend_user')}
                                                                className="rounded-xl text-xs font-bold h-8 border-purple-500/40 text-purple-400 hover:bg-purple-500/10 gap-1.5 cursor-pointer"
                                                            >
                                                                <UserX className="h-3.5 w-3.5" /> Suspend Offender
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Standard Content Violation: Show Take Down, Warning, Suspend Offender, and Restore */}
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleOpenActionModal('remove_content')}
                                                                className="rounded-xl text-xs font-bold h-8 bg-rose-600 hover:bg-rose-700 text-white shadow-xs gap-1.5 cursor-pointer"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" /> Take Down Content
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleOpenActionModal('warning')}
                                                                className="rounded-xl text-xs font-bold h-8 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 gap-1.5 cursor-pointer"
                                                            >
                                                                <AlertTriangle className="h-3.5 w-3.5" /> Issue Warning
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleOpenActionModal('suspend_user')}
                                                                className="rounded-xl text-xs font-bold h-8 border-purple-500/40 text-purple-400 hover:bg-purple-500/10 gap-1.5 cursor-pointer"
                                                            >
                                                                <UserX className="h-3.5 w-3.5" /> Suspend Offender
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleOpenActionModal('restore_content')}
                                                                className="rounded-xl text-xs font-bold h-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 cursor-pointer"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" /> Restore Content
                                                            </Button>
                                                        </>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Reporter & Target Summary Box */}
                                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                                    {/* Reporter Card */}
                                    <div className="p-3 rounded-2xl bg-black/30 border border-border/60 text-xs space-y-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Submitted By
                                        </span>
                                        {selectedReport.reporter ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar
                                                    size="sm"
                                                    src={selectedReport.reporter.avatar_url}
                                                    fallback={selectedReport.reporter.display_name || selectedReport.reporter.username}
                                                />
                                                <div className="min-w-0">
                                                    <div className="font-bold text-foreground truncate">
                                                        {selectedReport.reporter.display_name || selectedReport.reporter.username}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        @{selectedReport.reporter.username}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground italic">Anonymous / User #{selectedReport.user_id}</div>
                                        )}
                                    </div>

                                    {/* Reported Entity Context */}
                                    <div className="p-3.5 rounded-2xl bg-black/30 border border-border/60 text-xs space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <span>Reported Target</span>
                                                <Badge variant="outline" className="text-[10px] capitalize font-mono border-purple-500/30 text-purple-300 bg-purple-500/10">
                                                    {selectedReport.reportable_type} #{selectedReport.reportable_id}
                                                </Badge>
                                            </span>
                                            {getTargetUrl(selectedReport.reportable_type, selectedReport.reportable_id, selectedReport.reportable) && (
                                                <a
                                                    href={getTargetUrl(selectedReport.reportable_type, selectedReport.reportable_id, selectedReport.reportable)!}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all cursor-pointer shadow-xs"
                                                >
                                                    <span>Inspect Live</span>
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="secondary" className="text-[10px] capitalize">
                                                {selectedReport.reason?.replace(/_/g, ' ')}
                                            </Badge>
                                            {getTargetUrl(selectedReport.reportable_type, selectedReport.reportable_id, selectedReport.reportable) && (
                                                <a
                                                    href={getTargetUrl(selectedReport.reportable_type, selectedReport.reportable_id, selectedReport.reportable)!}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                                                >
                                                    <span>View {selectedReport.reportable_type} page</span>
                                                    <ExternalLink className="h-2.5 w-2.5" />
                                                </a>
                                            )}
                                        </div>

                                        {selectedReport.description ? (
                                            <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2 bg-secondary/20 p-2 rounded-xl border border-border/40">
                                                "{selectedReport.description}"
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-muted-foreground italic">No extra notes provided</p>
                                        )}
                                    </div>
                                </div>

                                {/* Ticket Priority & Staff Controls */}
                                {ticketDetail && (() => {
                                    const isResolvedOrDismissed = selectedReport.status === 'resolved' || selectedReport.status === 'dismissed';
                                    const isLocked = isResolvedOrDismissed || Boolean(ticketDetail.closed_at);

                                    return (
                                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground font-semibold">Priority:</span>
                                                <div className="flex items-center gap-1">
                                                    {(['low', 'normal', 'high', 'urgent'] as TicketPriority[]).map((p) => (
                                                        <button
                                                            key={p}
                                                            type="button"
                                                            disabled={isLocked}
                                                            onClick={() => !isLocked && handleUpdatePriority(p)}
                                                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase transition-all ${
                                                                isLocked
                                                                    ? ticketDetail.priority === p
                                                                        ? 'bg-zinc-700/80 text-zinc-200 cursor-default opacity-80'
                                                                        : 'bg-secondary/30 text-muted-foreground/40 cursor-default opacity-50'
                                                                    : ticketDetail.priority === p
                                                                    ? p === 'urgent'
                                                                        ? 'bg-rose-600 text-white cursor-pointer'
                                                                        : p === 'high'
                                                                        ? 'bg-amber-600 text-white cursor-pointer'
                                                                        : 'bg-purple-600 text-white cursor-pointer'
                                                                    : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer'
                                                            }`}
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {!ticketDetail.closed_at && !isResolvedOrDismissed ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={handleCloseTicket}
                                                    className="text-xs font-bold text-muted-foreground hover:text-rose-400 h-7 px-2.5 rounded-lg cursor-pointer"
                                                >
                                                    Close Ticket
                                                </Button>
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md border border-border/50">
                                                    <Lock className="h-3 w-3 text-zinc-400" /> Ticket Closed
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Ticket Message Thread */}
                            <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[320px]">
                                {detailLoading ? (
                                    <div className="space-y-3">
                                        <Skeleton className="h-10 w-3/4 rounded-2xl" />
                                        <Skeleton className="h-10 w-1/2 ml-auto rounded-2xl" />
                                    </div>
                                ) : ticketDetail?.messages && ticketDetail.messages.length > 0 ? (
                                    ticketDetail.messages.map((msg) => {
                                        const isActionMessage = msg.content?.startsWith('🛡️ [STAFF ACTION TAKEN');
                                        const isStaffMessage = msg.user?.role === 'admin' || msg.user?.role === 'moderator' || msg.user_id === currentUser?.id;

                                        if (isActionMessage) {
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1 my-2"
                                                >
                                                    <div className="flex items-center justify-between text-[10px] text-rose-400 font-bold uppercase">
                                                        <span>Official Moderation Action</span>
                                                        <span>{formatDateTimeSafe(msg.created_at)}</span>
                                                    </div>
                                                    <p className="text-foreground font-semibold whitespace-pre-wrap">{msg.content}</p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex gap-3 max-w-[85%] ${
                                                    isStaffMessage ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                                }`}
                                            >
                                                <Avatar
                                                    size="sm"
                                                    src={msg.user?.avatar_url}
                                                    fallback={msg.user?.display_name || msg.user?.username || 'U'}
                                                />
                                                <div className="space-y-1">
                                                    <div
                                                        className={`flex items-center gap-2 text-[10px] text-muted-foreground ${
                                                            isStaffMessage ? 'justify-end' : 'justify-start'
                                                        }`}
                                                    >
                                                        <span className="font-bold text-foreground">
                                                            {msg.user?.display_name || msg.user?.username}
                                                        </span>
                                                        {isStaffMessage ? (
                                                            <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[9px]">
                                                                STAFF
                                                            </span>
                                                        ) : (
                                                            <span className="px-1.5 py-0.2 rounded-md bg-secondary text-muted-foreground font-bold text-[9px]">
                                                                REPORTER
                                                            </span>
                                                        )}
                                                        <span>
                                                            {formatDateTimeSafe(msg.created_at)}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                                                            isStaffMessage
                                                                ? 'bg-purple-600 text-white rounded-tr-xs'
                                                                : 'bg-secondary/60 text-foreground border border-border/60 rounded-tl-xs'
                                                        }`}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-10 text-center text-xs text-muted-foreground space-y-1">
                                        <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
                                        <p className="font-semibold text-foreground">No conversation messages yet</p>
                                        <p>Send a message below to contact the reporter or request further verification.</p>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Staff Message Composer */}
                            {(() => {
                                const isResolvedOrDismissed = selectedReport.status === 'resolved' || selectedReport.status === 'dismissed';
                                const isLocked = isResolvedOrDismissed || Boolean(ticketDetail?.closed_at);

                                if (isLocked) {
                                    return (
                                        <div className="p-3.5 border-t border-border/60 bg-secondary/20 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                            <Lock className="h-3.5 w-3.5 text-zinc-400" />
                                            <span>This report has been {selectedReport.status}. The ticket is archived and locked.</span>
                                        </div>
                                    );
                                }

                                if (!ticketDetail) return null;

                                return (
                                    <form
                                        onSubmit={handleSendStaffMessage}
                                        className="p-3.5 border-t border-border/60 bg-secondary/10 flex items-center gap-2"
                                    >
                                        <Input
                                            value={staffMessage}
                                            onChange={(e) => setStaffMessage(e.target.value)}
                                            placeholder="Send official moderation reply to reporter..."
                                            className="h-10 rounded-xl bg-card border-border/80 text-xs focus-visible:ring-purple-500"
                                            disabled={sendingMsg}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!staffMessage.trim() || sendingMsg}
                                            className="h-10 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md shrink-0 gap-1.5"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                            <span>Reply</span>
                                        </Button>
                                    </form>
                                );
                            })()}
                        </Card>
                    ) : (
                        <Card className="rounded-3xl border-border/80 bg-card/60 p-12 text-center text-muted-foreground text-xs">
                            Select a report from the queue on the left to inspect content and communicate with the reporter.
                        </Card>
                    )}
                </div>
            </div>

            {/* ── Action Confirmation Modal ── */}
            <AnimatePresence>
                {actionModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                                        {actionType === 'remove_content' && <Trash2 className="h-5 w-5" />}
                                        {actionType === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400" />}
                                        {actionType === 'suspend_user' && <UserX className="h-5 w-5 text-purple-400" />}
                                        {actionType === 'unsuspend_user' && <UserCheck className="h-5 w-5 text-emerald-400" />}
                                        {actionType === 'restore_content' && <RotateCcw className="h-5 w-5 text-emerald-400" />}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-foreground capitalize">
                                            Confirm {actionType.replace('_', ' ')}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Target: {selectedReport?.reportable_type} #{selectedReport?.reportable_id}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActionModalOpen(false)}
                                    className="p-2 rounded-xl hover:bg-secondary text-muted-foreground cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleExecuteAction} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground">
                                        Staff Reasoning &amp; Official Notice Notes:
                                    </label>
                                    <Textarea
                                        value={actionNotes}
                                        onChange={(e) => setActionNotes(e.target.value)}
                                        placeholder="Explain the violation reason for the audit log and user notice..."
                                        className="min-h-[100px] rounded-xl text-xs bg-secondary/30 border-border"
                                        required
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        This explanation will be logged into the audit trail, sent as an official notice to the offender, and posted to the ticket thread.
                                    </p>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setActionModalOpen(false)}
                                        className="rounded-xl text-xs font-bold"
                                        disabled={actionSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!actionNotes.trim() || actionSubmitting}
                                        className={`rounded-xl text-xs font-bold text-white shadow-md cursor-pointer ${
                                            actionType === 'remove_content'
                                                ? 'bg-rose-600 hover:bg-rose-700'
                                                : actionType === 'warning'
                                                ? 'bg-amber-600 hover:bg-amber-700'
                                                : actionType === 'suspend_user'
                                                ? 'bg-purple-600 hover:bg-purple-700'
                                                : 'bg-emerald-600 hover:bg-emerald-700'
                                        }`}
                                    >
                                        {actionSubmitting ? 'Executing...' : 'Enforce & Resolve Report'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
