import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Lock } from 'lucide-react';
import { ticketService } from '@/services/ticketService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTimeSafe } from '@/utils/format';
import { toast } from '@/components/ui/sonner';
import type { Ticket, TicketMessage } from '@/types';

export const TicketDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await ticketService.show(Number(id));
                setTicket(data);
            } catch {
                toast.error('Failed to load ticket');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetch();
    }, [id]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || !id) return;
        setSending(true);
        try {
            const sentMsg = await ticketService.sendMessage(Number(id), reply.trim());
            setTicket((prev) => prev ? { ...prev, messages: [...(prev.messages || []), sentMsg] } : null);
            setReply('');
            toast.success('Staff reply sent');
        } catch {
            toast.error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleClose = async () => {
        if (!id) return;
        try {
            await ticketService.close(Number(id));
            setTicket((prev) => prev ? { ...prev, closed_at: new Date().toISOString() } : null);
            toast.success('Ticket closed');
        } catch {
            toast.error('Failed to close ticket');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
        );
    }

    if (!ticket) {
        return <div className="text-center py-20 text-muted-foreground text-xs">Ticket not found</div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
            <Link to="/admin/tickets" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to Tickets
            </Link>

            <Card className="rounded-3xl border-border/80 bg-card/60 p-6 space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-foreground">Ticket #{ticket.id}</h1>
                            <Badge variant="outline" className="text-[10px] font-bold uppercase">
                                {ticket.priority} priority
                            </Badge>
                        </div>
                        {ticket.report && (
                            <p className="text-xs text-muted-foreground">
                                Linked Report: <strong className="text-foreground">{ticket.report.reportable_type} #{ticket.report.reportable_id}</strong> • Reason: {ticket.report.reason}
                            </p>
                        )}
                    </div>

                    {!ticket.closed_at ? (
                        <Button variant="outline" size="sm" onClick={handleClose} className="rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10">
                            <Lock className="h-3.5 w-3.5 mr-1" /> Close Ticket
                        </Button>
                    ) : (
                        <Badge variant="outline" className="text-zinc-400 text-xs">Closed</Badge>
                    )}
                </div>
            </Card>

            {/* Conversation Messages */}
            <div className="space-y-3">
                {ticket.messages && ticket.messages.length > 0 ? (
                    ticket.messages.map((msg: TicketMessage) => (
                        <Card key={msg.id} className="rounded-2xl border-border/80 bg-card/40">
                            <CardContent className="p-4 flex gap-3">
                                <Avatar
                                    size="sm"
                                    fallback={msg.user?.display_name || msg.user?.username || '?'}
                                    src={msg.user?.avatar_url}
                                />
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-foreground">
                                                {msg.user?.display_name || msg.user?.username}
                                            </span>
                                            {msg.user?.role === 'admin' && (
                                                <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[9px]">
                                                    STAFF
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDateTimeSafe(msg.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-foreground/90 whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                        No messages in this ticket thread yet.
                    </div>
                )}
            </div>

            {/* Reply Composer */}
            {!ticket.closed_at && (
                <form onSubmit={handleReply} className="flex gap-2">
                    <Input
                        placeholder="Type staff reply to reporter..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        className="flex-1 h-10 rounded-xl bg-card border-border/80 text-xs"
                    />
                    <Button type="submit" disabled={sending || !reply.trim()} className="h-10 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white">
                        <Send className="h-3.5 w-3.5 mr-1" /> Send
                    </Button>
                </form>
            )}
        </motion.div>
    );
};
