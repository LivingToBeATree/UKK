import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send } from 'lucide-react';
import { postService } from '@/services/postService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';

export const CreatePostPage: React.FC = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('visibility', 'public');

            await postService.create(formData);
            toast.success('Post published!');
            navigate('/explore');
        } catch {
            toast.error('Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link
                to="/explore"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Explore
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold mb-6">Create Post</h1>

                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="content">What's on your mind?</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Share your artwork, progress, or thoughts..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={6}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" type="button" onClick={() => navigate('/explore')}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting || !content.trim()}>
                                    <Send className="h-4 w-4 mr-2" />
                                    {submitting ? 'Publishing...' : 'Publish'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
