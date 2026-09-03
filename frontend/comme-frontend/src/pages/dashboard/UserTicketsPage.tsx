import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    LifeBuoy,
    Shield,
    Plus,
    MessageSquare,
    Send,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronRight,
    Flag,
    RefreshCw,
} from 'lucide-react';
import { AppealTicketModal } from '@/components/modals/AppealTicketModal';
import { ticketService } from '@/services/ticketService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { formatDateSafe, formatDateTimeSafe } from '@/utils/format';
import { toast } from '@/components/ui/sonner';
import type { Ticket } from '@/types';

export const UserTicketsPage: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const initialAppealType = (searchParams.get('type') as any) || (searchParams.get('appeal') as any) || undefined;
    const initialAppealId = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;
    const initialAppealTitle = searchParams.get('title') || undefined;
    const shouldOpenNew = searchParams.get('new') === 'true' || Boolean(initialAppealType && initialAppealId);

    const [showCreateModal, setShowCreateModal] = useState(shouldOpenNew);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved' | 'closed'>('all');

    // Message composer
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await ticketService.list(1);
            const ticketList = res.data || [];
            setTickets(ticketList);
            if (ticketList.length > 0 && !selectedTicket) {
                loadTicketDetail(ticketList[0].id);
            }
        } catch {
            toast.error('Failed to load your support tickets');
        } finally {
            setLoading(false);
        }
    };

    const loadTicketDetail = async (id: number) => {
        try {
            setDetailLoading(true);
            const data = await ticketService.show(id);
            setSelectedTicket(data);
        } catch {
            toast.error('Failed to load ticket details');
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTicket?.messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !newMessage.trim() || sending) return;

        setSending(true);
        try {
            const sent = await ticketService.sendMessage(selectedTicket.id, newMessage.trim());
            setSelectedTicket((prev) => {
                if (!prev) return prev;
                const existing = prev.messages || [];
                return {
                    ...prev,
                    messages: [...existing, sent],
                };
            });
            setNewMessage('');
            toast.success('Message sent to moderation staff');
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const getStatusBadge = (ticket: Ticket) => {
        if (ticket.closed_at) {
            return (
                <Badge variant="outline" className="text-muted-foreground border-border text-[10px] uppercase font-bold">
                    <XCircle className="h-3 w-3 mr-1" /> Closed
                </Badge>
            );
        }
        const status = ticket.report?.status || 'pending';
        switch (status) {
            case 'resolved':
                return (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Resolved
                    </Badge>
                );
            case 'investigating':
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] uppercase font-bold">
                        <Clock className="h-3 w-3 mr-1" /> Investigating
                    </Badge>
                );
            case 'dismissed':
                return (
                    <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-[10px] uppercase font-bold">
                        Dismissed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] uppercase font-bold">
                        <AlertCircle className="h-3 w-3 mr-1" /> Pending Staff
                    </Badge>
                );
        }
    };

    const filteredTickets = tickets.filter((t) => {
        if (filterStatus === 'closed') return Boolean(t.closed_at);
        if (filterStatus === 'resolved') return t.report?.status === 'resolved';
        if (filterStatus === 'open') return !t.closed_at && t.report?.status !== 'resolved';
        return true;
    });

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
                            <LifeBuoy className="h-6 w-6 text-purple-400" /> Support &amp; Moderation Tickets
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Track your submitted content reports, dispute investigations, and communicate directly with staff.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <Button
                            size="sm"
                            onClick={() => setShowCreateModal(true)}
                            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5 shadow-md cursor-pointer"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>New Ticket / Appeal</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchTickets}
                            disabled={loading}
                            className="rounded-xl text-xs font-bold gap-2 cursor-pointer"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {[
                        { id: 'all' as const, label: 'All Tickets' },
                        { id: 'open' as const, label: 'Active & Open' },
                        { id: 'resolved' as const, label: 'Resolved' },
                        { id: 'closed' as const, label: 'Closed' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilterStatus(tab.id)}
                            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                                filterStatus === tab.id
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* ── Left Pane: Tickets Queue ── */}
                    <div className="lg:col-span-5 space-y-3">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="rounded-3xl border-border/80 bg-card/60 p-4 space-y-2">
                                    <Skeleton className="h-4 w-24 rounded-lg" />
                                    <Skeleton className="h-4 w-full rounded-lg" />
                                    <Skeleton className="h-3 w-32 rounded-lg" />
                                </Card>
                            ))
                        ) : filteredTickets.length === 0 ? (
                            <Card className="rounded-3xl border-border/80 bg-card/60 p-8 text-center space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
                                    <LifeBuoy className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-foreground">No Support Tickets Found</h3>
                                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                        When you report content, appeal moderation actions, or contact support, your tickets will appear here.
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => setShowCreateModal(true)}
                                    className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5 shadow-md cursor-pointer"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Open Ticket or Appeal
                                </Button>
                            </Card>
                        ) : (
                            filteredTickets.map((ticket) => {
                                const isSelected = selectedTicket?.id === ticket.id;
                                return (
                                    <Card
                                        key={ticket.id}
                                        onClick={() => loadTicketDetail(ticket.id)}
                                        className={`rounded-3xl border transition-all cursor-pointer overflow-hidden ${
                                            isSelected
                                                ? 'border-purple-500 bg-purple-500/10 shadow-md ring-1 ring-purple-500/30'
                                                : 'border-border/80 bg-card/60 hover:border-purple-500/40 hover:bg-secondary/30'
                                        }`}
                                    >
                                        <CardContent className="p-4 space-y-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Flag className="h-3.5 w-3.5 text-rose-400" />
                                                    <span className="font-bold text-xs text-foreground">
                                                        Ticket #{ticket.id}
                                                    </span>
                                                </div>
                                                {getStatusBadge(ticket)}
                                            </div>

                                            {ticket.report && (
                                                <div>
                                                    <div className="text-xs font-semibold text-foreground line-clamp-1">
                                                        Reason: <span className="capitalize text-purple-300">{ticket.report.reason?.replace(/_/g, ' ')}</span>
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                                                        {ticket.report.description || `Reported ${ticket.report.reportable_type} #${ticket.report.reportable_id}`}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                                                <span>
                                                    {formatDateTimeSafe(ticket.created_at || (ticket.report ? ticket.report.created_at : null))}
                                                </span>
                                                <div className="flex items-center gap-1 text-purple-400 font-bold">
                                                    <span>View Thread</span>
                                                    <ChevronRight className="h-3 w-3" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>

                    {/* ── Right Pane: Ticket Detail & Message Thread ── */}
                    <div className="lg:col-span-7">
                        {detailLoading ? (
                            <Card className="rounded-3xl border-border/80 bg-card/60 p-6 space-y-4">
                                <Skeleton className="h-6 w-48 rounded-lg" />
                                <Skeleton className="h-20 w-full rounded-2xl" />
                                <Skeleton className="h-40 w-full rounded-2xl" />
                            </Card>
                        ) : selectedTicket ? (
                            <Card className="rounded-3xl border-border/80 bg-card/60 overflow-hidden shadow-sm flex flex-col min-h-[550px]">
                                {/* Ticket Header */}
                                <div className="p-5 border-b border-border/60 bg-secondary/20 space-y-3">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-base font-black text-foreground">
                                                    Ticket #{selectedTicket.id}
                                                </h2>
                                                {getStatusBadge(selectedTicket)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Opened on {formatDateSafe(selectedTicket.created_at || selectedTicket.report?.created_at)} • Priority:{' '}
                                                <span className="font-bold text-foreground capitalize">
                                                    {selectedTicket.priority}
                                                </span>
                                            </p>
                                        </div>

                                        {selectedTicket.assignee && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs">
                                                <Shield className="h-3.5 w-3.5 text-purple-400" />
                                                <span className="text-[11px] text-muted-foreground">Assigned to:</span>
                                                <span className="font-bold text-foreground">
                                                    {selectedTicket.assignee.display_name || selectedTicket.assignee.username}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Report Details Card */}
                                    {selectedTicket.report && (
                                        <div className="p-3.5 rounded-2xl bg-black/30 border border-border/60 text-xs space-y-1.5">
                                            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                                                <span className="font-bold uppercase tracking-wider text-purple-300">
                                                    Reported Content
                                                </span>
                                                <span className="capitalize">
                                                    Type: {selectedTicket.report.reportable_type} #{selectedTicket.report.reportable_id}
                                                </span>
                                            </div>
                                            <div className="text-foreground font-semibold">
                                                Reason: <span className="capitalize">{selectedTicket.report.reason?.replace(/_/g, ' ')}</span>
                                            </div>
                                            {selectedTicket.report.description && (
                                                <p className="text-muted-foreground text-xs leading-relaxed italic">
                                                    "{selectedTicket.report.description}"
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Message Conversation Stream */}
                                <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[380px]">
                                    {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                                        selectedTicket.messages.map((msg) => {
                                            const isMyMessage = msg.user_id === user?.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex gap-3 max-w-[85%] ${
                                                        isMyMessage ? 'ml-auto flex-row-reverse' : 'mr-auto'
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
                                                                isMyMessage ? 'justify-end' : 'justify-start'
                                                            }`}
                                                        >
                                                            <span className="font-bold text-foreground">
                                                                {isMyMessage ? 'You' : msg.user?.display_name || msg.user?.username}
                                                            </span>
                                                            {!isMyMessage && (
                                                                <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[9px]">
                                                                    STAFF
                                                                </span>
                                                            )}
                                                            <span>
                                                                {formatDateTimeSafe(msg.created_at)}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                                                                isMyMessage
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
                                        <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
                                            <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
                                            <p className="font-semibold text-foreground">No messages on this ticket yet</p>
                                            <p>Staff will post updates or request additional information here.</p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Composer */}
                                {!selectedTicket.closed_at ? (
                                    <form
                                        onSubmit={handleSendMessage}
                                        className="p-3.5 border-t border-border/60 bg-secondary/10 flex items-center gap-2"
                                    >
                                        <Input
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Reply or provide more details to staff..."
                                            className="h-10 rounded-xl bg-card border-border/80 text-xs focus-visible:ring-purple-500"
                                            disabled={sending}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="h-10 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md shrink-0 gap-1.5"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                            <span>Send</span>
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="p-3 bg-secondary/30 border-t border-border/60 text-center text-xs text-muted-foreground">
                                        This ticket is closed. If you need further assistance, please submit a new report.
                                    </div>
                                )}
                            </Card>
                        ) : (
                            <Card className="rounded-3xl border-border/80 bg-card/60 p-12 text-center text-muted-foreground text-xs">
                                Select a ticket from the list to view the investigation details and message thread.
                            </Card>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Appeal & Support Ticket Creation Modal */}
            <AppealTicketModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                initialType={initialAppealType}
                initialId={initialAppealId}
                initialTitle={initialAppealTitle}
                onSuccess={(newTicketId) => {
                    fetchTickets();
                    if (newTicketId) {
                        loadTicketDetail(newTicketId);
                    }
                }}
            />
        </div>
    );
};
