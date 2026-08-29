import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Bookmark, ArrowLeft, Send } from 'lucide-react';
import { postService } from '@/services/postService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { Post, PostComment } from '@/types';

export const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await postService.show(Number(id));
                setPost(data);
                const commentsRes = await postService.listComments(Number(id));
                setComments(commentsRes.data);
            } catch {
                toast.error('Failed to load post');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchPost();
    }, [id]);

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const comment = await postService.createComment(Number(id), newComment);
            setComments([...comments, comment]);
            setNewComment('');
            if (post) setPost({ ...post, comments_count: post.comments_count + 1 });
        } catch {
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <p className="text-muted-foreground">Post not found</p>
                <Link to="/explore">
                    <Button variant="outline" className="mt-4">Back to Explore</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link
                to="/explore"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Explore
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                    <CardContent className="p-6">
                        {/* Author */}
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar
                                size="md"
                                fallback={post.user?.display_name || post.user?.username || '?'}
                                src={post.user?.avatar_url}
                            />
                            <div>
                                <p className="font-semibold text-sm">{post.user?.display_name || post.user?.username}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(post.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

                        {/* Media */}
                        {post.media && post.media.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {post.media.map((m) => (
                                    <img key={m.id} src={m.url} alt="" className="w-full rounded-lg bg-muted" />
                                ))}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" /> {post.likes_count} likes
                            </span>
                            <span className="flex items-center gap-1">
                                <Bookmark className="h-4 w-4" /> {post.bookmarks_count} bookmarks
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Comments Section */}
                <div className="mt-6 space-y-4">
                    <h2 className="text-lg font-bold">Comments ({comments.length})</h2>

                    {comments.map((comment) => (
                        <Card key={comment.id}>
                            <CardContent className="p-4 flex gap-3">
                                <Avatar
                                    size="sm"
                                    fallback={comment.user?.display_name || comment.user?.username || '?'}
                                    src={comment.user?.avatar_url}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-xs">
                                            {comment.user?.display_name || comment.user?.username}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1">{comment.body}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Comment Input */}
                    {user && (
                        <form onSubmit={handleComment} className="flex gap-2">
                            <Input
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={submitting || !newComment.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
