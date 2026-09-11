import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Clock,
    Sparkles,
    CheckCircle2,
    ArrowRight,
    User,
    ShieldAlert,
    Kanban,
    RefreshCw,
    Activity,
} from 'lucide-react';
import { artistQueueApi, type ArtistQueueData } from '@/services/artistService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateSafe } from '@/utils/format';

interface CommissionQueueBoardProps {
    artistProfileId: number;
    artistUsername?: string;
    onOrderClick?: () => void;
}

export const CommissionQueueBoard: React.FC<CommissionQueueBoardProps> = ({
    artistProfileId,
    artistUsername: _artistUsername,
    onOrderClick,
}) => {
    const [data, setData] = useState<ArtistQueueData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStage, setFilterStage] = useState<'all' | 'waitlist' | 'in_progress' | 'review' | 'completed'>('all');

    const loadQueue = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await artistQueueApi.getQueue(artistProfileId);
            setData(res);
        } catch {
            setError('Unable to load artist queue. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (artistProfileId) {
            loadQueue();
        }
    }, [artistProfileId]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-44 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <Card className="p-8 text-center border-border/80">
                <p className="text-sm text-muted-foreground">{error || 'Queue not available'}</p>
                <Button variant="outline" size="sm" onClick={loadQueue} className="mt-3 gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                </Button>
            </Card>
        );
    }

    const { stats, queue, recent_completed } = data;
    const userActiveItem = queue.find((q) => q.is_current_user);
    const capacityPercent = Math.min(100, Math.round((stats.total_active / stats.capacity) * 100));

    // Filter items
    const filteredItems = filterStage === 'all'
        ? queue
        : filterStage === 'completed'
        ? recent_completed
        : queue.filter((q) => q.stage === filterStage);

    const getStageStyle = (stage: string) => {
        switch (stage) {
            case 'waitlist':
                return {
                    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    dot: 'bg-amber-400',
                    border: 'border-amber-500/20',
                    title: 'Waitlist',
                };
            case 'in_progress':
                return {
                    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                    dot: 'bg-blue-400',
                    border: 'border-blue-500/20',
                    title: 'In Progress',
                };
            case 'review':
            case 'revision':
                return {
                    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                    dot: 'bg-purple-400',
                    border: 'border-purple-500/20',
                    title: 'Under Review',
                };
            case 'completed':
            default:
                return {
                    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    dot: 'bg-emerald-400',
                    border: 'border-emerald-500/20',
                    title: 'Completed',
                };
        }
    };

    return (
        <div className="space-y-6">
            {/* User Active Commission Spotlight Banner */}
            {userActiveItem && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-primary/15 to-emerald-500/15 border border-amber-500/30 shadow-md backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                            <Sparkles className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground flex items-center gap-2">
                                <span>Your Commission is Slot #{userActiveItem.position || 1}!</span>
                                <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/40 font-mono">
                                    {userActiveItem.stage_label}
                                </Badge>
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Order <span className="font-mono text-foreground font-semibold">{userActiveItem.code}</span> ({userActiveItem.service_name})
                                {userActiveItem.deadline && ` • Due ${formatDateSafe(userActiveItem.deadline)}`}
                            </p>
                        </div>
                    </div>
                    <Link to={`/commissions/${userActiveItem.slug || userActiveItem.id}`}>
                        <Button size="sm" className="gap-1.5 font-bold text-xs h-9 cursor-pointer">
                            Open Workspace <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </motion.div>
            )}

            {/* Capacity Gauge & Queue Stats Header */}
            <Card className="border-border/80 bg-card/60 backdrop-blur-xl">
                <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                                <Kanban className="h-4 w-4 text-primary" /> Live Studio Commission Queue
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Real-time workflow tracker inspired by Skeb and VGen. Client names are protected for privacy.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {stats.is_full ? (
                                <Badge variant="secondary" className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold gap-1.5 py-1">
                                    <ShieldAlert className="h-3.5 w-3.5" /> Queue Full ({stats.total_active}/{stats.capacity})
                                </Badge>
                            ) : (
                                <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold gap-1.5 py-1">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Accepting Slots ({stats.total_active}/{stats.capacity} Filled)
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Visual Progress Bar for Capacity */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                            <span>Studio Capacity Load</span>
                            <span className="font-bold text-foreground">{capacityPercent}% ({stats.total_active} / {stats.capacity} Active Slots)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden flex">
                            <div
                                style={{ width: `${capacityPercent}%` }}
                                className={`h-full transition-all duration-500 rounded-full ${
                                    capacityPercent > 80
                                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                                        : 'bg-gradient-to-r from-primary to-emerald-400'
                                }`}
                            />
                        </div>
                    </div>

                    {/* Breakdown Pill Tabs */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                        <button
                            type="button"
                            onClick={() => setFilterStage('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                                filterStage === 'all'
                                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                    : 'bg-secondary/60 hover:bg-secondary text-muted-foreground'
                            }`}
                        >
                            Active Orders ({queue.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStage('waitlist')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                                filterStage === 'waitlist'
                                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                                    : 'bg-secondary/60 hover:bg-secondary text-muted-foreground'
                            }`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Waitlist ({stats.waitlist_count})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStage('in_progress')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                                filterStage === 'in_progress'
                                    ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40'
                                    : 'bg-secondary/60 hover:bg-secondary text-muted-foreground'
                            }`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                            In Progress ({stats.in_progress_count})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStage('review')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                                filterStage === 'review'
                                    ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                                    : 'bg-secondary/60 hover:bg-secondary text-muted-foreground'
                            }`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                            In Review ({stats.review_count})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStage('completed')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                                filterStage === 'completed'
                                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                                    : 'bg-secondary/60 hover:bg-secondary text-muted-foreground'
                            }`}
                        >
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            Recent Deliveries ({stats.completed_recent_count})
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Queue Cards Grid */}
            {filteredItems.length === 0 ? (
                <Card className="p-10 text-center border-dashed border-border/80">
                    <div className="max-w-sm mx-auto space-y-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                            <Activity className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-sm text-foreground">
                            {filterStage === 'all'
                                ? 'The queue currently has open slots!'
                                : `No commissions currently in "${filterStage}"`}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {filterStage === 'all'
                                ? 'This artist has immediate availability. Place an order to claim Slot #1!'
                                : 'Check the other status tabs or browse active services to commission this artist.'}
                        </p>
                        {onOrderClick && (
                            <Button size="sm" onClick={onOrderClick} className="font-bold gap-1.5 mt-2">
                                Request Commission Now
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item, index) => {
                        const style = getStageStyle(item.stage);
                        return (
                            <Card
                                key={item.id || index}
                                className={`overflow-hidden transition-all duration-200 hover:border-primary/50 relative ${
                                    item.is_current_user ? 'ring-2 ring-primary/40 bg-primary/5' : ''
                                }`}
                            >
                                <CardContent className="p-4 space-y-3">
                                    {/* Top Row: Slot Position & Stage Badge */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {item.position ? (
                                                <span className="h-6 w-6 rounded-lg bg-secondary flex items-center justify-center font-mono font-bold text-xs text-foreground">
                                                    #{item.position}
                                                </span>
                                            ) : (
                                                <span className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                </span>
                                            )}
                                            <span className="font-mono text-xs text-muted-foreground font-semibold">
                                                {item.code}
                                            </span>
                                        </div>

                                        <Badge variant="outline" className={`text-[10px] font-bold gap-1 ${style.badge}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                            {item.stage_label}
                                        </Badge>
                                    </div>

                                    {/* Service Title */}
                                    <div>
                                        <h3 className="font-bold text-sm text-foreground line-clamp-1">
                                            {item.service_name}
                                        </h3>
                                        {item.option_name && (
                                            <p className="text-[11px] text-muted-foreground truncate">
                                                Tier: {item.option_name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Client & Timeline Footer */}
                                    <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                                        <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                                            <User className="h-3 w-3 shrink-0" />
                                            <span className={`truncate ${item.is_current_user ? 'text-primary font-bold' : ''}`}>
                                                {item.is_current_user ? 'You (Client)' : item.client_name}
                                            </span>
                                        </div>

                                        {item.deadline ? (
                                            <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground shrink-0">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatDateSafe(item.deadline, { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        ) : item.completed_at ? (
                                            <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 shrink-0">
                                                <span>Done {formatDateSafe(item.completed_at, { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground">Standard</span>
                                        )}
                                    </div>

                                    {item.is_current_user && (
                                        <Link to={`/commissions/${item.slug || item.id}`} className="block pt-1">
                                            <Button size="xs" variant="outline" className="w-full text-xs font-semibold gap-1 text-primary hover:text-primary">
                                                View Your Workspace <ArrowRight className="h-3 w-3" />
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
