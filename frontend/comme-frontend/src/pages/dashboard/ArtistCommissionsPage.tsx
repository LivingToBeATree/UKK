import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Layers, CheckCircle2, XCircle } from 'lucide-react';
import { commissionOrderApi } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { formatPrice, formatDateSafe } from '@/utils/format';
import type { CommissionOrder } from '@/types';

export const ArtistCommissionsPage: React.FC = () => {
    const [commissions, setCommissions] = useState<CommissionOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const params: Record<string, string> = {};
                if (filter) params.status = filter;
                const res = await commissionOrderApi.list(1, params);
                setCommissions(res.data);
            } catch {
                toast.error('Failed to load commissions');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [filter]);

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await commissionOrderApi.update(id, { status });
            setCommissions(commissions.map((c) => c.id === id ? { ...c, status: status as CommissionOrder['status'] } : c));
            toast.success(`Commission ${status}`);
        } catch {
            toast.error('Failed to update status');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Layers className="h-6 w-6" /> Commission Orders
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Manage incoming commission requests</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {['', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((s) => (
                    <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)}>
                        {s || 'All'}
                    </Button>
                ))}
            </div>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
                    ))
                ) : commissions.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Layers className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">No commissions yet</p>
                        </CardContent>
                    </Card>
                ) : (
                    commissions.map((c) => {
                        const formattedDate = formatDateSafe(c.created_at, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        }, 'Recent');

                        return (
                            <Card key={c.id} className="rounded-2xl border-border/80 bg-card/60 hover:border-purple-500/40 transition-all shadow-xs overflow-hidden">
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/dashboard/commissions/${c.id}`} className="font-bold text-sm text-foreground hover:text-purple-400 truncate block transition-colors">
                                                {c.commission_service?.name || `Commission Order #${c.id}`}
                                            </Link>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                by <span className="font-medium text-foreground">{c.user?.display_name || c.user?.username || 'Client'}</span> • {formattedDate}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <Badge
                                                variant="secondary"
                                                className={`text-[10px] font-bold uppercase tracking-wider ${
                                                    c.status === 'completed'
                                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                        : c.status === 'in_progress' || c.status === 'accepted'
                                                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                                        : c.status === 'waiting_for_client'
                                                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                        : c.status === 'cancelled' || c.status === 'declined'
                                                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                                        : 'bg-secondary text-muted-foreground'
                                                }`}
                                            >
                                                {c.status.replace(/_/g, ' ')}
                                            </Badge>
                                            <p className="text-sm font-black font-mono text-emerald-400 mt-1">{formatPrice(c.total_price)}</p>
                                        </div>
                                    </div>

                                    {c.status === 'pending' && (
                                        <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                                            <Button size="sm" onClick={() => handleStatusChange(c.id, 'accepted')} className="h-8 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept Order
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(c.id, 'declined')} className="h-8 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer border-rose-500/30">
                                                <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};
