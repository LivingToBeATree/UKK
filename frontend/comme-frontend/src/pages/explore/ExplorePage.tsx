import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageSquare, Bookmark, Plus, ImageIcon } from 'lucide-react';
import { postService } from '@/services/postService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { Post, PaginationMeta } from '@/types';

export const ExplorePage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchPosts = async (p: number) => {
        try {
            setLoading(true);
            const res = await postService.list(p);
            setPosts(p === 1 ? res.data : [...posts, ...res.data]);
            setMeta(res.meta ?? null);
        } catch {
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(page); }, [page]);

    const handleLike = async (postId: number) => {
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

    const handleBookmark = async (postId: number) => {
        try {
            const res = await postService.toggleBookmark(postId);
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId ? { ...p, is_bookmarked: res.bookmarked } : p
                )
            );
        } catch {
            toast.error('Failed to bookmark');
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Explore</h1>
                    <p className="text-sm text-muted-foreground">See what the community is creating</p>
                </div>
                {isAuthenticated && (
                    <Link to="/posts/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> New Post
                        </Button>
                    </Link>
                )}
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
                {loading && posts.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-3 w-28" />
                                        <Skeleton className="h-2.5 w-20" />
                                    </div>
                                </div>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))
                ) : posts.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <AnimatePresence>
                        {posts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <Card className="hover:border-primary/30 transition-colors">
                                    <CardContent className="p-5">
                                        {/* Author */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <Avatar
                                                size="sm"
                                                fallback={post.user?.display_name || post.user?.username || '?'}
                                                src={post.user?.avatar_url}
                                            />
                                            <div>
                                                <Link
                                                    to={`/artists/${post.user_id}`}
                                                    className="font-semibold text-sm hover:text-primary transition-colors"
                                                >
                                                    {post.user?.display_name || post.user?.username}
                                                </Link>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <Link to={`/posts/${post.id}`}>
                                            <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                                                {post.content}
                                            </p>
                                        </Link>

                                        {/* Media */}
                                        {post.media && post.media.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 mb-4 rounded-lg overflow-hidden">
                                                {post.media.slice(0, 4).map((m) => (
                                                    <img
                                                        key={m.id}
                                                        src={m.url}
                                                        alt=""
                                                        className="w-full h-48 object-cover bg-muted"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-4 pt-2 border-t border-border">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className={`flex items-center gap-1.5 text-xs transition-colors ${
                                                    post.is_liked ? 'text-rose-400' : 'text-muted-foreground hover:text-rose-400'
                                                }`}
                                            >
                                                <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                                                {post.likes_count}
                                            </button>

                                            <Link
                                                to={`/posts/${post.id}`}
                                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                {post.comments_count}
                                            </Link>

                                            <button
                                                onClick={() => handleBookmark(post.id)}
                                                className={`flex items-center gap-1.5 text-xs transition-colors ml-auto ${
                                                    post.is_bookmarked ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400'
                                                }`}
                                            >
                                                <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {/* Load More */}
                {meta && meta.current_page < meta.last_page && (
                    <div className="text-center pt-4">
                        <Button variant="outline" onClick={() => setPage(page + 1)} disabled={loading}>
                            {loading ? 'Loading...' : 'Load More'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
