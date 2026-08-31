import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Heart,
    MessageSquare,
    Bookmark,
    Plus,
    Layers,
    Sparkles,
    Image as ImageIcon,
} from 'lucide-react';
import { postService } from '@/services/postService';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { Post, PaginationMeta } from '@/types';

export const ExplorePage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { requireAuth } = useAuthModal();
    const [posts, setPosts] = useState<Post[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const loadMore = async () => {
        const nextPage = page + 1;
        try {
            const res = await postService.list(nextPage);
            setPosts((prev) => [...prev, ...res.data]);
            setMeta(res.meta ?? null);
            setPage(nextPage);
        } catch {
            toast.error('Failed to load more posts');
        }
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const res = await postService.list(1);
                if (isMounted) {
                    setPosts(res.data);
                    setMeta(res.meta ?? null);
                }
            } catch {
                if (isMounted) toast.error('Failed to load artwork feed');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleLike = async (e: React.MouseEvent, postId: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!requireAuth('like')) return;
        try {
            const res = await postService.toggleLike(postId);
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId ? { ...p, is_liked: res.liked, likes_count: res.likes_count } : p
                )
            );
        } catch {
            toast.error('Failed to like post');
        }
    };

    const handleBookmark = async (e: React.MouseEvent, postId: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!requireAuth('bookmark')) return;
        try {
            const res = await postService.toggleBookmark(postId);
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? {
                              ...p,
                              is_bookmarked: res.bookmarked,
                              bookmarks_count: res.bookmarked
                                  ? (p.bookmarks_count || 0) + 1
                                  : Math.max(0, (p.bookmarks_count || 1) - 1),
                          }
                        : p
                )
            );
        } catch {
            toast.error('Failed to bookmark');
        }
    };

    return (
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Artwork Feed
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        Discover original illustrations, character designs, and creative artwork from independent creators
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <Link to="/posts/create">
                            <Button className="font-semibold shadow-md">
                                <Plus className="h-4 w-4 mr-2" /> Share Artwork
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={() => requireAuth('generic')}
                            className="font-semibold shadow-md"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Share Artwork
                        </Button>
                    )}
                </div>
            </div>

            {/* Masonry Feed Container */}
            {loading && posts.length === 0 ? (
                /* Loading Skeletons */
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
                    {[280, 360, 240, 420, 310, 260, 390, 300].map((height, i) => (
                        <div key={i} className="break-inside-avoid mb-4">
                            <Skeleton
                                style={{ height: `${height}px` }}
                                className="w-full rounded-2xl"
                            />
                        </div>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                /* Rich Empty State */
                <div className="rounded-3xl border border-border/80 bg-card/60 p-12 text-center max-w-2xl mx-auto my-12 space-y-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                        <ImageIcon className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-foreground">No artworks shared yet</h2>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                            Be the first creator to showcase your art, concept designs, sketches, or 3D models with the community!
                        </p>
                    </div>
                    <div className="flex justify-center gap-3 pt-2">
                        {isAuthenticated ? (
                            <Link to="/posts/create">
                                <Button className="font-bold">
                                    <Sparkles className="h-4 w-4 mr-2" /> Create First Post
                                </Button>
                            </Link>
                        ) : (
                            <Button onClick={() => requireAuth('generic')} className="font-bold">
                                <Sparkles className="h-4 w-4 mr-2" /> Create First Post
                            </Button>
                        )}
                        <Link to="/store">
                            <Button variant="outline">Browse Store</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                /* Masonry Artwork Grid */
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
                    <AnimatePresence>
                        {posts.map((post) => {
                            const mediaUrl = post.media && post.media[0] ? post.media[0].url : null;

                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="break-inside-avoid mb-4"
                                >
                                    <Link
                                        to={`/posts/${post.id}`}
                                        className="group relative block rounded-2xl overflow-hidden bg-card border border-border/70 hover:border-primary/50 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
                                    >
                                        {/* Image Display or Text-Only Creative Canvas */}
                                        {mediaUrl ? (
                                            <div className="relative w-full overflow-hidden bg-muted">
                                                <img
                                                    src={mediaUrl}
                                                    alt={post.content || 'Artwork'}
                                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                    loading="lazy"
                                                />
                                                {post.media && post.media.length > 1 && (
                                                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                                                        <Layers className="h-3 w-3" />
                                                        <span>+{post.media.length - 1}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-gradient-to-br from-primary/15 via-accent/10 to-secondary min-h-[180px] flex flex-col justify-between">
                                                <p className="text-sm font-medium leading-relaxed text-foreground line-clamp-4 italic">
                                                    "{post.content}"
                                                </p>
                                                <div className="pt-4 flex items-center gap-2">
                                                    <Avatar
                                                        size="sm"
                                                        fallback={post.user?.display_name || post.user?.username || '?'}
                                                        src={post.user?.avatar_url}
                                                    />
                                                    <span className="text-xs font-semibold text-foreground/80">
                                                        {post.user?.display_name || post.user?.username}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bottom Editorial Hover/Persistent Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3.5 pt-8 opacity-95 group-hover:opacity-100 transition-opacity flex flex-col justify-end text-white">
                                            {/* Author Info & Post Snippet */}
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Avatar
                                                    size="sm"
                                                    fallback={post.user?.display_name || post.user?.username || '?'}
                                                    src={post.user?.avatar_url}
                                                    className="border border-white/30 shrink-0 h-6 w-6"
                                                />
                                                <span className="text-xs font-bold text-white truncate drop-shadow-sm">
                                                    {post.user?.display_name || post.user?.username}
                                                </span>
                                            </div>

                                            {post.content && (
                                                <p className="text-[11px] text-white/85 line-clamp-2 leading-tight mb-2 font-normal drop-shadow-xs">
                                                    {post.content}
                                                </p>
                                            )}

                                            {/* Interactive Stats & Actions Strip */}
                                            <div className="flex items-center justify-between pt-1.5 border-t border-white/20 text-xs">
                                                <div className="flex items-center gap-3">
                                                    {/* Like Button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleLike(e, post.id)}
                                                        className={`flex items-center gap-1 transition-transform active:scale-125 cursor-pointer ${
                                                            post.is_liked
                                                                ? 'text-rose-400 font-bold'
                                                                : 'text-white/80 hover:text-rose-400'
                                                        }`}
                                                        aria-label="Like"
                                                    >
                                                        <Heart
                                                            className={`h-3.5 w-3.5 ${
                                                                post.is_liked ? 'fill-current' : ''
                                                            }`}
                                                        />
                                                        <span className="text-[11px]">
                                                            {post.likes_count || 0}
                                                        </span>
                                                    </button>

                                                    {/* Comments Count */}
                                                    <span className="flex items-center gap-1 text-white/80 text-[11px]">
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                        <span>{post.comments_count || 0}</span>
                                                    </span>
                                                </div>

                                                {/* Bookmark Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleBookmark(e, post.id)}
                                                    className={`transition-transform active:scale-125 cursor-pointer p-0.5 ${
                                                        post.is_bookmarked
                                                            ? 'text-amber-400'
                                                            : 'text-white/80 hover:text-amber-400'
                                                    }`}
                                                    aria-label="Bookmark"
                                                >
                                                    <Bookmark
                                                        className={`h-3.5 w-3.5 ${
                                                            post.is_bookmarked ? 'fill-current' : ''
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Load More Button */}
            {meta && meta.current_page < meta.last_page && (
                <div className="text-center pt-8 pb-4">
                    <Button variant="outline" size="lg" onClick={loadMore} disabled={loading}>
                        {loading ? 'Loading artworks...' : 'Load More Artworks'}
                    </Button>
                </div>
            )}
        </div>
    );
};
