import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, Trash2, Plus, Eye, Pencil } from 'lucide-react';
import { postService } from '@/services/postService';
import { EditPostModal } from '@/components/modals/EditPostModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { Post } from '@/types';

export const ManagePostsPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await postService.list();
                setPosts(res.data);
            } catch {
                toast.error('Failed to load posts');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this post?')) return;
        try {
            await postService.destroy(id);
            setPosts(posts.filter((p) => p.id !== id));
            toast.success('Post deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6" /> My Posts
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage your social posts</p>
                </div>
                <Link to="/posts/create">
                    <Button><Plus className="h-4 w-4 mr-2" /> New Post</Button>
                </Link>
            </div>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
                    ))
                ) : posts.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">No posts yet</p>
                        </CardContent>
                    </Card>
                ) : (
                    posts.map((post) => (
                        <Card key={post.id} className="hover:border-primary/30 transition-colors">
                            <CardContent className="p-5 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{post.content}</p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        {new Date(post.created_at).toLocaleDateString()} • {post.likes_count} likes • {post.comments_count} comments
                                    </p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Link to={`/posts/${post.id}`}>
                                        <Button variant="outline" size="icon" title="View post">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setEditingPost(post)}
                                        title="Edit post"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDelete(post.id)}
                                        title="Delete post"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

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
        </motion.div>
    );
};
