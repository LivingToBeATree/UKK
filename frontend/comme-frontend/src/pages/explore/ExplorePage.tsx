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
    Palette,
    Video,
    FileText,
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

// ── Auto-Rotating Card Media Component ──
const PostCardMedia: React.FC<{ post: Post }> = ({ post }) => {
    const mediaList =
        post.media && post.media.length > 0
            ? post.media
            : post.portfolio?.media && post.portfolio.media.length > 0
            ? post.portfolio.media.map((m: any) => ({
                  id: m.id,
                  url: m.url,
                  media_type: m.media_type || 'image',
                  mime_type: m.mime_type || 'image/jpeg',
              }))
            : (post.portfolio as any)?.thumbnail_media?.url
            ? [
                  {
                      id: 0,
                      url: (post.portfolio as any).thumbnail_media.url,
                      media_type: 'image',
                      mime_type: 'image/jpeg',
                  },
              ]
            : post.portfolio?.cover_image_url
            ? [
                  {
                      id: 0,
                      url: post.portfolio.cover_image_url,
                      media_type: 'image',
                      mime_type: 'image/jpeg',
                  },
              ]
            : [];

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto rotate every 5 seconds (5000ms) if multiple items
    useEffect(() => {
        if (mediaList.length <= 1) return;

        const interval = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % mediaList.length);
        }, 5000);

        return () => window.clearInterval(interval);
    }, [mediaList.length]);

    if (mediaList.length === 0) return null;

    const currentMedia = mediaList[currentIndex] || mediaList[0];
    const isVideo =
        currentMedia.media_type === 'video' ||
        currentMedia.mime_type?.includes('video') ||
        (typeof currentMedia.url === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(currentMedia.url));
    const isGif =
        currentMedia.mime_type?.includes('gif') ||
        (typeof currentMedia.url === 'string' && /\.gif$/i.test(currentMedia.url));

    return (
        <div className="relative w-full overflow-hidden bg-secondary/30 flex items-center justify-center select-none group/media">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMedia.url + currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full flex items-center justify-center"
                >
                    {isVideo ? (
                        <video
                            src={currentMedia.url}
                            muted
                            autoPlay
                            loop
                            playsInline
                            className="w-full h-auto max-h-[560px] object-cover"
                        />
                    ) : (
                        <img
                            src={currentMedia.url}
                            alt={post.content || post.portfolio?.title || 'Artwork'}
                            className="w-full h-auto max-h-[560px] object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Badges: Left (VIDEO / GIF), Right (Stack Counter) */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
                {isVideo ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-black flex items-center gap-1 shadow-md backdrop-blur-md">
                        <Video className="h-3 w-3" /> VIDEO
                    </span>
                ) : isGif ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-600/90 text-white text-[10px] font-black flex items-center gap-1 shadow-md backdrop-blur-md">
                        GIF
                    </span>
                ) : null}
            </div>

            {/* Multiple media indicator */}
            {mediaList.length > 1 && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-md z-10 pointer-events-none">
                    <Layers className="h-3 w-3 text-purple-300" />
                    <span>
                        {currentIndex + 1}/{mediaList.length}
                    </span>
                </div>
            )}
        </div>
    );
};

