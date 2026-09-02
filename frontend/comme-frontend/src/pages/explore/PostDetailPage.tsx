import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Heart,
    Bookmark,
    ArrowLeft,
    MessageSquare,
    Share2,
    Sparkles,
    Globe,
    Lock,
    Users,
    Tag,
    Trash2,
    Clock,
    Check,
    AlertTriangle,
    Video,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Reply,
} from 'lucide-react';
import { postService } from '@/services/postService';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { copyToClipboard } from '@/lib/clipboard';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { MediaLightboxModal } from '@/components/ui/MediaLightboxModal';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import { CommentComposer } from '@/components/explore/CommentComposer';
import type { Post, PostComment } from '@/types';

function formatPostDate(dateStr?: string | null): string {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Recently';

    const now = Date.now();
    const diffSecs = Math.floor((now - date.getTime()) / 1000);
    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
}

// ── Extract Media Items from Comment Markdown ──
function extractCommentMedia(content: string): {
    cleanText: string;
    mediaList: Array<{ id: number; url: string; file_name: string; media_type: 'image' | 'video'; isVideo: boolean; isGif: boolean }>;
} {
    const mediaList: Array<{ id: number; url: string; file_name: string; media_type: 'image' | 'video'; isVideo: boolean; isGif: boolean }> = [];
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match;
    let idCounter = 1;

    while ((match = imageRegex.exec(content)) !== null) {
        const alt = match[1] || 'Attachment';
        const url = match[2] || '';
        const isVideo = /\.(mp4|webm|mov|mkv|avi)$/i.test(url) || url.includes('/media/stream/') || /\.(mp4|webm|mov|mkv|avi)$/i.test(alt);
        const isGif = /\.gif$/i.test(url) || alt.toLowerCase().includes('gif');
        mediaList.push({
            id: idCounter++,
            url,
            file_name: alt,
            media_type: isVideo ? 'video' : 'image',
            isVideo,
            isGif,
        });
    }

    const cleanText = content.replace(imageRegex, '').trim();
    return { cleanText, mediaList };
}

