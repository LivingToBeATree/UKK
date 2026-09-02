import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Heart, MessageSquare } from 'lucide-react';
import { postService } from '@/services/postService';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { formatDateSafe } from '@/utils/format';
import type { Post } from '@/types';

export const BookmarksPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await postService.getBookmarks();
                setPosts(res.data);
            } catch {
                toast.error('Failed to load bookmarks');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Bookmark className="h-6 w-6" /> Bookmarks
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Posts you've saved</p>
            </div>

            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                    ))
                ) : posts.length === 0 ? (
                    <div className="text-center py-20">
                        <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">No bookmarks yet. Explore posts and save them!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {posts.map((post) => (
                            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <Link to={`/posts/${post.id}`}>
                                    <Card className="hover:border-primary/30 transition-colors">
                                        <CardContent className="p-5">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar size="sm" fallback={post.user?.display_name || '?'} src={post.user?.avatar_url} />
                                                <div>
                                                    <p className="font-semibold text-sm">{post.user?.display_name || post.user?.username}</p>
                                                    <p className="text-[11px] text-muted-foreground">{formatDateSafe(post.created_at)}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm line-clamp-3">{post.content}</p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.likes_count}</span>
                                                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.comments_count}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
