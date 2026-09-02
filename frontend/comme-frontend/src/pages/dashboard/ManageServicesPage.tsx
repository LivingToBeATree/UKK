import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Pencil, Trash2, Sparkles, Layers, Tag, ImageIcon, ExternalLink } from 'lucide-react';
import { commissionServiceApi } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { formatPrice } from '@/utils/format';
import type { CommissionService } from '@/types';

export const ManageServicesPage: React.FC = () => {
    const [services, setServices] = useState<CommissionService[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await commissionServiceApi.list();
            setServices(res.data);
        } catch {
            toast.error('Failed to load commission services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await commissionServiceApi.destroy(id);
            setServices((prev) => prev.filter((s) => s.id !== id));
            toast.success('Commission service deleted');
        } catch {
            toast.error('Failed to delete commission service');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
                        <Sparkles className="h-6 w-6 text-purple-400" /> Commission Services
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Manage your commission listings, packages, add-ons, and showcase samples.
                    </p>
                </div>
                <Link to="/dashboard/services/new">
                    <Button className="h-10 px-5 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md gap-2">
                        <Plus className="h-4 w-4" /> New Commission Service
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="rounded-3xl border-border/80 bg-card/60">
                            <CardContent className="p-5">
                                <div className="flex gap-4 items-center">
                                    <Skeleton className="h-20 w-28 rounded-2xl shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-48 rounded-lg" />
                                        <Skeleton className="h-4 w-full rounded-lg" />
                                        <Skeleton className="h-4 w-32 rounded-lg" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : services.length === 0 ? (
                    <Card className="rounded-3xl border-border/80 bg-card/60">
                        <CardContent className="p-12 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-foreground">No Commission Services Listed Yet</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    Start accepting client commissions by creating your first service listing with customizable packages and add-ons.
                                </p>
                            </div>
                            <Link to="/dashboard/services/new">
                                <Button className="h-10 px-6 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md gap-2">
                                    <Plus className="h-4 w-4" /> Create Your First Service
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    services.map((svc) => {
                        const minPrice = svc.options?.length
                            ? Math.min(...svc.options.map((o) => Number(o.base_price ?? o.price ?? 0)))
                            : null;
                        const totalAddons = (svc.options || []).reduce(
                            (acc, o) => acc + (o.addons?.length || 0),
                            0
                        );
                        const coverImg = svc.media?.[0]?.url;

                        return (
                            <Card
                                key={svc.id}
                                className="rounded-3xl border-border/80 bg-card/60 hover:border-purple-500/40 transition-all shadow-xs overflow-hidden"
                            >
                                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    {/* Thumbnail + Details */}
                                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                                        {/* Cover Image */}
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-secondary/60 border border-border/70 overflow-hidden shrink-0 flex items-center justify-center">
                                            {coverImg ? (
                                                <img
                                                    src={coverImg}
                                                    alt={svc.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-muted-foreground text-[10px] gap-1">
                                                    <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                                                    <span>No image</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Text Info */}
                                        <div className="space-y-1.5 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-sm text-foreground truncate max-w-sm">
                                                    {svc.name}
                                                </h3>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[10px] font-bold uppercase tracking-wider ${
                                                        svc.status === 'open'
                                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                            : svc.status === 'closed'
                                                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                    }`}
                                                >
                                                    {svc.status}
                                                </Badge>
                                            </div>

                                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
                                                {svc.description}
                                            </p>

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-0.5">
                                                {minPrice !== null && (
                                                    <span className="font-mono font-bold text-emerald-400">
                                                        Starts from {formatPrice(minPrice)}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Layers className="h-3.5 w-3.5 text-purple-400" />
                                                    {svc.options?.length || 0} Package Option(s)
                                                </span>
                                                {totalAddons > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Tag className="h-3.5 w-3.5 text-purple-400" />
                                                        {totalAddons} Add-on Extra(s)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        <Link to={`/store/${svc.id}`} target="_blank" rel="noopener noreferrer">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                                title="View in Store"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" /> Preview
                                            </Button>
                                        </Link>
                                        <Link to={`/dashboard/services/${svc.id}/edit`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer border-border/80"
                                            >
                                                <Pencil className="h-3.5 w-3.5" /> Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(svc.id, svc.name)}
                                            className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                            title="Delete service"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};
