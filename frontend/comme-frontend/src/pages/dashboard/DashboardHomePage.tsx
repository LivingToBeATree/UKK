import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    LayoutDashboard,
    Layers,
    Star,
    DollarSign,
    Plus,
    Palette,
    MessageSquare,
    Wallet,
    ArrowRight,
    Sparkles,
    ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { commissionOrderApi } from '@/services/commissionService';
import { artistReviewApi } from '@/services/artistService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/utils/format';
import type { CommissionOrder } from '@/types';

export const DashboardHomePage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<CommissionOrder[]>([]);
    const [avgRating, setAvgRating] = useState('5.0');
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);

    const artistProfileId = user?.artist_profile?.id || (user as any)?.artistProfile?.id;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [ordersRes, reviewsRes] = await Promise.all([
                    commissionOrderApi.list(1).catch(() => ({ data: [] })),
                    artistProfileId ? artistReviewApi.listByArtist(artistProfileId).catch(() => ({ data: [] })) : { data: [] },
                ]);

                const fetchedOrders = ordersRes.data || [];
                setOrders(fetchedOrders);

                const reviews = reviewsRes.data || [];
                setTotalReviews(reviews.length);
                if (reviews.length > 0) {
                    const avg = reviews.reduce((acc: number, r: any) => acc + Number(r.rating || 5), 0) / reviews.length;
                    setAvgRating(avg.toFixed(1));
                }
            } catch {
                // Ignore silent failure
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [artistProfileId]);

    const activeOrders = orders.filter((o) => ['accepted', 'in_progress', 'revision', 'pending'].includes(o.status));
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const totalEarned = completedOrders.reduce((acc, o) => acc + Number(o.total_price || 0), 0);
    const inEscrow = activeOrders.reduce((acc, o) => acc + Number(o.total_price || 0), 0);

    const stats = [
        {
            label: 'Active Orders',
            value: loading ? '...' : String(activeOrders.length),
            icon: Layers,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
        },
        {
            label: 'Avg Client Rating',
            value: loading ? '...' : `${avgRating} ★`,
            icon: Star,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            sub: `${totalReviews} reviews`,
        },
        {
            label: 'Total Revenue',
            value: loading ? '...' : formatPrice(totalEarned),
            icon: DollarSign,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            sub: `${completedOrders.length} completed`,
        },
        {
            label: 'In Escrow (Active)',
            value: loading ? '...' : formatPrice(inEscrow),
            icon: ShieldCheck,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            sub: 'Secured payments',
        },
    ];

    const quickActions = [
        {
            title: 'Create Commission Tier',
            desc: 'Add a new pricing tier & turnaround time',
            icon: Plus,
            href: '/dashboard/services/new',
            color: 'from-purple-600/20 to-purple-600/5 hover:border-purple-500/50',
            btnText: 'New Tier',
        },
        {
            title: 'Upload to Portfolio',
            desc: 'Showcase your latest artwork illustrations',
            icon: Palette,
            href: '/dashboard/portfolio',
            color: 'from-blue-600/20 to-blue-600/5 hover:border-blue-500/50',
            btnText: 'Add Artwork',
        },
        {
            title: 'Client Inquiries',
            desc: 'Chat with clients and review requirements',
            icon: MessageSquare,
            href: '/dashboard/inquiries',
            color: 'from-pink-600/20 to-pink-600/5 hover:border-pink-500/50',
            btnText: 'Open Inbox',
        },
        {
            title: 'Earnings & Payouts',
            desc: 'Manage Iris bank account & disbursement',
            icon: Wallet,
            href: '/dashboard/earnings',
            color: 'from-emerald-600/20 to-emerald-600/5 hover:border-emerald-500/50',
            btnText: 'View Escrow',
        },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Top Greeting & Studio Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5 text-foreground">
                        <LayoutDashboard className="h-7 w-7 text-purple-400" />
                        Artist Studio
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Welcome back, <span className="font-bold text-foreground">{user?.display_name || user?.username}</span>! Here is your studio overview.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Studio Online
                    </Badge>
                </div>
            </div>

            {/* Live Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} className="rounded-3xl border-border/80 bg-card/70 backdrop-blur-md shadow-xs hover:border-border transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color} shrink-0`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xl sm:text-2xl font-black text-foreground font-mono truncate">
                                            {stat.value}
                                        </p>
                                        <p className="text-[11px] font-medium text-muted-foreground truncate">{stat.label}</p>
                                        {stat.sub && (
                                            <p className="text-[10px] text-muted-foreground/80 font-mono mt-0.5 truncate">{stat.sub}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Quick Studio Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((act) => {
                        const Icon = act.icon;
                        return (
                            <Link key={act.title} to={act.href}>
                                <Card className={`rounded-3xl border border-border/80 bg-gradient-to-br ${act.color} transition-all duration-200 hover:shadow-lg group h-full flex flex-col justify-between p-5`}>
                                    <div className="space-y-2">
                                        <div className="h-10 w-10 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-foreground group-hover:scale-110 transition-transform">
                                            <Icon className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-foreground group-hover:text-purple-300 transition-colors">
                                                {act.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                                {act.desc}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-4 flex items-center text-xs font-bold text-purple-400 gap-1 group-hover:translate-x-1 transition-transform">
                                        {act.btnText} <ArrowRight className="h-3.5 w-3.5" />
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent Commission Orders */}
            <Card className="rounded-3xl border-border/80 bg-card overflow-hidden">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-foreground">
                                Active Order Queue
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                High priority orders awaiting your progress updates.
                            </p>
                        </div>
                        <Link to="/dashboard/commissions">
                            <Button size="sm" variant="outline" className="h-8 px-3 rounded-xl text-xs font-bold gap-1 cursor-pointer">
                                View All ({orders.length}) <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2].map((i) => (
                                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : activeOrders.length > 0 ? (
                        <div className="divide-y divide-border/60">
                            {activeOrders.slice(0, 5).map((order) => (
                                <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-foreground">
                                                {order.commission_service?.name || order.description || 'Commission Project'}
                                            </span>
                                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                                                #{order.id}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Client: <span className="text-foreground font-medium">@{order.user?.username || 'client'}</span> • {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                                        <span className="font-mono font-bold text-sm text-foreground">
                                            {formatPrice(order.total_price || 0)}
                                        </span>
                                        <Link to={`/commissions/${order.id}`}>
                                            <Button size="sm" className="h-8 px-3 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs">
                                                Manage Order
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            Your active order queue is currently clear!
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};
