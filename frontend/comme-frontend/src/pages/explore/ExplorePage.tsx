import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    TrendingUp,
    Hash,
    MoreHorizontal,
    Flag,
    Share2,
    Shield,
    ShieldAlert,
    Lock,
    Pencil,
    Trash2,
    ArrowUpDown,
} from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';
import { ReportModal } from '@/components/modals/ReportModal';
import { EditPostModal } from '@/components/modals/EditPostModal';
import { EditPortfolioModal } from '@/components/modals/EditPortfolioModal';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { postService } from '@/services/postService';
import { tagService, type TagItem } from '@/services/tagService';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { MarkdownContent } from '@/components/ui/markdown-content';
import type { Post, PaginationMeta } from '@/types';

const DEFAULT_FEATURED_TAGS = [
    'Anime',
    'Illustration',
    'CharacterDesign',
    'DigitalArt',
    'Chibi',
    'VTuber',
    'ConceptArt',
    'Fantasy',
    'PixelArt',
    'FanArt',
    'Landscape',
    '3D',
];

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

const isPostArtwork = (post: Post) => {
    return (
        Boolean(post.portfolio_id) ||
        Boolean(post.portfolio?.id) ||
        Boolean((post.portfolio as any)?.thumbnail_media?.url) ||
        Boolean(post.user?.artist_profile)
    );
};

