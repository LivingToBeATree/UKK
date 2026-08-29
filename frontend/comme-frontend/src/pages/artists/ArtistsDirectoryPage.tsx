import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Star, Users } from 'lucide-react';
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
    const [artists, setArtists] = useState<ArtistProfile[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const fetchArtists = async (p: number) => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (search) params.search = search;
            const res = await artistProfileApi.list(p, params);
            setArtists(p === 1 ? res.data : [...artists, ...res.data]);
            setMeta(res.meta ?? null);
        } catch {
            toast.error('Failed to load artists');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchArtists(1); }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchArtists(1);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Artists</h1>
                <p className="text-muted-foreground mt-2">Discover talented artists in the Comme community</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search artists..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button type="submit">Search</Button>
            </form>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading && artists.length === 0 ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6 flex flex-col items-center space-y-3">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </CardContent>
                        </Card>
                    ))
                ) : artists.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">No artists found</p>
                    </div>
                ) : (
                    artists.map((artist) => (
                        <motion.div key={artist.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Link to={`/artists/${artist.id}`}>
                                <Card className="h-full hover:border-primary/40 transition-all hover:-translate-y-1">
                                    <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                                        <Avatar
                                            size="lg"
                                            fallback={artist.user?.display_name || artist.user?.username || 'A'}
                                            src={artist.user?.avatar_url}
                                        />
                                        <div>
                                            <h3 className="font-bold text-sm">
                                                {artist.user?.display_name || artist.user?.username}
                                            </h3>
                                            {artist.bio && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{artist.bio}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="text-[10px]">
                                                {artist.commission_status}
                                            </Badge>
                                            {artist.rating_avg && (
                                                <span className="flex items-center gap-1 text-xs text-amber-400">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    {artist.rating_avg.toFixed(1)}
                                                </span>
                                            )}
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
                    <Button variant="outline" onClick={() => { setPage(page + 1); fetchArtists(page + 1); }} disabled={loading}>
                        Load More
                    </Button>
                </div>
            )}
        </div>
    );
};
