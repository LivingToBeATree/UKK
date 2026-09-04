import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Hash, X, Sparkles, ShoppingBag, ArrowUpDown } from 'lucide-react';
import { commissionServiceApi } from '@/services/commissionService';
import { tagService, type TagItem } from '@/services/tagService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { formatPrice } from '@/utils/format';
import type { CommissionService, PaginationMeta } from '@/types';

const DEFAULT_SERVICE_TAGS = [
    'Anime',
    'Chibi',
    'VTuber',
    'Illustration',
    'CharacterDesign',
    'Emotes',
    'Live2D',
    'FullBody',
    'BustUp',
    'Commercial',
    'ConceptArt',
    'PixelArt',
];

export const StorePage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTag = searchParams.get('tag') || '';
    const initialSearch = searchParams.get('search') || '';
    const initialSort = searchParams.get('sort') || 'latest';
    const initialStatus = searchParams.get('status') || 'all';

    const [services, setServices] = useState<CommissionService[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState(initialSearch);
    const [selectedTag, setSelectedTag] = useState<string>(initialTag);
    const [sortBy, setSortBy] = useState<string>(initialSort);
    const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
    const [popularTags, setPopularTags] = useState<TagItem[]>([]);

    useEffect(() => {
        tagService.list({ type: 'services', limit: 25 }).then((tags) => {
            if (tags && tags.length > 0) {
                setPopularTags(tags);
            }
        }).catch(() => {});
    }, []);

    const fetchServices = async (targetPage = 1, isLoadMore = false) => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (search.trim()) params.search = search.trim();
            if (selectedTag) params.tag = selectedTag;
            if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
            if (sortBy && sortBy !== 'latest') params.sort = sortBy;

            const res = await commissionServiceApi.list(targetPage, params);
            if (isLoadMore) {
                setServices((prev) => [...prev, ...res.data]);
            } else {
                setServices(res.data);
            }
            setMeta(res.meta ?? null);
            setPage(targetPage);
        } catch {
            toast.error('Failed to load commission services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices(1, false);
    }, [selectedTag, statusFilter, sortBy]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const nextParams = new URLSearchParams(searchParams);
        if (search.trim()) {
            nextParams.set('search', search.trim());
        } else {
            nextParams.delete('search');
        }
        setSearchParams(nextParams);
        fetchServices(1, false);
    };

    const handleSelectTag = (tagName: string) => {
        const nextParams = new URLSearchParams(searchParams);
        if (selectedTag.toLowerCase() === tagName.toLowerCase()) {
            setSelectedTag('');
            nextParams.delete('tag');
        } else {
            setSelectedTag(tagName);
            nextParams.set('tag', tagName);
        }
        setSearchParams(nextParams);
    };

    const handleClearFilters = () => {
        setSelectedTag('');
        setSearch('');
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('tag');
        nextParams.delete('search');
        setSearchParams(nextParams);
        fetchServices(1, false);
    };

    const loadMore = async () => {
        if (!meta || page >= meta.last_page || loading) return;
        fetchServices(page + 1, true);
    };

    return (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                        <ShoppingBag className="h-8 w-8 text-primary" />
                        Commission Store
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Browse verified artist commission services, packages, custom illustrations, and live slots.
                    </p>
                </div>
            </div>

            {/* Search & Tag Filter Section */}
            <div className="space-y-3.5">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search services by title, description, artist, or #tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-10 h-11 rounded-2xl bg-card border-border/80 text-xs sm:text-sm shadow-xs focus-visible:ring-primary/40"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    const nextParams = new URLSearchParams(searchParams);
                                    nextParams.delete('search');
                                    setSearchParams(nextParams);
                                    fetchServices(1, false);
                                }}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-full"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    <Button type="submit" className="h-11 px-5 rounded-2xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-sm">
                        <Filter className="h-3.5 w-3.5 mr-1.5" />
                        Search
                    </Button>
                </form>

                {/* Service Tag Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => handleSelectTag('')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                            !selectedTag
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
                        }`}
                    >
                        #All Services
                    </button>

                    {(popularTags.length > 0 ? popularTags.map((t) => t.name) : DEFAULT_SERVICE_TAGS).map((tagName) => {
                        const isSelected = selectedTag.toLowerCase() === tagName.toLowerCase();
                        return (
                            <button
                                key={tagName}
                                type="button"
                                onClick={() => handleSelectTag(tagName)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                                    isSelected
                                        ? 'bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/40'
                                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
                                }`}
                            >
                                <Hash className="h-3 w-3 opacity-70" />
                                {tagName}
                                {isSelected && <X className="h-3 w-3 ml-0.5" />}
                            </button>
                        );
                    })}
                </div>

                {/* Status Tabs & Sort Order Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/60 pt-3">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter('all');
                                const nextParams = new URLSearchParams(searchParams);
                                nextParams.delete('status');
                                setSearchParams(nextParams);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === 'all'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
                            }`}
                        >
                            All Status
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter('open');
                                const nextParams = new URLSearchParams(searchParams);
                                nextParams.set('status', 'open');
                                setSearchParams(nextParams);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === 'open'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
                            }`}
                        >
                            🟢 Open Slots
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter('closed');
                                const nextParams = new URLSearchParams(searchParams);
                                nextParams.set('status', 'closed');
                                setSearchParams(nextParams);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === 'closed'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
                            }`}
                        >
                            🔴 Closed
                        </button>
                    </div>

                    {/* Sort Order Selector */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-secondary/40 p-1 rounded-xl border border-border/60">
                        <span className="text-[11px] font-bold text-muted-foreground pl-2 flex items-center gap-1.5">
                            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                            Sort:
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                const nextSort = e.target.value;
                                setSortBy(nextSort);
                                const nextParams = new URLSearchParams(searchParams);
                                if (nextSort !== 'latest') {
                                    nextParams.set('sort', nextSort);
                                } else {
                                    nextParams.delete('sort');
                                }
                                setSearchParams(nextParams);
                            }}
                            className="h-8 px-2.5 rounded-lg bg-card border border-border text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
                        >
                            <option value="latest">⚡ Newest First</option>
                            <option value="price_asc">💵 Price: Low to High</option>
                            <option value="price_desc">💎 Price: High to Low</option>
                            <option value="title_asc">🔤 Title (A - Z)</option>
                            <option value="title_desc">🔤 Title (Z - A)</option>
                            <option value="oldest">⏳ Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Service Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && services.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="rounded-2xl overflow-hidden border border-border/80">
                            <Skeleton className="h-52 w-full rounded-t-2xl" />
                            <CardContent className="p-4 space-y-3">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                            </CardContent>
                        </Card>
                    ))
                ) : services.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-card rounded-3xl border border-dashed border-border p-8">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-bold text-foreground">
                            {selectedTag ? `No services found under #${selectedTag}` : search ? `No services matching "${search}"` : 'No commission services found'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 mb-6">
                            {selectedTag || search ? 'Try clearing your filters or selecting another tag.' : 'Check back later for newly published artist commission slots.'}
                        </p>
                        {(selectedTag || search) && (
                            <Button
                                onClick={handleClearFilters}
                                className="font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer"
                            >
                                Clear Filters & Show All
                            </Button>
                        )}
                    </div>
                ) : (
                    <AnimatePresence>
                        {services.map((service) => {
                            const artistUser = service.artist_profile?.user || (service as any).artistProfile?.user;
                            const minPrice = service.options && service.options.length > 0
                                ? Math.min(...service.options.map((o) => Number(o.base_price ?? o.price ?? 0)))
                                : null;

                            return (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Link to={`/store/${service.id}`} className="block h-full group">
                                        <Card className="h-full rounded-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-card border-border/80 shadow-xs hover:shadow-xl flex flex-col justify-between">
                                            <div>
                                                {/* Thumbnail Image */}
                                                <div className="h-52 bg-muted/40 relative overflow-hidden flex items-center justify-center">
                                                    {service.thumbnail_media?.url || (service.media && service.media[0]?.url) ? (
                                                        <img
                                                            src={service.thumbnail_media?.url || service.media?.[0]?.url}
                                                            alt={service.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1 text-muted-foreground text-xs font-semibold">
                                                            <Sparkles className="h-6 w-6 opacity-40" />
                                                            <span>Art Service</span>
                                                        </div>
                                                    )}

                                                    {/* Status Badge Overlay */}
                                                    <div className="absolute top-3 right-3 z-10">
                                                        <Badge
                                                            variant={service.status === 'open' ? 'secondary' : 'rose'}
                                                            className="text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs"
                                                        >
                                                            {service.status === 'open' ? '● Open' : 'Closed'}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Details Content */}
                                                <CardContent className="p-4 space-y-3">
                                                    {/* Artist Row */}
                                                    {artistUser && (
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <Avatar
                                                                size="sm"
                                                                fallback={artistUser.display_name || artistUser.username || '?'}
                                                                src={artistUser.avatar_url}
                                                                className="h-5 w-5 ring-1 ring-border shrink-0"
                                                            />
                                                            <span className="text-xs font-semibold text-muted-foreground truncate group-hover:text-foreground transition-colors">
                                                                {artistUser.display_name || artistUser.username}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                                        {service.name}
                                                    </h3>

                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {service.description}
                                                    </p>

                                                    {/* Tag Badges */}
                                                    {service.tags && service.tags.length > 0 && (
                                                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                            {service.tags.slice(0, 3).map((t) => (
                                                                <button
                                                                    key={t.id}
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleSelectTag(t.name);
                                                                    }}
                                                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                                                                        selectedTag.toLowerCase() === t.name.toLowerCase()
                                                                            ? 'bg-primary text-primary-foreground font-bold'
                                                                            : 'bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/50'
                                                                    }`}
                                                                >
                                                                    #{t.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </div>

                                            {/* Price Footer */}
                                            <div className="p-4 pt-0 border-t border-border/40 mt-auto flex items-center justify-between">
                                                <span className="text-[11px] text-muted-foreground font-medium">Starting from</span>
                                                {minPrice !== null ? (
                                                    <span className="text-sm font-extrabold text-primary">
                                                        {formatPrice(minPrice)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-semibold text-muted-foreground">Custom Quote</span>
                                                )}
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Load More */}
            {meta && meta.current_page < meta.last_page && (
                <div className="text-center pt-6">
                    <Button variant="outline" size="lg" onClick={loadMore} disabled={loading} className="rounded-2xl font-bold">
                        {loading ? 'Loading services...' : 'Load More Services'}
                    </Button>
                </div>
            )}
        </div>
    );
};
