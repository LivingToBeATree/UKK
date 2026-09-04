import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Star, Users, ArrowUpDown, X } from 'lucide-react';
import { artistProfileApi } from '@/services/artistService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { ArtistProfile, PaginationMeta } from '@/types';

export const ArtistsDirectoryPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';
    const initialSort = searchParams.get('sort') || 'newest';

    const [artists, setArtists] = useState<ArtistProfile[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(initialSearch);
    const [sortBy, setSortBy] = useState(initialSort);
    const [page, setPage] = useState(1);

    const fetchArtists = async (targetPage = 1, isLoadMore = false) => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (search.trim()) params.search = search.trim();
            if (sortBy && sortBy !== 'newest') params.sort = sortBy;

            const res = await artistProfileApi.list(targetPage, params);
            if (isLoadMore) {
                setArtists((prev) => [...prev, ...res.data]);
            } else {
                setArtists(res.data);
            }
            setMeta(res.meta ?? null);
            setPage(targetPage);
        } catch {
            toast.error('Failed to load artists');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtists(1, false);
    }, [sortBy]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const nextParams = new URLSearchParams(searchParams);
        if (search.trim()) {
            nextParams.set('search', search.trim());
        } else {
            nextParams.delete('search');
        }
        setSearchParams(nextParams);
        fetchArtists(1, false);
    };

    const handleClearSearch = () => {
        setSearch('');
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('search');
        setSearchParams(nextParams);
        fetchArtists(1, false);
    };

    const loadMore = async () => {
        if (!meta || page >= meta.last_page || loading) return;
        fetchArtists(page + 1, true);
    };

    return (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                        <Users className="h-8 w-8 text-primary" />
                        Artist Directory
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Discover verified illustration masters, VTuber riggers, comic creators, and freelance artists.
                    </p>
                </div>
            </div>

            {/* Search & Sort Controls */}
            <div className="space-y-3.5">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search artists by name, bio, location, or skills..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-10 h-11 rounded-2xl bg-card border-border/80 text-xs sm:text-sm shadow-xs focus-visible:ring-primary/40"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-full"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    <Button type="submit" className="h-11 px-6 rounded-2xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-sm">
                        Search
                    </Button>
                </form>

                {/* Sort Order Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                        {artists.length} {artists.length === 1 ? 'artist' : 'artists'} available
                    </p>

                    <div className="flex items-center gap-2 bg-secondary/40 p-1 rounded-xl border border-border/60">
                        <span className="text-[11px] font-bold text-muted-foreground pl-2 flex items-center gap-1.5">
                            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                            Sort Order:
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                const nextSort = e.target.value;
                                setSortBy(nextSort);
                                const nextParams = new URLSearchParams(searchParams);
                                if (nextSort !== 'newest') {
                                    nextParams.set('sort', nextSort);
                                } else {
                                    nextParams.delete('sort');
                                }
                                setSearchParams(nextParams);
                            }}
                            className="h-8 px-2.5 rounded-lg bg-card border border-border text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
                        >
                            <option value="newest">⚡ Newest Joined</option>
                            <option value="rating">⭐ Highest Rated</option>
                            <option value="reviews">💬 Most Reviews</option>
                            <option value="name_asc">🔤 Name (A - Z)</option>
                            <option value="name_desc">🔤 Name (Z - A)</option>
                            <option value="oldest">⏳ Oldest Members</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Artists Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                {loading && artists.length === 0 ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i} className="rounded-2xl border border-border/80">
                            <CardContent className="p-6 flex flex-col items-center space-y-3">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-40" />
                            </CardContent>
                        </Card>
                    ))
                ) : artists.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-card rounded-3xl border border-dashed border-border p-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-bold text-foreground">No artists found</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {search ? `No artist matching "${search}". Try searching another keyword.` : 'No verified artists have registered yet.'}
                        </p>
                        {search && (
                            <Button size="sm" variant="outline" onClick={handleClearSearch} className="mt-4 rounded-xl">
                                Clear Search
                            </Button>
                        )}
                    </div>
                ) : (
                    artists.map((artist) => (
                        <motion.div key={artist.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Link to={artist.user?.username ? `/users/${artist.user.username}` : `/artists/${artist.id}`}>
                                <Card className="h-full hover:border-primary/50 transition-all hover:-translate-y-1 rounded-2xl bg-card border-border/80 group">
                                    <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                                        <Avatar
                                            size="lg"
                                            fallback={artist.user?.display_name || artist.user?.username || 'A'}
                                            src={artist.user?.avatar_url}
                                            className="h-20 w-20 ring-2 ring-border group-hover:ring-primary/50 transition-all"
                                        />
                                        <div>
                                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                                                {artist.user?.display_name || artist.user?.username}
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-mono">@{artist.user?.username}</p>
                                            {artist.bio && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">{artist.bio}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
                                            <Badge variant={artist.commission_status === 'open' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                                                {artist.commission_status === 'open' ? '🟢 Open' : '🔴 Closed'}
                                            </Badge>
                                            {artist.rating_avg ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    {artist.rating_avg.toFixed(1)}
                                                </span>
                                            ) : null}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>

            {meta && meta.current_page < meta.last_page && (
                <div className="text-center mt-8">
                    <Button variant="outline" onClick={loadMore} disabled={loading} className="rounded-2xl px-6">
                        Load More Artists
                    </Button>
                </div>
            )}
        </div>
    );
};