// ── Auto-Rotating / Shuffling Card Media Component ──
const PostCardMedia: React.FC<{ post: Post }> = ({ post }) => {
    const isArtwork = isPostArtwork(post);

    // If it's an artwork post, ONLY use the artwork thumbnail / cover (never rotate)
    const getArtworkMedia = () => {
        if ((post.portfolio as any)?.thumbnail_media?.url) {
            return [{ id: 0, url: (post.portfolio as any).thumbnail_media.url, media_type: 'image', mime_type: 'image/jpeg' }];
        }
        if (post.portfolio?.cover_image_url) {
            return [{ id: 0, url: post.portfolio.cover_image_url, media_type: 'image', mime_type: 'image/jpeg' }];
        }
        if (post.portfolio?.media && post.portfolio.media.length > 0) {
            const first = post.portfolio.media[0];
            return [{ id: first.id, url: first.url, media_type: (first as any).media_type || 'image', mime_type: (first as any).mime_type || 'image/jpeg' }];
        }
        if (post.media && post.media.length > 0) {
            const first = post.media[0];
            return [{ id: first.id, url: first.url, media_type: first.media_type || 'image', mime_type: (first as any).mime_type || 'image/jpeg' }];
        }
        return [];
    };

    const mediaList = isArtwork
        ? getArtworkMedia()
        : (post.media && post.media.length > 0 ? post.media : []);

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto rotate every 5 seconds for regular multi-media posts ONLY (never rotate for artworks)
    useEffect(() => {
        if (isArtwork || mediaList.length <= 1) return;

        const interval = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % mediaList.length);
        }, 5000);

        return () => window.clearInterval(interval);
    }, [isArtwork, mediaList.length]);

    if (mediaList.length === 0) return null;

    const currentMedia = mediaList[currentIndex] || mediaList[0];
    const isVideo =
        currentMedia.media_type === 'video' ||
        currentMedia.mime_type?.includes('video') ||
        (typeof currentMedia.url === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(currentMedia.url));
    const isGif =
        currentMedia.mime_type?.includes('gif') ||
        (typeof currentMedia.url === 'string' && /\.gif$/i.test(currentMedia.url));

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % mediaList.length);
    };

    return (
        <div
            className={`relative w-full overflow-hidden flex items-center justify-center select-none group/media ${
                isArtwork ? 'bg-black/20' : 'rounded-2xl bg-black/40 border border-border/60 my-1'
            }`}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMedia.url + currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-full flex items-center justify-center overflow-hidden ${
                        isArtwork ? 'h-auto min-h-[200px]' : 'w-full h-full min-h-[180px] max-h-[460px]'
                    }`}
                >
                    {isVideo ? (
                        <video
                            src={currentMedia.url}
                            muted
                            autoPlay
                            loop
                            playsInline
                            className={`w-full h-auto object-cover ${isArtwork ? '' : 'max-h-[460px]'}`}
                        />
                    ) : (
                        <img
                            src={currentMedia.url}
                            alt={post.content || post.portfolio?.title || 'Post media'}
                            className={`w-full h-auto object-cover transition-transform duration-500 group-hover/media:scale-105 ${
                                isArtwork ? 'w-full h-auto block' : 'max-h-[460px]'
                            }`}
                            loading="lazy"
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Badges: Left (VIDEO / GIF), Right (Stack Counter) */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
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

            {/* Multiple media indicators & interactive navigation */}
            {mediaList.length > 1 && (
                <>
                    {/* Top right indicator badge: e.g. 1/8 */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-md z-10 pointer-events-none">
                        <Layers className="h-3 w-3 text-purple-300" />
                        <span>
                            {currentIndex + 1}/{mediaList.length}
                        </span>
                    </div>

                    {/* Left / Right Chevron Controls on Hover */}
                    <button
                        type="button"
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity duration-200 z-10 cursor-pointer shadow-md"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity duration-200 z-10 cursor-pointer shadow-md"
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Bottom Progress Indicator Dots */}
                    <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10 px-4">
                        {mediaList.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCurrentIndex(idx);
                                }}
                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    idx === currentIndex
                                        ? 'w-5 bg-white shadow-sm'
                                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                                }`}
                                title={`Media ${idx + 1} of ${mediaList.length}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export const ExplorePage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { requireAuth } = useAuthModal();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialTag = searchParams.get('tag') || '';
    const initialSearch = searchParams.get('search') || '';
    const initialSort = searchParams.get('sort') || 'latest';

    const [posts, setPosts] = useState<Post[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [activeCategory, setActiveCategory] = useState<'all' | 'artwork' | 'posts'>('all');
    const [selectedTag, setSelectedTag] = useState<string>(initialTag);
    const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
    const [sortBy, setSortBy] = useState<string>(initialSort);
    const [popularTags, setPopularTags] = useState<TagItem[]>([]);

    // Reporting & Edit modal states
    const [reportingPost, setReportingPost] = useState<Post | null>(null);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editingPortfolio, setEditingPortfolio] = useState<any | null>(null);

    const handleDeletePost = async (post: Post) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await postService.destroy(post.id);
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
            toast.success('Post deleted successfully');
        } catch {
            toast.error('Failed to delete post');
        }
    };

    // Fetch popular tags on mount
    useEffect(() => {
        tagService.list({ limit: 30 }).then((tags) => {
            if (tags && tags.length > 0) {
                setPopularTags(tags);
            }
        }).catch(() => {});
    }, []);

    const fetchPosts = async (targetPage = 1, isLoadMore = false) => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (selectedTag) params.tag = selectedTag;
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (activeCategory === 'artwork') params.type = 'artwork';
            if (activeCategory === 'posts') params.type = 'posts';
            if (sortBy && sortBy !== 'latest') params.sort = sortBy;

            const res = await postService.list(targetPage, params);
            if (isLoadMore) {
                setPosts((prev) => [...prev, ...(res.data || [])]);
            } else {
                setPosts(res.data || []);
            }
            setMeta(res.meta || null);
            setPage(targetPage);
        } catch {
            toast.error('Failed to load explore feed');
        } finally {
            setLoading(false);
        }
    };

    // Refetch when filters, category, or sort changes
    useEffect(() => {
        fetchPosts(1, false);
    }, [selectedTag, activeCategory, sortBy]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const nextParams = new URLSearchParams(searchParams);
        if (searchQuery.trim()) {
            nextParams.set('search', searchQuery.trim());
        } else {
            nextParams.delete('search');
        }
        setSearchParams(nextParams);
        fetchPosts(1, false);
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
        setSearchQuery('');
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('tag');
        nextParams.delete('search');
        setSearchParams(nextParams);
        fetchPosts(1, false);
    };

    const loadMore = async () => {
        if (!meta || page >= meta.last_page || loading) return;
        fetchPosts(page + 1, true);
    };

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

    const isPostArtwork = (p: Post) => {
        // Exclusively for verified Artists: attached portfolio piece or post with media by an artist
        if (p.portfolio_id || p.portfolio?.id || (p.portfolio as any)?.thumbnail_media?.url) {
            return true;
        }
        const isArtist = Boolean(
            p.user?.artist_profile ||
            (p.user as any)?.artistProfile ||
            (p.user as any)?.artist_profile_id
        );
        return isArtist && Boolean(p.media && p.media.length > 0);
    };

    const hasAnyMedia = (p: Post) =>
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

            {/* Search & Tag Filtering Section */}
            <div className="space-y-3.5">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search artworks, creator username, or #tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 h-11 rounded-2xl bg-card border-border/80 text-xs sm:text-sm shadow-xs focus-visible:ring-purple-500/40"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    const nextParams = new URLSearchParams(searchParams);
                                    nextParams.delete('search');
                                    setSearchParams(nextParams);
                                    fetchPosts(1, false);
                                }}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-full"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    <Button type="submit" className="h-11 px-5 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-sm">
                        Search
                    </Button>
                </form>

                {/* Trending Tags Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground px-1.5 shrink-0">
                        <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                        <span className="hidden sm:inline">Tags:</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleSelectTag('')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                            !selectedTag
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
                        }`}
                    >
                        #All
                    </button>

                    {(popularTags.length > 0 ? popularTags.map((t) => t.name) : DEFAULT_FEATURED_TAGS).map((tagName) => {
                        const isSelected = selectedTag.toLowerCase() === tagName.toLowerCase();
                        return (
                            <button
                                key={tagName}
                                type="button"
                                onClick={() => handleSelectTag(tagName)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                                    isSelected
                                        ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-400/40'
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

                {/* Active Filter Indicators */}
                {(selectedTag || searchQuery) && (
                    <div className="flex items-center justify-between gap-3 p-2.5 px-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-purple-400">Active Filters:</span>
                            {selectedTag && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold font-mono">
                                    #{selectedTag}
                                    <button type="button" onClick={() => handleSelectTag(selectedTag)} className="hover:text-white cursor-pointer ml-1">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {searchQuery && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold">
                                    Search: "{searchQuery}"
                                    <button type="button" onClick={() => { setSearchQuery(''); fetchPosts(1, false); }} className="hover:text-white cursor-pointer ml-1">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                        <Button size="xs" variant="ghost" onClick={handleClearFilters} className="text-muted-foreground hover:text-foreground cursor-pointer text-xs h-7">
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Category Filter Tabs & Sort Order Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                {/* Category Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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

                {/* Sort Order Selector */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-secondary/40 p-1 rounded-xl border border-border/60">
                    <span className="text-[11px] font-bold text-muted-foreground pl-2 flex items-center gap-1.5">
                        <ArrowUpDown className="h-3.5 w-3.5 text-purple-400" />
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
                        className="h-8 px-2.5 rounded-lg bg-card border border-border text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
                    >
                        <option value="latest">⚡ Newest First</option>
                        <option value="popular">🔥 Most Popular</option>
                        <option value="comments">💬 Most Discussed</option>
                        <option value="oldest">⏳ Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Masonry Feed */}
            {loading && posts.length === 0 ? (
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-card border border-border/80 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className={`w-full ${i % 2 === 0 ? 'h-64' : 'h-44'} rounded-xl`} />
                        </div>
                    ))}
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border p-8">
                    <Palette className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-bold text-foreground">
                        {selectedTag ? `No results found for #${selectedTag}` : searchQuery ? `No results found for "${searchQuery}"` : 'No artworks or posts found'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-6">
                        {selectedTag || searchQuery ? 'Try clearing your filters or exploring another tag!' : 'Be the first to share your artwork illustration or start a discussion!'}
                    </p>
                    {selectedTag || searchQuery ? (
                        <Button
                            onClick={handleClearFilters}
                            className="font-bold rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer"
                        >
                            Clear Filters & Show All
                        </Button>
                    ) : isAuthenticated ? (
                        <Link to="/posts/create">
                            <Button className="font-bold rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                                <Sparkles className="h-4 w-4 mr-2" /> Create Post
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={() => requireAuth('generic')}
                            className="font-bold rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                        >
                            <Sparkles className="h-4 w-4 mr-2" /> Create Post
                        </Button>
                    )}
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
                    <AnimatePresence>
                        {filteredPosts.map((post) => {
                            const isArt = isPostArtwork(post);
                            const postHasMedia = hasAnyMedia(post);

                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="break-inside-avoid mb-4"
                                >
                                    {isArt ? (
                                        /* ── 1. Standardized Artwork Card (Clean Showcase with External Header & Actions) ── */
                                        <Link
                                            to={post.portfolio?.id ? `/portfolio/${post.portfolio.id}` : post.portfolio_id ? `/portfolio/${post.portfolio_id}` : `/posts/${post.id}`}
                                            className="group relative block rounded-2xl overflow-hidden bg-card border border-border/80 hover:border-purple-500/60 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer p-3.5 space-y-3"
                                        >
                                            {/* Author Header (Outside Top) */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Avatar
                                                        size="sm"
                                                        fallback={post.user?.display_name || post.user?.username || '?'}
                                                        src={post.user?.avatar_url}
                                                        className="h-7 w-7 shrink-0 ring-1 ring-border shadow-xs"
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-bold text-foreground truncate group-hover:text-purple-400 transition-colors">
                                                                {post.user?.display_name || post.user?.username}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20 shrink-0">
                                                                Artist
                                                            </span>
                                                            {(post.is_taken_down || post.portfolio?.is_taken_down) && (
                                                                <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/30 shrink-0 flex items-center gap-0.5">
                                                                    <ShieldAlert className="h-2.5 w-2.5" /> Taken Down
                                                                </span>
                                                            )}
                                                            {post.visibility === 'private' && !post.is_taken_down && !post.portfolio?.is_taken_down && (
                                                                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30 shrink-0 flex items-center gap-0.5">
                                                                    <Lock className="h-2.5 w-2.5" /> Private
                                                                </span>
                                                            )}
                                                        </div>
                                                        {post.created_at && (
                                                            <span className="text-[10px] text-muted-foreground block">
                                                                {formatPostDate(post.created_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 3-Dots Options Menu */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
                                                            title="Options"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1.5 z-30">
                                                        <DropdownMenuItem
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                const url = `${window.location.origin}${post.portfolio?.id ? `/portfolio/${post.portfolio.id}` : `/posts/${post.id}`}`;
                                                                await copyToClipboard(url);
                                                                toast.success('Link copied to clipboard!');
                                                            }}
                                                            className="rounded-xl text-xs py-1.5 cursor-pointer gap-2"
                                                        >
                                                            <Share2 className="h-3 w-3 text-muted-foreground" />
                                                            <span>Share Link</span>
                                                        </DropdownMenuItem>

                                                        {user && user.id === post.user_id && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (post.portfolio) {
                                                                            setEditingPortfolio(post.portfolio);
                                                                        } else {
                                                                            setEditingPost(post);
                                                                        }
                                                                    }}
                                                                    className="rounded-xl text-xs py-1.5 cursor-pointer gap-2"
                                                                >
                                                                    <Pencil className="h-3 w-3 text-muted-foreground" />
                                                                    <span>{post.portfolio ? 'Edit Artwork' : 'Edit Post'}</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeletePost(post);
                                                                    }}
                                                                    className="rounded-xl text-xs py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer gap-2"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                    <span>Delete</span>
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        {(!user || user.id !== post.user_id) && (
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!requireAuth('report')) return;
                                                                    setReportingPost(post);
                                                                }}
                                                                className="rounded-xl text-xs py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer gap-2"
                                                            >
                                                                <Flag className="h-3 w-3" />
                                                                <span>Report</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Artwork Showcase Media (Clean & Unobstructed) */}
                                            <div className="relative w-full overflow-hidden rounded-xl bg-black/40 border border-border/60">
                                                <PostCardMedia post={post} />
                                            </div>

                                            {/* Artwork Caption / Description */}
                                            {post.content && (
                                                <p className="text-xs font-medium text-foreground/90 line-clamp-2 leading-relaxed">
                                                    {post.content}
                                                </p>
                                            )}

                                            {/* Tags */}
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                                    {post.tags.slice(0, 3).map((tag) => (
                                                        <button
                                                            key={tag.id}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleSelectTag(tag.name);
                                                            }}
                                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                                                                selectedTag.toLowerCase() === tag.name.toLowerCase()
                                                                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                                                                    : 'bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/50'
                                                            }`}
                                                        >
                                                            #{tag.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Action Buttons Row (Outside Bottom) */}
                                            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleLike(e, post.id)}
                                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                                                            post.is_liked
                                                                ? 'text-rose-500 font-bold bg-rose-500/10'
                                                                : 'text-muted-foreground hover:text-rose-500 hover:bg-secondary/60'
                                                        }`}
                                                        aria-label="Like"
                                                    >
                                                        <Heart
                                                            className={`h-3.5 w-3.5 ${
                                                                post.is_liked ? 'fill-rose-500 text-rose-500' : ''
                                                            }`}
                                                        />
                                                        <span className="text-[11px]">{post.likes_count || 0}</span>
                                                    </button>

                                                    <span className="flex items-center gap-1 text-muted-foreground text-[11px] px-2 py-1 rounded-xl bg-secondary/40">
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                        <span>{post.comments_count || 0}</span>
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => handleBookmark(e, post.id)}
                                                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                                                        post.is_bookmarked
                                                            ? 'text-blue-500 bg-blue-500/10'
                                                            : 'text-muted-foreground hover:text-blue-500 hover:bg-secondary/60'
                                                    }`}
                                                    aria-label="Bookmark"
                                                >
                                                    <Bookmark
                                                        className={`h-3.5 w-3.5 ${
                                                            post.is_bookmarked ? 'fill-blue-500 text-blue-500' : ''
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </Link>
                                    ) : (
                                        /* ── 2. Discussion Card ── */
                                        <Link
                                            to={`/posts/${post.id}`}
                                            className="group relative block rounded-2xl overflow-hidden bg-card border border-border/80 hover:border-purple-500/60 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer p-4 space-y-3"
                                        >
                                            {/* Author Header */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Avatar
                                                        size="sm"
                                                        fallback={post.user?.display_name || post.user?.username || '?'}
                                                        src={post.user?.avatar_url}
                                                        className="h-8 w-8 shrink-0 ring-1 ring-border shadow-xs"
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-bold text-foreground truncate group-hover:text-purple-400 transition-colors">
                                                                {post.user?.display_name || post.user?.username}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-muted-foreground bg-secondary/80 px-1.5 py-0.2 rounded border border-border/60 shrink-0">
                                                                {post.user?.role === 'admin' ? 'Admin' : post.user?.role === 'moderator' ? 'Moderator' : post.user?.artist_profile ? 'Artist' : 'User'}
                                                            </span>
                                                            {(post.is_taken_down || post.portfolio?.is_taken_down) && (
                                                                <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/30 shrink-0 flex items-center gap-0.5">
                                                                    <ShieldAlert className="h-2.5 w-2.5" /> Taken Down
                                                                </span>
                                                            )}
                                                            {post.visibility === 'private' && !post.is_taken_down && !post.portfolio?.is_taken_down && (
                                                                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30 shrink-0 flex items-center gap-0.5">
                                                                    <Lock className="h-2.5 w-2.5" /> Private
                                                                </span>
                                                            )}
                                                        </div>
                                                        {post.created_at && (
                                                            <span className="text-[10px] text-muted-foreground block">
                                                                {formatPostDate(post.created_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 3-Dots Options Menu */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
                                                            title="Post options"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1.5 z-30">
                                                        <DropdownMenuItem
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                const url = `${window.location.origin}/posts/${post.id}`;
                                                                await copyToClipboard(url);
                                                                toast.success('Link copied to clipboard!');
                                                            }}
                                                            className="rounded-xl text-xs py-1.5 cursor-pointer gap-2"
                                                        >
                                                            <Share2 className="h-3 w-3 text-muted-foreground" />
                                                            <span>Share Link</span>
                                                        </DropdownMenuItem>

                                                        {user && user.id === post.user_id && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (post.portfolio) {
                                                                            setEditingPortfolio(post.portfolio);
                                                                        } else {
                                                                            setEditingPost(post);
                                                                        }
                                                                    }}
                                                                    className="rounded-xl text-xs py-1.5 cursor-pointer gap-2"
                                                                >
                                                                    <Pencil className="h-3 w-3 text-muted-foreground" />
                                                                    <span>{post.portfolio ? 'Edit Artwork' : 'Edit Post'}</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeletePost(post);
                                                                    }}
                                                                    className="rounded-xl text-xs py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer gap-2"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                    <span>Delete</span>
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        {(!user || user.id !== post.user_id) && (
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (user?.role === 'admin' || user?.role === 'moderator') {
                                                                        navigate('/admin/reports');
                                                                        toast.info('Fast-travelled to Moderation Workbench');
                                                                        return;
                                                                    }
                                                                    if (!requireAuth('report')) return;
                                                                    setReportingPost(post);
                                                                }}
                                                                className={`rounded-xl text-xs py-1.5 cursor-pointer gap-2 ${
                                                                    user?.role === 'admin' || user?.role === 'moderator'
                                                                        ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                                                                        : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                                                                }`}
                                                            >
                                                                {user?.role === 'admin' || user?.role === 'moderator' ? (
                                                                    <>
                                                                        <Shield className="h-3.5 w-3.5 text-purple-400" />
                                                                        <span>Moderate Post</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Flag className="h-3.5 w-3.5" />
                                                                        <span>Report</span>
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            {/* Markdown Content */}
                                            {post.content && (
                                                <div className="py-0.5">
                                                    <MarkdownContent
                                                        content={post.content}
                                                        disableLinks
                                                        className="text-xs line-clamp-4 leading-relaxed text-foreground/90 font-medium"
                                                    />
                                                </div>
                                            )}

                                            {/* Media Showcase */}
                                            {postHasMedia && (
                                                <div className="pt-0.5">
                                                    <PostCardMedia post={post} />
                                                </div>
                                            )}

                                            {/* Discussion Post Tags */}
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                    {post.tags.slice(0, 4).map((tag) => (
                                                        <button
                                                            key={tag.id}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleSelectTag(tag.name);
                                                            }}
                                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                                                                selectedTag.toLowerCase() === tag.name.toLowerCase()
                                                                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                                                                    : 'bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/50'
                                                            }`}
                                                        >
                                                            #{tag.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Action Buttons Row */}
                                            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleLike(e, post.id)}
                                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                                                            post.is_liked
                                                                ? 'text-rose-500 font-bold bg-rose-500/10'
                                                                : 'text-muted-foreground hover:text-rose-500 hover:bg-secondary/60'
                                                        }`}
                                                        aria-label="Like"
                                                    >
                                                        <Heart
                                                            className={`h-3.5 w-3.5 ${
                                                                post.is_liked ? 'fill-rose-500 text-rose-500' : ''
                                                            }`}
                                                        />
                                                        <span className="text-[11px]">{post.likes_count || 0}</span>
                                                    </button>

                                                    <span className="flex items-center gap-1 text-muted-foreground text-[11px] px-2 py-1 rounded-xl bg-secondary/40">
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                        <span>{post.comments_count || 0}</span>
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => handleBookmark(e, post.id)}
                                                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                                                        post.is_bookmarked
                                                            ? 'text-blue-500 bg-blue-500/10'
                                                            : 'text-muted-foreground hover:text-blue-500 hover:bg-secondary/60'
                                                    }`}
                                                    aria-label="Bookmark"
                                                >
                                                    <Bookmark
                                                        className={`h-3.5 w-3.5 ${
                                                            post.is_bookmarked ? 'fill-blue-500 text-blue-500' : ''
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </Link>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Universal Report Modal */}
            {reportingPost && (
                <ReportModal
                    isOpen={Boolean(reportingPost)}
                    onClose={() => setReportingPost(null)}
                    reportableType="post"
                    reportableId={reportingPost.id}
                    targetTitle={reportingPost.content ? reportingPost.content.slice(0, 60) : reportingPost.portfolio?.title || `Post #${reportingPost.id}`}
                    targetSubtitle={reportingPost.user ? `by @${reportingPost.user.username}` : undefined}
                />
            )}

            {/* Edit Post Modal */}
            {editingPost && (
                <EditPostModal
                    isOpen={Boolean(editingPost)}
                    onClose={() => setEditingPost(null)}
                    post={editingPost}
                    onPostUpdated={(updated) => {
                        setPosts((prev) =>
                            prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
                        );
                        setEditingPost(null);
                    }}
                />
            )}

            {/* Edit Portfolio Modal */}
            {editingPortfolio && (
                <EditPortfolioModal
                    isOpen={Boolean(editingPortfolio)}
                    onClose={() => setEditingPortfolio(null)}
                    portfolio={editingPortfolio}
                    onPortfolioUpdated={(updated) => {
                        setPosts((prev) =>
                            prev.map((p) =>
                                p.portfolio_id === updated.id || p.portfolio?.id === updated.id
                                    ? { ...p, portfolio: { ...p.portfolio, ...updated } }
                                    : p
                            )
                        );
                        setEditingPortfolio(null);
                    }}
                />
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
