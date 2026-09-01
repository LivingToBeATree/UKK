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
import { MarkdownContent } from '@/components/ui/markdown-content';
import type { Post, PaginationMeta } from '@/types';

function formatPostDate(dateStr?: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const now = Date.now();
    const diffSecs = Math.floor((now - date.getTime()) / 1000);
    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
}

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
                    p.id === postId
                        ? { ...p, is_liked: res.liked, likes_count: res.likes_count }
                        : p
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
            toast.success(res.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
        } catch {
            toast.error('Failed to bookmark post');
        }
    };

    return (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        Artwork Feed
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Explore creative processes, illustrations, concept art, sketches, and commission announcements.
                    </p>
                </div>
                {isAuthenticated ? (
                    <Link to="/posts/create">
                        <Button className="font-bold shadow-sm">
                            <Plus className="h-4 w-4 mr-2" /> Create Post
                        </Button>
                    </Link>
                ) : (
                    <Button onClick={() => requireAuth('generic')} className="font-bold shadow-sm">
                        <Plus className="h-4 w-4 mr-2" /> Create Post
                    </Button>
                )}
            </div>

            {/* Content Feed */}
            {loading && posts.length === 0 ? (
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="break-inside-avoid mb-4">
                            <Skeleton
                                className={`w-full rounded-2xl ${
                                    i % 2 === 0 ? 'h-64' : 'h-80'
                                }`}
                            />
                        </div>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                /* Empty state */
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
                    </div>
                </div>
            ) : (
                /* Masonry Artwork Grid */
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
                    <AnimatePresence>
                        {posts.map((post) => {
                            const mediaUrl =
                                (post.media && post.media[0] ? post.media[0].url : null) ||
                                post.portfolio?.cover_image_url ||
                                post.portfolio?.media?.[0]?.url;

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
                                        className="group relative block rounded-2xl overflow-hidden bg-card border border-border/80 hover:border-primary/50 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    >
                                        {/* 1. Content Body or Artwork Image */}
                                        {mediaUrl ? (
                                            <div className="relative w-full overflow-hidden bg-muted">
                                                <img
                                                    src={mediaUrl}
                                                    alt={post.content || 'Artwork'}
                                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
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
                                            <div className="p-5 bg-gradient-to-br from-primary/5 via-card to-secondary/30 min-h-[120px]">
                                                <MarkdownContent content={post.content} className="text-sm line-clamp-6" />
                                            </div>
                                        )}

                                        {/* 2. Below the line: Uploader info & Actions */}
                                        <div className="p-3.5 border-t border-border/70 bg-card/95 space-y-2.5">
                                            {/* Uploader Row */}
                                            <div className="flex items-center justify-between gap-2 min-w-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Avatar
                                                        size="sm"
                                                        fallback={post.user?.display_name || post.user?.username || '?'}
                                                        src={post.user?.avatar_url}
                                                        className="h-6 w-6 shrink-0 ring-1 ring-border"
                                                    />
                                                    <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                        {post.user?.display_name || post.user?.username}
                                                    </span>
                                                </div>
                                                {post.created_at && (
                                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                                        {formatPostDate(post.created_at)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action Buttons Row */}
                                            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                                                <div className="flex items-center gap-3">
                                                    {/* Like Button (Hearts go RED when liked) */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleLike(e, post.id)}
                                                        className={`flex items-center gap-1 transition-transform active:scale-125 cursor-pointer ${
                                                            post.is_liked
                                                                ? 'text-rose-500 font-bold'
                                                                : 'text-muted-foreground hover:text-rose-500'
                                                        }`}
                                                        aria-label="Like"
                                                    >
                                                        <Heart
                                                            className={`h-3.5 w-3.5 ${
                                                                post.is_liked ? 'fill-rose-500 text-rose-500' : ''
                                                            }`}
                                                        />
                                                        <span className="text-[11px]">
                                                            {post.likes_count || 0}
                                                        </span>
                                                    </button>

                                                    {/* Comments Count */}
                                                    <span className="flex items-center gap-1 text-muted-foreground text-[11px]">
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                        <span>{post.comments_count || 0}</span>
                                                    </span>
                                                </div>

                                                {/* Bookmark Button (Bookmarks go BLUE when bookmarked) */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleBookmark(e, post.id)}
                                                    className={`flex items-center gap-1 transition-transform active:scale-125 cursor-pointer ${
                                                        post.is_bookmarked
                                                            ? 'text-blue-500 font-bold'
                                                            : 'text-muted-foreground hover:text-blue-500'
                                                    }`}
                                                    aria-label="Bookmark"
                                                >
                                                    <Bookmark
                                                        className={`h-3.5 w-3.5 ${
                                                            post.is_bookmarked ? 'fill-blue-500 text-blue-500' : ''
                                                        }`}
                                                    />
                                                    <span className="text-[11px]">
                                                        {post.bookmarks_count || 0}
                                                    </span>
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
