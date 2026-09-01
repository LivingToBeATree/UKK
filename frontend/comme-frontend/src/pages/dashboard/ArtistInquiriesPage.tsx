import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    MessageSquare,
    Search,
    Clock,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Filter,
} from 'lucide-react';
import { commissionOrderApi } from '@/services/commissionService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { formatPrice } from '@/utils/format';
import type { CommissionOrder } from '@/types';

export const ArtistInquiriesPage: React.FC = () => {
    const [orders, setOrders] = useState<CommissionOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await commissionOrderApi.list(1);
                setOrders(res.data || []);
            } catch {
                toast.error('Failed to load client inquiries');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.commission_service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(order.id).includes(searchQuery);

        if (!matchesSearch) return false;

        if (statusFilter === 'active') {
            return ['pending', 'accepted', 'in_progress', 'waiting_for_client', 'revision'].includes(order.status);
        }
        if (statusFilter === 'completed') {
            return order.status === 'completed';
        }
        return true;
    });

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2.5 text-foreground">
                        <MessageSquare className="h-6 w-6 text-purple-400" />
                        Client Inquiries & Chat
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Active message threads and project updates with your commission clients.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold">
                        {filteredOrders.length} Conversations
                    </Badge>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <Card className="rounded-2xl border-border/80 bg-card/60 backdrop-blur-md">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by client, order ID, or tier..."
                            className="pl-10 h-10 rounded-xl bg-secondary/40 border-border/80 text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1 hidden sm:inline" />
                        {(['all', 'active', 'completed'] as const).map((filterKey) => (
                            <Button
                                key={filterKey}
                                size="sm"
                                variant={statusFilter === filterKey ? 'default' : 'ghost'}
                                onClick={() => setStatusFilter(filterKey)}
                                className={`h-8 px-3.5 rounded-xl text-xs font-bold capitalize cursor-pointer shrink-0 ${
                                    statusFilter === filterKey
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {filterKey === 'all' ? 'All Inquiries' : filterKey}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Conversations List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="rounded-2xl border-border/80 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-36" />
                                        <Skeleton className="h-3 w-52" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-24 rounded-xl" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : filteredOrders.length > 0 ? (
                <div className="space-y-3">
                    {filteredOrders.map((order) => {
                        const isCompleted = order.status === 'completed';
                        const isActive = ['accepted', 'in_progress', 'revision'].includes(order.status);
                        const isPending = order.status === 'pending';

                        return (
                            <Card
                                key={order.id}
                                className="rounded-2xl border-border/80 hover:border-purple-500/50 transition-all duration-200 bg-card hover:bg-secondary/20 shadow-xs"
                            >
                                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {/* Client Info & Order details */}
                                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                        <Avatar
                                            size="md"
                                            src={order.user?.avatar_url}
                                            fallback={order.user?.display_name || order.user?.username || 'Client'}
                                            className="border border-border/80 shadow-inner shrink-0"
                                        />
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-sm text-foreground truncate">
                                                    {order.user?.display_name || order.user?.username || 'Client'}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    @{order.user?.username || 'client'}
                                                </span>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                                                    #{order.id}
                                                </span>
                                            </div>
                                            <p className="text-xs text-foreground/90 font-medium truncate">
                                                {order.commission_service?.name || order.description || 'Commission Project'}
                                            </p>
                                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </span>
                                                <span>•</span>
                                                <span className="font-semibold text-purple-400">
                                                    {formatPrice(order.total_price || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge & Action Button */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60 shrink-0">
                                        <div>
                                            {isCompleted && (
                                                <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold gap-1 text-[11px]">
                                                    <CheckCircle2 className="h-3 w-3" /> Completed
                                                </Badge>
                                            )}
                                            {isActive && (
                                                <Badge className="bg-blue-500/15 border-blue-500/30 text-blue-400 font-bold gap-1 text-[11px]">
                                                    <Sparkles className="h-3 w-3" /> In Progress
                                                </Badge>
                                            )}
                                            {isPending && (
                                                <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold gap-1 text-[11px]">
                                                    <Clock className="h-3 w-3" /> Pending Accept
                                                </Badge>
                                            )}
                                        </div>

                                        <Link to={`/commissions/${order.id}`}>
                                            <Button
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-bold text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs"
                                            >
                                                Open Chat
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card className="rounded-3xl border-dashed border-border/80 p-12 text-center bg-card/40">
                    <div className="h-12 w-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">No client inquiries found</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1.5">
                        {searchQuery
                            ? `No active discussions matching "${searchQuery}".`
                            : 'When clients order your commission tiers or request custom quotes, active conversations will appear here.'}
                    </p>
                </Card>
            )}
        </motion.div>
    );
};