// ── Compact Horizontal Scrollable Media Gallery for Comments ──
const ScrollableCommentMediaGallery: React.FC<{
    mediaList: Array<{ id: number; url: string; file_name: string; media_type: 'image' | 'video'; isVideo: boolean; isGif: boolean }>;
}> = ({ mediaList }) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(mediaList.length > 1);
    const [activeIndex, setActiveIndex] = useState(0);

    // Lightbox modal state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const handleOpenLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

        const itemWidth = scrollContainerRef.current.firstElementChild?.clientWidth || clientWidth;
        const current = Math.round(scrollLeft / (itemWidth + 12));
        setActiveIndex(Math.min(Math.max(0, current), mediaList.length - 1));
    };

    useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll, { passive: true });
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (container) container.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [mediaList.length]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollAmount = container.clientWidth * 0.8;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    const scrollToItem = (index: number) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const children = container.children;
        if (children[index]) {
            (children[index] as HTMLElement).scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    };

    if (mediaList.length === 1) {
        const m = mediaList[0];
        return (
            <>
                <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-border/80 my-2 max-w-sm group">
                    {m.isVideo ? (
                        <CustomVideoPlayer
                            src={m.url}
                            autoPlay={false}
                            loop
                            className="w-full h-auto max-h-[220px] rounded-2xl"
                        />
                    ) : (
                        <img
                            src={m.url}
                            alt={m.file_name}
                            className="w-full h-auto max-h-[220px] object-contain rounded-2xl cursor-zoom-in hover:brightness-105 transition-all"
                            onClick={() => handleOpenLightbox(0)}
                        />
                    )}

                    <div className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none">
                        {m.isVideo ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[9px] font-black flex items-center gap-1 shadow-sm backdrop-blur-md">
                                <Video className="h-2.5 w-2.5" /> VIDEO
                            </span>
                        ) : m.isGif ? (
                            <span className="px-2 py-0.5 rounded-full bg-purple-600/90 text-white text-[9px] font-black shadow-sm backdrop-blur-md">
                                GIF
                            </span>
                        ) : null}
                    </div>

                    {!m.isVideo && (
                        <button
                            type="button"
                            onClick={() => handleOpenLightbox(0)}
                            className="absolute top-2 right-2 h-6 px-2 rounded-full bg-black/70 hover:bg-black/90 text-white text-[10px] font-semibold flex items-center gap-1 shadow-md backdrop-blur-md border border-white/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                            <Maximize2 className="h-2.5 w-2.5" /> Expand
                        </button>
                    )}
                </div>

                <MediaLightboxModal
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                    mediaList={mediaList as any}
                    initialIndex={lightboxIndex}
                />
            </>
        );
    }

    return (
        <>
            <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-border/80 my-2 group/gallery select-none">
                {/* Horizontal Scroll Track */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-3 overflow-x-auto snap-x snap-mandatory p-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent scroll-smooth"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {mediaList.map((m, idx) => (
                        <div
                            key={m.id || idx}
                            className="relative snap-center shrink-0 w-[240px] sm:w-[280px] h-[170px] sm:h-[190px] rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center group/card"
                        >
                            {m.isVideo ? (
                                <CustomVideoPlayer
                                    src={m.url}
                                    autoPlay={false}
                                    loop
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={m.url}
                                    alt={m.file_name}
                                    className="w-full h-full object-cover cursor-zoom-in group-hover/card:scale-105 transition-transform duration-300"
                                    onClick={() => handleOpenLightbox(idx)}
                                    loading="lazy"
                                />
                            )}

                            {/* Top Badges */}
                            <div className="absolute top-2 left-2 flex items-center gap-1 z-10 pointer-events-none">
                                {m.isVideo ? (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[9px] font-black flex items-center gap-1 shadow-sm backdrop-blur-md">
                                        <Video className="h-2.5 w-2.5" /> VID
                                    </span>
                                ) : m.isGif ? (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-600/90 text-white text-[9px] font-black shadow-sm backdrop-blur-md">
                                        GIF
                                    </span>
                                ) : null}
                            </div>

                            {/* Top Right Counter & Expand Button */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[9px] font-bold border border-white/10 shadow-xs">
                                    {idx + 1}/{mediaList.length}
                                </span>
                                {!m.isVideo && (
                                    <button
                                        type="button"
                                        onClick={() => handleOpenLightbox(idx)}
                                        className="h-6 w-6 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xs transition-all cursor-pointer opacity-0 group-hover/card:opacity-100"
                                        title="Expand"
                                    >
                                        <Maximize2 className="h-2.5 w-2.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Left / Right Nav Arrows */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/75 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer z-20"
                        title="Scroll left"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                )}
                {canScrollRight && (
                    <button
                        type="button"
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/75 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer z-20"
                        title="Scroll right"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}

                {/* Bottom Navigation Dots */}
                {mediaList.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 py-2 bg-black/70 backdrop-blur-xs border-t border-white/5">
                        {mediaList.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => scrollToItem(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    idx === activeIndex
                                        ? 'w-5 bg-white shadow-sm'
                                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                                }`}
                                title={`Jump to media ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <MediaLightboxModal
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                mediaList={mediaList as any}
                initialIndex={lightboxIndex}
            />
        </>
    );
};

// ── Interactive Comment Item with Replies, Likes & Bookmarks ──
const CommentItem: React.FC<{
    comment: PostComment;
    postId: number;
    postAuthorId?: number;
    onDeleteComment: (commentId: number) => void;
    onReplyAdded: (reply: PostComment, parentId: number) => void;
    deletingCommentId: number | null;
}> = ({ comment, postId, postAuthorId, onDeleteComment, onReplyAdded, deletingCommentId }) => {
    const { user } = useAuth();
    const { requireAuth } = useAuthModal();
    const [isLiked, setIsLiked] = useState(Boolean(comment.is_liked));
    const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
    const [isBookmarked, setIsBookmarked] = useState(Boolean(comment.is_bookmarked));
    const [showReplyComposer, setShowReplyComposer] = useState(false);

    const { cleanText, mediaList } = extractCommentMedia(comment.content || comment.body || '');

    const handleLike = async () => {
        if (!requireAuth('like')) return;
        try {
            const res = await postService.toggleCommentLike(comment.id);
            const liked = res.is_liked ?? res.liked ?? false;
            setIsLiked(liked);
            setLikesCount(res.likes_count ?? (liked ? likesCount + 1 : Math.max(0, likesCount - 1)));
        } catch {
            toast.error('Failed to like comment');
        }
    };

    const handleBookmark = async () => {
        if (!requireAuth('bookmark')) return;
        try {
            const res = await postService.toggleCommentBookmark(comment.id);
            const bookmarked = res.is_bookmarked ?? res.bookmarked ?? false;
            setIsBookmarked(bookmarked);
            toast.success(bookmarked ? 'Comment saved to bookmarks' : 'Comment removed from bookmarks');
        } catch {
            toast.error('Failed to bookmark comment');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
            <Card className="rounded-2xl border border-border/70 bg-card/85 shadow-2xs hover:border-border transition-colors">
                <CardContent className="p-4 sm:p-5 space-y-3">
                    {/* Header: Author Info */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Link to={`/@${comment.user?.username || ''}`}>
                                <Avatar
                                    size="sm"
                                    fallback={comment.user?.display_name || comment.user?.username || '?'}
                                    src={comment.user?.avatar_url}
                                    className="ring-1 ring-border shadow-2xs"
                                />
                            </Link>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Link
                                        to={`/@${comment.user?.username || ''}`}
                                        className="font-bold text-xs text-foreground hover:text-primary transition-colors truncate"
                                    >
                                        {comment.user?.display_name || comment.user?.username}
                                    </Link>
                                    {comment.user_id === postAuthorId && (
                                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                                            Author
                                        </span>
                                    )}
                                    <span className="text-[11px] text-muted-foreground">
                                        {formatPostDate(comment.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Delete Comment for Comment Owner or Admin */}
                        {user && (user.id === comment.user_id || user.role === 'admin') && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteComment(comment.id)}
                                disabled={deletingCommentId === comment.id}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0"
                                title="Delete comment"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>

                    {/* Clean Text Content */}
                    {cleanText && (
                        <div className="pt-0.5">
                            <MarkdownContent content={cleanText} variant="comment" className="text-foreground/90 leading-relaxed text-xs sm:text-sm font-medium" />
                        </div>
                    )}

                    {/* Extracted Media Gallery formatted like Post Media */}
                    {mediaList.length > 0 && (
                        <ScrollableCommentMediaGallery mediaList={mediaList} />
                    )}

                    {/* Comment Interactive Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                        <div className="flex items-center gap-3">
                            {/* Like Button */}
                            <button
                                type="button"
                                onClick={handleLike}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                                    isLiked
                                        ? 'text-rose-500 font-bold bg-rose-500/10'
                                        : 'text-muted-foreground hover:text-rose-500 hover:bg-secondary/60'
                                }`}
                                aria-label="Like comment"
                            >
                                <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                <span className="text-[11px]">{likesCount}</span>
                            </button>

                            {/* Reply Button to start thread */}
                            <button
                                type="button"
                                onClick={() => setShowReplyComposer((prev) => !prev)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                                aria-label="Reply to comment"
                            >
                                <Reply className="h-3.5 w-3.5" />
                                <span className="text-[11px]">
                                    Reply {comment.replies && comment.replies.length > 0 ? `(${comment.replies.length})` : ''}
                                </span>
                            </button>
                        </div>

                        {/* Bookmark Button */}
                        <button
                            type="button"
                            onClick={handleBookmark}
                            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                                isBookmarked
                                    ? 'text-blue-500 bg-blue-500/10'
                                    : 'text-muted-foreground hover:text-blue-500 hover:bg-secondary/60'
                            }`}
                            aria-label="Bookmark comment"
                        >
                            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Inline Nested Reply Composer */}
            {showReplyComposer && (
                <div className="pl-4 sm:pl-6 border-l-2 border-purple-500/40 mt-2">
                    <CommentComposer
                        postId={postId}
                        parentCommentId={comment.id}
                        placeholder={`Reply to @${comment.user?.username || 'user'}...`}
                        onCommentAdded={(newReply) => {
                            onReplyAdded(newReply, comment.id);
                            setShowReplyComposer(false);
                        }}
                        onCancel={() => setShowReplyComposer(false)}
                    />
                </div>
            )}

            {/* Threaded Nested Replies Tree */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="pl-4 sm:pl-6 border-l-2 border-primary/30 space-y-2.5 mt-2">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            postAuthorId={postAuthorId}
                            onDeleteComment={onDeleteComment}
                            onReplyAdded={onReplyAdded}
                            deletingCommentId={deletingCommentId}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

// ── Horizontal Scrollable Media Gallery Component for Posts ──
const ScrollableMediaGallery: React.FC<{
    mediaList: NonNullable<Post['media']>;
    attachedPortfolio?: Post['portfolio'];
}> = ({ mediaList, attachedPortfolio }) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(mediaList.length > 1);
    const [activeIndex, setActiveIndex] = useState(0);

    // Lightbox modal state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const handleOpenLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

        const itemWidth = scrollContainerRef.current.firstElementChild?.clientWidth || clientWidth;
        const current = Math.round(scrollLeft / (itemWidth + 16));
        setActiveIndex(Math.min(Math.max(0, current), mediaList.length - 1));
    };

    useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll, { passive: true });
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (container) container.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [mediaList.length]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollAmount = container.clientWidth * 0.85;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    const scrollToItem = (index: number) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const children = container.children;
        if (children[index]) {
            (children[index] as HTMLElement).scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    };

    if (mediaList.length === 1) {
        const m = mediaList[0];
        const isItemVideo =
            m.media_type === 'video' ||
            m.mime_type?.includes('video') ||
            (typeof m.url === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(m.url));

        return (
            <>
                <div className="relative w-full max-h-[640px] bg-black/95 overflow-hidden flex items-center justify-center p-2 group">
                    {isItemVideo ? (
                        <CustomVideoPlayer
                            src={m.url}
                            autoPlay={false}
                            loop
                            className="w-full h-auto max-h-[600px] rounded-2xl"
                        />
                    ) : (
                        <img
                            src={m.url}
                            alt={m.file_name || 'Attached media'}
                            className="w-full h-auto max-h-[640px] object-contain rounded-2xl cursor-zoom-in group-hover:brightness-105 transition-all"
                            onClick={() => handleOpenLightbox(0)}
                        />
                    )}
                    <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                        {isItemVideo ? (
                            <span className="px-3 py-1 rounded-full bg-blue-600/85 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                                <Video className="h-3.5 w-3.5" /> Video Attachment
                            </span>
                        ) : m.mime_type?.includes('gif') ? (
                            <span className="px-3 py-1 rounded-full bg-purple-600/85 backdrop-blur-md text-white text-xs font-black shadow-md">
                                GIF Attachment
                            </span>
                        ) : attachedPortfolio ? (
                            <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Attached Portfolio Piece
                            </span>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={() => handleOpenLightbox(0)}
                        className="absolute top-4 right-4 h-8 px-3 rounded-full bg-black/75 hover:bg-black/95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105 z-20"
                        title="Expand into fullscreen lightbox"
                    >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span>Expand</span>
                    </button>
                </div>

                <MediaLightboxModal
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                    mediaList={mediaList}
                    initialIndex={lightboxIndex}
                />
            </>
        );
    }

    return (
        <>
            <div className="relative bg-black/95 group/gallery select-none overflow-hidden rounded-2xl">
                {/* Scroll Track Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-4 sm:px-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent scroll-smooth"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {mediaList.map((m, idx) => {
                        const isItemVideo =
                            m.media_type === 'video' ||
                            m.mime_type?.includes('video') ||
                            (typeof m.url === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(m.url));

                        return (
                            <div
                                key={m.id || idx}
                                className="relative snap-center shrink-0 w-[300px] sm:w-[420px] md:w-[480px] h-[220px] sm:h-[300px] md:h-[340px] rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center group/card"
                            >
                                {isItemVideo ? (
                                    <CustomVideoPlayer
                                        src={m.url}
                                        autoPlay={false}
                                        loop
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={m.url}
                                        alt={m.file_name || `Media ${idx + 1}`}
                                        className="w-full h-full object-cover cursor-zoom-in group-hover/card:scale-105 transition-transform duration-300"
                                        onClick={() => handleOpenLightbox(idx)}
                                        loading="lazy"
                                    />
                                )}

                                {/* Top Left Badges */}
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
                                    {isItemVideo ? (
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-black flex items-center gap-1 shadow-md backdrop-blur-md">
                                            <Video className="h-3 w-3" /> VIDEO
                                        </span>
                                    ) : m.mime_type?.includes('gif') ? (
                                        <span className="px-2.5 py-0.5 rounded-full bg-purple-600/90 text-white text-[10px] font-black shadow-md backdrop-blur-md">
                                            GIF
                                        </span>
                                    ) : null}
                                </div>

                                {/* Top Right Counter & Expand Button */}
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                                    <span className="px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 shadow-md">
                                        {idx + 1}/{mediaList.length}
                                    </span>
                                    {!isItemVideo && (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenLightbox(idx)}
                                            className="h-7 px-2 rounded-full bg-black/65 hover:bg-black/90 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md border border-white/20 shadow-md transition-all cursor-pointer opacity-0 group-hover/card:opacity-100"
                                            title="Expand"
                                        >
                                            <Maximize2 className="h-3 w-3" />
                                            <span>Expand</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Left Nav Arrow */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => scroll('left')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all cursor-pointer z-20 hover:scale-105"
                        title="Scroll left"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                )}

                {/* Right Nav Arrow */}
                {canScrollRight && (
                    <button
                        type="button"
                        onClick={() => scroll('right')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all cursor-pointer z-20 hover:scale-105"
                        title="Scroll right"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                )}

                {/* Bottom Progress Navigation Dots */}
                {mediaList.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 py-2.5 bg-black/60 backdrop-blur-xs border-t border-white/5">
                        {mediaList.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => scrollToItem(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    idx === activeIndex
                                        ? 'w-6 bg-white shadow-sm'
                                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                                }`}
                                title={`Jump to media ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <MediaLightboxModal
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                mediaList={mediaList}
                initialIndex={lightboxIndex}
            />
        </>
    );
};

export const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { requireAuth } = useAuthModal();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeletingPost, setIsDeletingPost] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await postService.show(Number(id));
                setPost(data);
                const commentsRes = await postService.listComments(Number(id));
                setComments(commentsRes.data || []);
            } catch {
                toast.error('Failed to load post');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchPost();
    }, [id]);

    const handleLike = async () => {
        if (!post) return;
        if (!requireAuth('like')) return;
        try {
            const res = await postService.toggleLike(post.id);
            const isLiked = res.is_liked ?? res.liked ?? false;
            setPost({
                ...post,
                is_liked: isLiked,
                likes_count: res.likes_count ?? (isLiked ? post.likes_count + 1 : Math.max(0, post.likes_count - 1)),
            });
        } catch {
            toast.error('Failed to like post');
        }
    };

    const handleBookmark = async () => {
        if (!post) return;
        if (!requireAuth('bookmark')) return;
        try {
            const res = await postService.toggleBookmark(post.id);
            const isBookmarked = res.is_bookmarked ?? res.bookmarked ?? false;
            setPost({
                ...post,
                is_bookmarked: isBookmarked,
                bookmarks_count: res.bookmarks_count ?? (isBookmarked ? post.bookmarks_count + 1 : Math.max(0, post.bookmarks_count - 1)),
            });
            toast.success(isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
        } catch {
            toast.error('Failed to bookmark post');
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post?.content?.slice(0, 40) || 'Comme Post',
                    url,
                });
                return;
            } catch {
                // User cancelled or share failed, fallback to copy
            }
        }

        const success = await copyToClipboard(url);
        if (success) {
            setCopied(true);
            toast.success('Post link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } else {
            window.prompt('Copy post URL to share:', url);
        }
    };

    const handleDeletePost = async () => {
        if (!post) return;
        setIsDeletingPost(true);
        try {
            await postService.destroy(post.id);
            toast.success('Post deleted successfully');
            navigate('/explore');
        } catch {
            toast.error('Failed to delete post. Please try again.');
            setIsDeletingPost(false);
            setShowDeleteModal(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        setDeletingCommentId(commentId);
        try {
            await postService.deleteComment(commentId);
            setComments((prev: PostComment[]) => {
                // Remove comment or remove from replies
                return prev
                    .filter((c: PostComment) => c.id !== commentId)
                    .map((c) => ({
                        ...c,
                        replies: c.replies ? c.replies.filter((r) => r.id !== commentId) : [],
                    }));
            });
            if (post) setPost({ ...post, comments_count: Math.max(0, post.comments_count - 1) });
            toast.success('Comment deleted');
        } catch {
            toast.error('Failed to delete comment');
        } finally {
            setDeletingCommentId(null);
        }
    };

    const handleReplyAdded = (newReply: PostComment, parentId: number) => {
        setComments((prev: PostComment[]) => {
            return prev.map((c) => {
                if (c.id === parentId) {
                    return {
                        ...c,
                        replies: [...(c.replies || []), newReply],
                    };
                }
                return c;
            });
        });
        if (post) setPost({ ...post, comments_count: post.comments_count + 1 });
    };

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-72 w-full rounded-3xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Post not found</h2>
                <p className="text-sm text-muted-foreground">
                    This post may have been removed by its author or is set to private.
                </p>
                <Link to="/explore">
                    <Button variant="outline" className="mt-2 font-semibold">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Explore
                    </Button>
                </Link>
            </div>
        );
    }

    const attachedMediaList: NonNullable<Post['media']> =
        post.media && post.media.length > 0
            ? post.media
            : post.portfolio?.media && post.portfolio.media.length > 0
            ? (post.portfolio.media as any)
            : (post.portfolio as any)?.thumbnail_media
            ? [(post.portfolio as any).thumbnail_media]
            : post.portfolio?.cover_image_url
            ? [
                  {
                      id: 0,
                      url: post.portfolio.cover_image_url,
                      file_name: post.portfolio?.title || 'Artwork',
                      media_type: 'image',
                  },
              ]
            : [];

    return (
        <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
            {/* Navigation Breadcrumb */}
            <div>
                <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Explore
                </Link>
            </div>

            {/* ── Main Post Card ── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <Card className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-lg">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                        {/* 1. Author Header */}
                        <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
                            <div className="flex items-center gap-3.5">
                                <Link to={`/@${post.user?.username || ''}`} className="cursor-pointer">
                                    <Avatar
                                        size="lg"
                                        fallback={post.user?.display_name || post.user?.username || '?'}
                                        src={post.user?.avatar_url}
                                        className="ring-2 ring-border/80 shadow-sm"
                                    />
                                </Link>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/@${post.user?.username || ''}`}
                                            className="font-bold text-base text-foreground hover:text-primary transition-colors"
                                        >
                                            {post.user?.display_name || post.user?.username}
                                        </Link>
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                            {post.user?.artist_profile ? 'Artist' : 'Creator'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <span>@{post.user?.username}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {formatPostDate(post.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Visibility Badge */}
                            <Badge variant="outline" className="text-xs font-semibold gap-1.5 px-3 py-1">
                                {post.visibility === 'public' && <Globe className="h-3 w-3 text-emerald-400" />}
                                {post.visibility === 'followers' && <Users className="h-3 w-3 text-primary" />}
                                {post.visibility === 'private' && <Lock className="h-3 w-3 text-amber-400" />}
                                <span className="capitalize">{post.visibility || 'Public'}</span>
                            </Badge>
                        </div>

                        {/* 2. Post Text Content */}
                        {post.content && (
                            <div className="pt-1">
                                <MarkdownContent content={post.content} />
                            </div>
                        )}

                        {/* 3. Attached Multi-Media Scrollable Gallery or Hero Media (Below Text) */}
                        {attachedMediaList.length > 0 && (
                            <div className="pt-2 rounded-2xl overflow-hidden">
                                <ScrollableMediaGallery mediaList={attachedMediaList} attachedPortfolio={post.portfolio} />
                            </div>
                        )}

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {post.tags.map((t: { id: number; name: string }) => (
                                    <Badge
                                        key={t.id || t.name}
                                        variant="secondary"
                                        className="text-xs font-bold bg-primary/10 text-primary border border-primary/20"
                                    >
                                        <Tag className="h-3 w-3 mr-1" />
                                        {t.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons Bar */}
                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/60">
                            <div className="flex items-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLike}
                                    className={`rounded-xl gap-2 font-bold cursor-pointer transition-all active:scale-95 ${
                                        post.is_liked
                                            ? 'text-rose-500 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20'
                                            : 'hover:text-rose-500 hover:border-rose-500/20'
                                    }`}
                                >
                                    <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-rose-500' : ''}`} />
                                    <span>{post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBookmark}
                                    className={`rounded-xl gap-2 font-bold cursor-pointer transition-all active:scale-95 ${
                                        post.is_bookmarked
                                            ? 'text-blue-500 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20'
                                            : 'hover:text-blue-500 hover:border-blue-500/20'
                                    }`}
                                >
                                    <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? 'fill-blue-500' : ''}`} />
                                    <span>{post.bookmarks_count} {post.bookmarks_count === 1 ? 'Save' : 'Saves'}</span>
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleShare}
                                    className="rounded-xl gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
                                    <span>{copied ? 'Copied Link' : 'Share'}</span>
                                </Button>

                                {user && (user.id === post.user_id || user.role === 'admin') && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDeleteModal(true)}
                                        className="rounded-xl gap-2 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Delete</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── Confirm Delete Post Modal ── */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 space-y-5 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 text-rose-500">
                                <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <h3 className="font-extrabold text-lg text-foreground">Delete Post</h3>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Are you sure you want to permanently delete this post? This will remove all artwork attachments, discussion comments, and saved likes.
                            </p>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeletingPost}
                                    className="rounded-xl font-semibold cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeletePost}
                                    disabled={isDeletingPost}
                                    className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                                >
                                    {isDeletingPost ? 'Deleting...' : 'Delete Post'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Comments Section ── */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
                        <MessageSquare className="h-5 w-5 text-primary" /> Community Discussion ({comments.length})
                    </h2>
                    {!post.commentable && (
                        <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border/80">
                            Comments disabled by creator
                        </span>
                    )}
                </div>

                {/* Comment Composer Input */}
                {post.commentable && (
                    <CommentComposer
                        postId={Number(id)}
                        onCommentAdded={(newComment) => {
                            setComments((prev: PostComment[]) => [newComment, ...prev]);
                            if (post) setPost({ ...post, comments_count: post.comments_count + 1 });
                        }}
                    />
                )}

                {/* Comments List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {comments.length === 0 ? (
                            <div className="p-8 rounded-2xl border border-dashed border-border/80 text-center space-y-1 bg-card/40">
                                <p className="text-sm font-semibold text-foreground">No comments yet</p>
                                <p className="text-xs text-muted-foreground">
                                    Be the first collector or artist to share your thoughts!
                                </p>
                            </div>
                        ) : (
                            comments.map((comment: PostComment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    postId={Number(id)}
                                    postAuthorId={post.user_id}
                                    onDeleteComment={handleDeleteComment}
                                    onReplyAdded={handleReplyAdded}
                                    deletingCommentId={deletingCommentId}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
