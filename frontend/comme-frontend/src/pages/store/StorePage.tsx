import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter } from 'lucide-react';
import { commissionServiceApi } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { formatPrice } from '@/utils/format';
import type { CommissionService, PaginationMeta } from '@/types';

export const StorePage: React.FC = () => {
    const [services, setServices] = useState<CommissionService[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const loadMore = async () => {
        const nextPage = page + 1;
        try {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            const res = await commissionServiceApi.list(nextPage, params);
            setServices((prev) => [...prev, ...res.data]);
            setMeta(res.meta ?? null);
            setPage(nextPage);
        } catch {
            toast.error('Failed to load more services');
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (search) params.search = search;
            const res = await commissionServiceApi.list(1, params);
            setServices(res.data);
            setMeta(res.meta ?? null);
            setPage(1);
        } catch {
            toast.error('Failed to search services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const res = await commissionServiceApi.list(1);
                if (isMounted) {
                    setServices(res.data);
                    setMeta(res.meta ?? null);
                }
            } catch {
                if (isMounted) toast.error('Failed to load services');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Commission Store</h1>
                <p className="text-muted-foreground mt-2">Browse commission services from talented artists</p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search services..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button type="submit" variant="outline">
                    <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
            </form>

            {/* Service Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && services.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <Skeleton className="h-48 rounded-t-lg" />
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </CardContent>
                        </Card>
                    ))
                ) : services.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <p className="text-muted-foreground">No services found</p>
                    </div>
                ) : (
                    services.map((service) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Link to={`/store/${service.id}`}>
                                <Card className="h-full hover:border-primary/40 transition-all hover:-translate-y-1 overflow-hidden">
                                    {/* Thumbnail */}
                                    <div className="h-48 bg-muted flex items-center justify-center">
                                        {service.media && service.media[0] ? (
                                            <img src={service.media[0].url} alt={service.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-muted-foreground text-xs">No image</span>
                                        )}
                                    </div>

                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="font-bold text-sm truncate">{service.name}</h3>
                                            <Badge variant={service.status === 'open' ? 'secondary' : 'rose'} className="text-[10px] shrink-0">
                                                {service.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                                        {service.options && service.options.length > 0 && (
                                            <p className="text-sm font-semibold text-primary">
                                                From {formatPrice(Math.min(...service.options.map((o) => o.base_price ?? o.price ?? 0)))}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Load More */}
            {meta && meta.current_page < meta.last_page && (
                <div className="text-center mt-8">
                    <Button variant="outline" onClick={loadMore} disabled={loading}>
                        {loading ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}
        </div>
    );
};
