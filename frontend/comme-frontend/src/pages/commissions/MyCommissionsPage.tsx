import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Layers, Clock, Search, ArrowUpDown, X } from 'lucide-react';
import { commissionOrderApi } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { formatPrice, formatDateSafe } from '@/utils/format';
import type { CommissionOrder, PaginationMeta } from '@/types';

const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    accepted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    in_progress: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    waiting_for_client: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    revision: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    declined: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export const MyCommissionsPage: React.FC = () => {
    const [commissions, setCommissions] = useState<CommissionOrder[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('latest');

    const fetchCommissions = async (targetPage = 1, isLoadMore = false) => {
        try {
            setLoading(true);
            const params: Record<string, string> = { role: 'buyer' };
            if (filter) params.status = filter;
            if (search.trim()) params.search = search.trim();
            if (sortBy && sortBy !== 'latest') params.sort = sortBy;

            const res = await commissionOrderApi.list(targetPage, params);
            if (isLoadMore) {
                setCommissions((prev) => [...prev, ...res.data]);
            } else {
                setCommissions(res.data);
            }
            setMeta(res.meta ?? null);
            setPage(targetPage);
        } catch {
            toast.error('Failed to load commissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions(1, false);
    }, [filter, sortBy]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCommissions(1, false);
    };

    const loadMore = async () => {
        if (!meta || page >= meta.last_page || loading) return;
        fetchCommissions(page + 1, true);
    };

    const statusFilters = ['', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="border-b border-border/80 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                    <Layers className="h-8 w-8 text-primary" />
                    My Commission Orders
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Track deliverables, milestone statuses, and project payments</p>
            </div>

            {/* Search & Sort Controls */}
            <div className="space-y-3.5">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders by service title, artist, notes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-10 h-10 rounded-xl bg-card border-border/80 text-xs"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setFilter('');
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    <Button type="submit" size="sm" className="h-10 px-4 rounded-xl font-bold text-xs">
                        Search
                    </Button>
                </form>

                {/* Status Filters & Sort Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                        {statusFilters.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setFilter(s)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                                    filter === s
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
                                }`}
                            >
                                {s ? s.replace('_', ' ') : 'All Orders'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 bg-secondary/40 p-1 rounded-xl border border-border/60 self-start sm:self-auto shrink-0">
                        <span className="text-[11px] font-bold text-muted-foreground pl-2 flex items-center gap-1.5">
                            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                            Sort:
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-8 px-2.5 rounded-lg bg-card border border-border text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
                        >
                            <option value="latest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="title_asc">Title (A - Z)</option>
                            <option value="title_desc">Title (Z - A)</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="deadline_asc">Soonest Deadline</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Commission List */}
            <div className="space-y-3 pt-2">
                {loading && commissions.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="rounded-2xl"><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
                    ))
                ) : commissions.length === 0 ? (
                    <Card className="rounded-3xl border border-dashed border-border bg-card/60">
                        <CardContent className="p-12 text-center">
                            <Layers className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-base font-bold text-foreground">No orders found</h3>
                            <p className="text-xs text-muted-foreground mt-1 mb-4">
                                {filter || search ? 'Try clearing your search or status filter.' : 'You have not placed any commission orders yet.'}
                            </p>
                            <Link to="/store">
                                <Button variant="outline" className="rounded-xl">
                                    Browse Commission Store
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    commissions.map((commission) => (
                        <motion.div key={commission.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                            <Link to={`/commissions/${commission.id}`}>
                                <Card className="hover:border-primary/40 transition-all hover:-translate-y-0.5 rounded-2xl bg-card border-border/80">
                                    <CardContent className="p-5 flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-bold text-sm truncate text-foreground">
                                                    {commission.commission_service?.name || `Commission #${commission.id}`}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${statusColors[commission.status] || 'bg-muted text-muted-foreground'}`}>
                                                    {commission.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {commission.description && (
                                                <p className="text-xs text-muted-foreground truncate">{commission.description}</p>
                                            )}
                                            <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDateSafe(commission.created_at)}
                                                </span>
                                                {commission.deadline && (
                                                    <span className="text-primary font-mono text-[10px]">
                                                        Deadline: {formatDateSafe(commission.deadline)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="font-extrabold text-sm text-primary shrink-0">{formatPrice(commission.total_price)}</p>
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
                            className="rounded-2xl px-6"
                        >
                            {loading ? 'Loading...' : 'Load More Orders'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