export const ExplorePage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { requireAuth } = useAuthModal();
    const [posts, setPosts] = useState<Post[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [activeCategory, setActiveCategory] = useState<'all' | 'artwork' | 'posts'>('all');

    const loadMore = async () => {
        if (!meta || page >= meta.last_page || loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        try {
            setLoading(true);
            const res = await postService.list(nextPage);
            setPosts((prev) => [...prev, ...(res.data || [])]);
            setMeta(res.meta || null);
        } catch {
            toast.error('Failed to load more posts');
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialPosts = async () => {
        try {
            setLoading(true);
            const res = await postService.list(1);
            setPosts(res.data || []);
            setMeta(res.meta || null);
        } catch {
            toast.error('Failed to load explore feed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialPosts();
    }, []);

    const handleLike = async (e: React.MouseEvent, postId: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!requireAuth('like')) return;

        try {
            const res = await postService.toggleLike(postId);
            const isLiked = res.is_liked ?? res.liked ?? false;

            setPosts((prev) =>
                prev.map((p) => {
                    if (p.id === postId) {
                        return {
                            ...p,
                            is_liked: isLiked,
                            likes_count:
                                res.likes_count ??
                                (isLiked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 0) - 1)),
                        };
                    }
                    return p;
                })
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
            const isBookmarked = res.is_bookmarked ?? res.bookmarked ?? false;

            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? {
                              ...p,
                              is_bookmarked: isBookmarked,
                              bookmarks_count:
                                  res.bookmarks_count ??
                                  (isBookmarked
                                      ? (p.bookmarks_count || 0) + 1
                                      : Math.max(0, (p.bookmarks_count || 0) - 1)),
                          }
                        : p
                )
            );
            toast.success(isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
        } catch {
            toast.error('Failed to bookmark post');
        }
    };

    const isPostArtwork = (p: Post) =>
        Boolean(
            (p.media && p.media.length > 0) ||
            p.portfolio_id ||
            p.portfolio?.id ||
            (p.portfolio as any)?.thumbnail_media?.url ||
            p.portfolio?.cover_image_url ||
            (p.portfolio?.media && p.portfolio.media.length > 0)
        );

    const filteredPosts = posts.filter((post) => {
        const isArt = isPostArtwork(post);
        if (activeCategory === 'posts') return !isArt;
        if (activeCategory === 'artwork') return isArt;
        return true;
    });

    const artworkCount = posts.filter(isPostArtwork).length;
    const postsCount = posts.length - artworkCount;

    return (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        Artwork Feed & Explore
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Discover community artwork illustrations, concept pieces, crafts, and creator discussions.
                    </p>
                </div>
                {isAuthenticated ? (
                    <Link to="/posts/create">
                        <Button className="font-bold shadow-md rounded-2xl bg-purple-600 hover:bg-purple-700 text-white">
                            <Plus className="h-4 w-4 mr-2" /> Create Post / Artwork
                        </Button>
                    </Link>
                ) : (
                    <Button
                        onClick={() => requireAuth('generic')}
                        className="font-bold shadow-md rounded-2xl bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Create Post / Artwork
                    </Button>
                )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeCategory === 'all'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
                    }`}
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    All
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/20 font-semibold">
                        {posts.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveCategory('artwork')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeCategory === 'artwork'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
                    }`}
                >
                    <Palette className="h-3.5 w-3.5" />
                    Artwork Showcase
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/20 font-semibold">
                        {artworkCount}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveCategory('posts')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeCategory === 'posts'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
                    }`}
                >
                    <FileText className="h-3.5 w-3.5" />
                    Discussions
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/20 font-semibold">
                        {postsCount}
                    </span>
                </button>
            </div>

            {/* Masonry Artwork Grid Feed */}
            {loading && posts.length === 0 ? (
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-card border border-border/80">
                            <Skeleton className={`w-full ${i % 2 === 0 ? 'h-72' : 'h-48'} rounded-none`} />
                            <div className="p-3.5 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border p-8">
                    <Palette className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-bold text-foreground">No artworks or posts found</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-6">
                        Be the first to share your artwork illustration or start a discussion!
                    </p>
                    {isAuthenticated ? (
                        <Link to="/posts/create">
                            <Button className="font-bold rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                                <Sparkles className="h-4 w-4 mr-2" /> Upload Artwork
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={() => requireAuth('generic')}
                            className="font-bold rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                        >
                            <Sparkles className="h-4 w-4 mr-2" /> Upload Artwork
                        </Button>
                    )}
                </div>
            ) : (
                /* Pure Landing-Page Style Masonry Artwork Grid */
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
                    <AnimatePresence>
                        {filteredPosts.map((post) => {
                            const hasMedia = isPostArtwork(post);

                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="break-inside-avoid mb-4"
                                >
                                    <Link
                                        to={`/posts/${post.id}`}
                                        className="group relative block rounded-2xl overflow-hidden bg-card border border-border/80 hover:border-purple-500/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                                    >
                                        {hasMedia ? (
                                            /* ── Artwork Card (Full Bleed Image with Bottom Overlay like Landing Page) ── */
                                            <div className="relative w-full overflow-hidden">
                                                <PostCardMedia post={post} />

                                                {/* Bottom Floating Dark Gradient Overlay */}
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 text-white flex flex-col justify-end gap-2 z-20">
                                                    {/* Post / Artwork Caption */}
                                                    {post.content && (
                                                        <p className="text-xs font-semibold text-white/95 line-clamp-2 drop-shadow-md leading-relaxed">
                                                            {post.content}
                                                        </p>
                                                    )}

                                                    {/* Author Row & Glassmorphic Action Buttons */}
                                                    <div className="flex items-center justify-between gap-2 pt-0.5">
                                                        {/* Uploader Avatar + Name */}
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <Avatar
                                                                size="sm"
                                                                fallback={post.user?.display_name || post.user?.username || '?'}
                                                                src={post.user?.avatar_url}
                                                                className="h-6 w-6 shrink-0 ring-1 ring-white/40 shadow-sm"
                                                            />
                                                            <div className="min-w-0">
                                                                <span className="text-xs font-bold text-white truncate block group-hover:text-purple-300 transition-colors drop-shadow-sm">
                                                                    {post.user?.display_name || post.user?.username}
                                                                </span>
                                                                {post.created_at && (
                                                                    <span className="text-[9px] text-white/70 block drop-shadow-sm font-medium">
                                                                        {formatPostDate(post.created_at)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Floating Glassmorphism Actions */}
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {/* Like Button */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleLike(e, post.id)}
                                                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                                                                    post.is_liked
                                                                        ? 'bg-rose-600 text-white font-bold shadow-md scale-105'
                                                                        : 'bg-black/45 hover:bg-black/70 text-white/90 border border-white/10'
                                                                }`}
                                                                aria-label="Like"
                                                            >
                                                                <Heart
                                                                    className={`h-3 w-3 ${
                                                                        post.is_liked ? 'fill-white text-white' : ''
                                                                    }`}
                                                                />
                                                                <span className="text-[10px]">
                                                                    {post.likes_count || 0}
                                                                </span>
                                                            </button>

                                                            {/* Comments Count */}
                                                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/45 backdrop-blur-md text-white/90 text-[10px] border border-white/10">
                                                                <MessageSquare className="h-3 w-3" />
                                                                <span>{post.comments_count || 0}</span>
                                                            </span>

                                                            {/* Bookmark Button */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleBookmark(e, post.id)}
                                                                className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                                                                    post.is_bookmarked
                                                                        ? 'bg-blue-600 text-white shadow-md'
                                                                        : 'bg-black/45 hover:bg-black/70 text-white/90 border border-white/10'
                                                                }`}
                                                                aria-label="Bookmark"
                                                            >
                                                                <Bookmark
                                                                    className={`h-3 w-3 ${
                                                                        post.is_bookmarked ? 'fill-white text-white' : ''
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ── Text-Only Discussion Card ── */
                                            <div className="p-4 bg-gradient-to-br from-purple-500/10 via-card to-card space-y-3">
                                                {/* Author Header */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Avatar
                                                            size="sm"
                                                            fallback={post.user?.display_name || post.user?.username || '?'}
                                                            src={post.user?.avatar_url}
                                                            className="h-6 w-6 shrink-0 ring-1 ring-border"
                                                        />
                                                        <span className="text-xs font-bold text-foreground truncate group-hover:text-purple-400 transition-colors">
                                                            {post.user?.display_name || post.user?.username}
                                                        </span>
                                                    </div>
                                                    {post.created_at && (
                                                        <span className="text-[10px] text-muted-foreground shrink-0">
                                                            {formatPostDate(post.created_at)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Markdown Content */}
                                                <div className="py-1">
                                                    <MarkdownContent
                                                        content={post.content}
                                                        className="text-xs line-clamp-5 leading-relaxed text-foreground/90"
                                                    />
                                                </div>

                                                {/* Action Buttons Row */}
                                                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleLike(e, post.id)}
                                                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                                                                post.is_liked
                                                                    ? 'text-rose-500 font-bold bg-rose-500/10'
                                                                    : 'text-muted-foreground hover:text-rose-500'
                                                            }`}
                                                        >
                                                            <Heart
                                                                className={`h-3 w-3 ${
                                                                    post.is_liked ? 'fill-rose-500 text-rose-500' : ''
                                                                }`}
                                                            />
                                                            <span className="text-[11px]">{post.likes_count || 0}</span>
                                                        </button>

                                                        <span className="flex items-center gap-1 text-muted-foreground text-[11px] px-1">
                                                            <MessageSquare className="h-3 w-3" />
                                                            <span>{post.comments_count || 0}</span>
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleBookmark(e, post.id)}
                                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                            post.is_bookmarked
                                                                ? 'text-blue-500 bg-blue-500/10'
                                                                : 'text-muted-foreground hover:text-blue-500'
                                                        }`}
                                                    >
                                                        <Bookmark
                                                            className={`h-3 w-3 ${
                                                                post.is_bookmarked ? 'fill-blue-500 text-blue-500' : ''
                                                            }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
                    <Button variant="outline" size="lg" onClick={loadMore} disabled={loading} className="rounded-2xl font-bold">
                        {loading ? 'Loading artworks...' : 'Load More Artworks'}
                    </Button>
                </div>
            )}
        </div>
    );
};
