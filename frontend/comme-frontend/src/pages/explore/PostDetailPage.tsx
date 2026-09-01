import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Heart,
    Bookmark,
    ArrowLeft,
    Send,
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
    X,
    Video,
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

export const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { requireAuth } = useAuthModal();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
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

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requireAuth('comment')) return;
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const comment = await postService.createComment(Number(id), newComment);
            setComments((prev: PostComment[]) => [comment, ...prev]);
            setNewComment('');
            if (post) setPost({ ...post, comments_count: post.comments_count + 1 });
            toast.success('Comment posted!');
        } catch {
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        setDeletingCommentId(commentId);
        try {
            await postService.deleteComment(commentId);
            setComments((prev: PostComment[]) => prev.filter((c: PostComment) => c.id !== commentId));
            if (post) setPost({ ...post, comments_count: Math.max(0, post.comments_count - 1) });
            toast.success('Comment deleted');
        } catch {
            toast.error('Failed to delete comment');
        } finally {
            setDeletingCommentId(null);
        }
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

    const attachedArtworkUrl =
        (post.media && post.media[0] ? post.media[0].url : null) ||
        post.portfolio?.cover_image_url ||
        post.portfolio?.media?.[0]?.url;

    const isSingleVideo =
        post.media?.[0]?.media_type === 'video' ||
        post.media?.[0]?.mime_type?.includes('video') ||
        (typeof attachedArtworkUrl === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(attachedArtworkUrl));

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
                    {/* Attached Multi-Media Gallery or Single Hero Media */}
                    {post.media && post.media.length > 1 ? (
                        <div className={`grid gap-2 bg-black/90 p-3 ${
                            post.media.length === 2
                                ? 'grid-cols-2 max-h-[500px]'
                                : post.media.length === 3
                                ? 'grid-cols-3 max-h-[420px]'
                                : 'grid-cols-2 sm:grid-cols-4'
                        }`}>
                            {post.media.map((m, idx) => {
                                const isItemVideo =
                                    m.media_type === 'video' ||
                                    m.mime_type?.includes('video') ||
                                    /\.(mp4|webm|mov|mkv)$/i.test(m.url);

                                return (
                                    <div
                                        key={m.id || idx}
                                        className="relative rounded-2xl overflow-hidden aspect-square bg-muted/40 group border border-white/10 flex items-center justify-center"
                                    >
                                        {isItemVideo ? (
                                            <video
                                                src={m.url}
                                                controls
                                                loop
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={m.url}
                                                alt={m.file_name || 'Post media'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                onClick={() => window.open(m.url, '_blank')}
                                            />
                                        )}
                                        {isItemVideo ? (
                                            <span className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                                                <Video className="h-3 w-3" /> VIDEO
                                            </span>
                                        ) : m.mime_type?.includes('gif') ? (
                                            <span className="absolute top-2 left-2 bg-purple-600/90 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                                                GIF
                                            </span>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    ) : attachedArtworkUrl ? (
                        isSingleVideo ? (
                            <div className="relative w-full max-h-[640px] bg-black overflow-hidden flex items-center justify-center p-2">
                                <video
                                    src={attachedArtworkUrl}
                                    controls
                                    autoPlay
                                    loop
                                    playsInline
                                    className="w-full h-auto max-h-[600px] object-contain rounded-2xl"
                                />
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                                    <Video className="h-3.5 w-3.5" />
                                    <span>Video Attachment</span>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full max-h-[640px] bg-black/90 overflow-hidden flex items-center justify-center">
                                <img
                                    src={attachedArtworkUrl}
                                    alt={post.content || 'Attached artwork'}
                                    className="w-full h-auto max-h-[640px] object-contain"
                                />
                                {post.portfolio && (
                                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                        <span>Attached Portfolio Artwork</span>
                                    </div>
                                )}
                            </div>
                        )
                    ) : null}

                    <CardContent className="p-6 sm:p-8 space-y-6">
                        {/* Author Header */}
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

                        {/* Post Content */}
                        <div className="pt-2">
                            <MarkdownContent content={post.content} />
                        </div>

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
                                    className={`h-10 px-4 rounded-xl font-bold text-xs gap-2 cursor-pointer transition-all ${
                                        post.is_liked
                                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 ring-1 ring-rose-500/30 hover:bg-rose-500/25'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                    <span>{post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBookmark}
                                    className={`h-10 px-4 rounded-xl font-bold text-xs gap-2 cursor-pointer transition-all ${
                                        post.is_bookmarked
                                            ? 'bg-blue-500/15 border-blue-500/40 text-blue-500 ring-1 ring-blue-500/30 hover:bg-blue-500/25'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
                                    <span>{post.bookmarks_count} {post.bookmarks_count === 1 ? 'Saved' : 'Saves'}</span>
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                {user && (user.id === post.user_id || user.id === post.user?.id || user.role === 'admin') && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDeleteModal(true)}
                                        className="h-10 px-3 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer gap-1.5 border border-rose-500/30"
                                        title="Delete your post"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Delete</span>
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleShare}
                                    className={`h-10 px-3.5 rounded-xl text-xs font-semibold cursor-pointer gap-1.5 transition-all ${
                                        copied
                                            ? 'text-emerald-400 bg-emerald-500/10'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 text-emerald-400" />
                                            <span className="text-emerald-400 font-bold">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Share2 className="h-4 w-4" />
                                            <span className="hidden sm:inline">Share</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── Delete Post Confirmation Modal Dialog ── */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-card border border-border/80 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2.5 text-rose-400">
                                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">Delete Community Post?</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="h-8 w-8 rounded-full cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-2 text-xs text-muted-foreground">
                                <p className="leading-relaxed">
                                    Are you sure you want to permanently delete this post? This will remove all artwork attachments, discussion comments, and saved likes.
                                </p>
                                <p className="font-semibold text-rose-400/90">
                                    This action cannot be undone.
                                </p>
                            </div>

                            <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2.5">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeletingPost}
                                    className="h-10 px-4 text-xs font-semibold cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeletePost}
                                    disabled={isDeletingPost}
                                    className="h-10 px-5 text-xs font-bold gap-2 cursor-pointer shadow-md bg-rose-600 hover:bg-rose-700 text-white"
                                >
                                    <Trash2 className="h-4 w-4" />
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
                    <Card className="rounded-2xl border border-border/80 bg-card shadow-sm">
                        <CardContent className="p-5">
                            {user ? (
                                <form onSubmit={handleComment} className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Avatar
                                            size="sm"
                                            fallback={user.display_name || user.username || '?'}
                                            src={user.avatar_url}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-2">
                                            <textarea
                                                placeholder="Write a supportive comment, feedback, or inquiry..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                rows={3}
                                                className="w-full resize-none rounded-xl p-3.5 text-sm bg-secondary/40 border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    disabled={submitting || !newComment.trim()}
                                                    className="h-10 px-5 rounded-xl font-bold text-xs gap-2 shadow-md cursor-pointer"
                                                >
                                                    <Send className="h-3.5 w-3.5" />
                                                    {submitting ? 'Posting...' : 'Post Comment'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div
                                    onClick={() => requireAuth('comment')}
                                    className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border hover:border-primary/60 bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer text-xs text-muted-foreground"
                                >
                                    <span>Sign in or register to leave a comment on this post...</span>
                                    <Button size="sm" className="h-8 font-bold text-xs">
                                        Sign In
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Comments List */}
                <div className="space-y-3">
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
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Card className="rounded-2xl border border-border/70 bg-card/80 shadow-2xs hover:border-border transition-colors">
                                        <CardContent className="p-5 flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                                <Link to={`/@${comment.user?.username || ''}`}>
                                                    <Avatar
                                                        size="sm"
                                                        fallback={comment.user?.display_name || comment.user?.username || '?'}
                                                        src={comment.user?.avatar_url}
                                                        className="mt-0.5 ring-1 ring-border"
                                                    />
                                                </Link>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Link
                                                            to={`/@${comment.user?.username || ''}`}
                                                            className="font-bold text-xs text-foreground hover:text-primary transition-colors"
                                                        >
                                                            {comment.user?.display_name || comment.user?.username}
                                                        </Link>
                                                        {comment.user_id === post.user_id && (
                                                             <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                                                                Author
                                                            </span>
                                                        )}
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {formatPostDate(comment.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                                        {comment.content || comment.body}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Delete Comment for Comment Owner or Admin */}
                                            {user && (user.id === comment.user_id || user.role === 'admin') && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    disabled={deletingCommentId === comment.id}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0"
                                                    title="Delete comment"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
