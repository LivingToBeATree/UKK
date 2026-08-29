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
import { formatPrice } from '@/utils/format';
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
                    commissions.map((c) => (
                        <Card key={c.id} className="hover:border-primary/30 transition-colors">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/commissions/${c.id}`} className="font-bold text-sm hover:text-primary truncate block">
                                            {c.commission_service?.name || `#${c.id}`}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            by {c.user?.display_name || c.user?.username} • {new Date(c.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <Badge variant="secondary">{c.status.replace('_', ' ')}</Badge>
                                        <p className="text-sm font-bold text-primary mt-1">{formatPrice(c.total_price)}</p>
                                    </div>
                                </div>

                                {c.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleStatusChange(c.id, 'accepted')}>
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Accept
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange(c.id, 'declined')}>
                                            <XCircle className="h-3 w-3 mr-1" /> Decline
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </motion.div>
    );
};
