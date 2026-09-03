import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LifeBuoy, CheckCircle2, Clock, XCircle, ChevronRight, Flag } from 'lucide-react';
import { ticketService } from '@/services/ticketService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatDateSafe } from '@/utils/format';
import { toast } from '@/components/ui/sonner';
import type { Ticket } from '@/types';

const priorityColors: Record<string, string> = {
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    normal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export const TicketsPage: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await ticketService.list();
                setTickets(res.data || []);
            } catch {
                toast.error('Failed to load tickets');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <LifeBuoy className="h-6 w-6 text-purple-400" /> Support & Moderation Tickets
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">Review ticket communication threads and moderation inquiries</p>
                </div>
                <Link to="/admin/reports">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1.5">
                        <Flag className="h-3.5 w-3.5 text-rose-400" /> Moderation Reports Workbench
                    </Button>
                </Link>
            </div>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="rounded-3xl border-border/80 bg-card/60 p-5"><Skeleton className="h-16 w-full rounded-2xl" /></Card>
                    ))
                ) : tickets.length === 0 ? (
                    <Card className="rounded-3xl border-border/80 bg-card/60 p-12 text-center">
                        <LifeBuoy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground text-xs">No active tickets found</p>
                    </Card>
                ) : (
                    tickets.map((ticket) => (
                        <Link key={ticket.id} to={`/admin/tickets/${ticket.id}`}>
                            <Card className="rounded-3xl border border-border/80 bg-card/60 hover:border-purple-500/60 transition-all mb-3 overflow-hidden shadow-xs hover:shadow-md cursor-pointer">
                                <CardContent className="p-5 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-sm text-foreground truncate">
                                                Ticket #{ticket.id} {ticket.report ? `— ${ticket.report.reportable_type} #${ticket.report.reportable_id}` : ''}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${priorityColors[ticket.priority] || ''}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {ticket.report?.description || `Report reason: ${ticket.report?.reason || 'General Inquiry'}`}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Opened {formatDateSafe(ticket.created_at || ticket.report?.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {ticket.closed_at ? (
                                            <Badge variant="outline" className="text-muted-foreground text-[10px] uppercase font-bold">
                                                <XCircle className="h-3 w-3 mr-1" /> Closed
                                            </Badge>
                                        ) : ticket.report?.status === 'resolved' ? (
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold">
                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Resolved
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] uppercase font-bold">
                                                <Clock className="h-3 w-3 mr-1" /> Open
                                            </Badge>
                                        )}
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </motion.div>
    );
};
