import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageSquare } from 'lucide-react';
import { ticketService, type Ticket } from '@/services/ticketService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';

const priorityColors: Record<string, string> = {
    low: 'bg-blue-500/10 text-blue-400',
    medium: 'bg-amber-500/10 text-amber-400',
    high: 'bg-rose-500/10 text-rose-400',
};

export const TicketsPage: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await ticketService.list();
                setTickets(res.data);
            } catch {
                toast.error('Failed to load tickets');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-6 w-6" /> Support Tickets
                </h1>
                <p className="text-sm text-muted-foreground mt-1">View and respond to support requests</p>
            </div>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
                    ))
                ) : tickets.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">No tickets</p>
                        </CardContent>
                    </Card>
                ) : (
                    tickets.map((ticket) => (
                        <Link key={ticket.id} to={`/admin/tickets/${ticket.id}`}>
                            <Card className="hover:border-primary/30 transition-colors mb-3">
                                <CardContent className="p-5 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-sm truncate">{ticket.subject}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityColors[ticket.priority] || ''}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {ticket.user?.display_name || ticket.user?.username} • {new Date(ticket.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge variant={ticket.status === 'open' ? 'secondary' : 'rose'}>
                                        {ticket.status}
                                    </Badge>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </motion.div>
    );
};
