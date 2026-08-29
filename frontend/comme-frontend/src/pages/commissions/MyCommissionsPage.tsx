import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Layers, Clock } from 'lucide-react';
import { commissionOrderApi } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { formatPrice } from '@/utils/format';
import type { CommissionOrder, PaginationMeta } from '@/types';

const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-500',
    accepted: 'bg-blue-500/10 text-blue-500',
    in_progress: 'bg-purple-500/10 text-purple-500',
    waiting_for_client: 'bg-teal-500/10 text-teal-500',
    revision: 'bg-orange-500/10 text-orange-500',
    completed: 'bg-emerald-500/10 text-emerald-500',
    cancelled: 'bg-rose-500/10 text-rose-500',
    declined: 'bg-red-500/10 text-red-500',
};

export const MyCommissionsPage: React.FC = () => {
    const [commissions, setCommissions] = useState<CommissionOrder[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<string>('');

    const loadMore = async () => {
        const nextPage = page + 1;
        try {
            const params: Record<string, string> = {};
            if (filter) params.status = filter;
            const res = await commissionOrderApi.list(nextPage, params);
            setCommissions((prev) => [...prev, ...res.data]);
            setMeta(res.meta ?? null);
            setPage(nextPage);
        } catch {
            toast.error('Failed to load more commissions');
        }
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const params: Record<string, string> = {};
                if (filter) params.status = filter;
                const res = await commissionOrderApi.list(1, params);
                if (isMounted) {
                    setCommissions(res.data);
                    setMeta(res.meta ?? null);
                    setPage(1);
                }
            } catch {
                if (isMounted) toast.error('Failed to load commissions');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [filter]);

    const statusFilters = ['', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">My Commissions</h1>
                <p className="text-sm text-muted-foreground mt-1">Track your commission orders</p>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {statusFilters.map((s) => (
                    <Button
                        key={s}
                        variant={filter === s ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(s)}
                    >
                        {s || 'All'}
                    </Button>
                ))}
            </div>

            {/* Commission List */}
            <div className="space-y-3">
                {loading && commissions.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
                    ))
                ) : commissions.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Layers className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">No commissions yet</p>
                            <Link to="/store">
                                <Button variant="outline" className="mt-4">
                                    Browse Store
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    commissions.map((commission) => (
                        <motion.div key={commission.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                            <Link to={`/commissions/${commission.id}`}>
                                <Card className="hover:border-primary/30 transition-colors">
                                    <CardContent className="p-5 flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-sm truncate">
                                                    {commission.commission_service?.name || `Commission #${commission.id}`}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[commission.status] || ''}`}>
                                                    {commission.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{commission.description}</p>
                                            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(commission.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <p className="font-bold text-primary shrink-0">{formatPrice(commission.total_price)}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))
                )}

                {meta && meta.current_page < meta.last_page && (
                    <div className="text-center pt-4">
                        <Button
                            variant="outline"
                            onClick={loadMore}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
