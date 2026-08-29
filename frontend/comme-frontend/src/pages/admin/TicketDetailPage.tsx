import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Lock } from 'lucide-react';
import { ticketService, type Ticket } from '@/services/ticketService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';

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
        if (!reply.trim()) return;
        setSending(true);
        try {
            const updated = await ticketService.update(Number(id), { body: reply });
            setTicket(updated);
            setReply('');
            toast.success('Reply sent');
        } catch {
            toast.error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleClose = async () => {
        try {
            const updated = await ticketService.close(Number(id));
            setTicket(updated);
            toast.success('Ticket closed');
        } catch {
            toast.error('Failed to close');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (!ticket) {
        return <div className="text-center py-20 text-muted-foreground">Ticket not found</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Link to="/admin/tickets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to Tickets
            </Link>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold">{ticket.subject}</h1>
                        <div className="flex gap-2">
                            <Badge variant="secondary">{ticket.status}</Badge>
                            <Badge variant="secondary">{ticket.priority}</Badge>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        by {ticket.user?.display_name || ticket.user?.username} • {new Date(ticket.created_at).toLocaleDateString()}
                    </p>

                    {ticket.status !== 'closed' && (
                        <Button variant="outline" size="sm" onClick={handleClose}>
                            <Lock className="h-3 w-3 mr-1" /> Close Ticket
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Messages */}
            <div className="space-y-3">
                {ticket.messages?.map((msg) => (
                    <Card key={msg.id}>
                        <CardContent className="p-4 flex gap-3">
                            <Avatar
                                size="sm"
                                fallback={msg.user?.display_name || '?'}
                                src={msg.user?.avatar_url}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs">{msg.user?.display_name || msg.user?.username}</span>
                                    <span className="text-[11px] text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-sm mt-1">{msg.body}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Reply */}
            {ticket.status !== 'closed' && (
                <form onSubmit={handleReply} className="flex gap-2">
                    <Input
                        placeholder="Type your reply..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={sending || !reply.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            )}
        </motion.div>
    );
};
