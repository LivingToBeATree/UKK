import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Star, XCircle } from 'lucide-react';
import { commissionOrderApi, commissionReviewApi } from '@/services/commissionService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { CommissionOrder, CommissionMessage } from '@/types';

export const CommissionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [commission, setCommission] = useState<CommissionOrder | null>(null);
    const [messages, setMessages] = useState<CommissionMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Review state
    const [showReview, setShowReview] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewBody, setReviewBody] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await commissionOrderApi.show(Number(id));
                setCommission(data);
                const msgRes = await commissionOrderApi.getMessages(Number(id));
                setMessages(msgRes.data);
            } catch {
                toast.error('Failed to load commission');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('message', newMessage);
            const msg = await commissionOrderApi.sendMessage(Number(id), formData);
            setMessages([...messages, msg]);
            setNewMessage('');
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleCancel = async () => {
        if (!commission) return;
        try {
            const updated = await commissionOrderApi.cancel(commission.id);
            setCommission(updated);
            toast.success('Commission cancelled');
        } catch {
            toast.error('Failed to cancel');
        }
    };

    const handleReview = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await commissionReviewApi.create(Number(id), { rating: reviewRating, body: reviewBody });
            toast.success('Review submitted!');
            setShowReview(false);
        } catch {
            toast.error('Failed to submit review');
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (!commission) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <p className="text-muted-foreground">Commission not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Link to="/commissions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to Commissions
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Commission Info */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold">
                                {commission.commission_service?.name || `Commission #${commission.id}`}
                            </h1>
                            <Badge variant="secondary">{commission.status.replace('_', ' ')}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Total Price</p>
                                <p className="font-bold text-primary">${commission.total_price.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Created</p>
                                <p className="font-medium">{new Date(commission.created_at).toLocaleDateString()}</p>
                            </div>
                            {commission.deadline && (
                                <div>
                                    <p className="text-muted-foreground">Deadline</p>
                                    <p className="font-medium">{new Date(commission.deadline).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>

                        {commission.description && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Description</p>
                                <p className="text-sm bg-muted/50 rounded-lg p-3">{commission.description}</p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {commission.status === 'pending' && (
                                <Button variant="destructive" size="sm" onClick={handleCancel}>
                                    <XCircle className="h-4 w-4 mr-1" /> Cancel
                                </Button>
                            )}
                            {commission.status === 'completed' && !showReview && (
                                <Button size="sm" onClick={() => setShowReview(true)}>
                                    <Star className="h-4 w-4 mr-1" /> Leave Review
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Review Form */}
                {showReview && (
                    <Card>
                        <CardContent className="p-6">
                            <form onSubmit={handleReview} className="space-y-4">
                                <h2 className="font-bold">Leave a Review</h2>
                                <div className="space-y-2">
                                    <Label>Rating</Label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setReviewRating(n)}
                                                className="p-1"
                                            >
                                                <Star className={`h-6 w-6 ${n <= reviewRating ? 'text-amber-400 fill-current' : 'text-muted'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="review-body">Your Review</Label>
                                    <Textarea
                                        id="review-body"
                                        value={reviewBody}
                                        onChange={(e) => setReviewBody(e.target.value)}
                                        placeholder="How was your experience?"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit">Submit Review</Button>
                                    <Button type="button" variant="ghost" onClick={() => setShowReview(false)}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Messages / Chat */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="font-bold mb-4">Messages ({messages.length})</h2>

                        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                            {messages.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.user_id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <Avatar
                                                size="sm"
                                                fallback={msg.user?.display_name || msg.user?.username || '?'}
                                                src={msg.user?.avatar_url}
                                            />
                                            <div className={`max-w-[70%] p-3 rounded-xl text-sm ${
                                                isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                            }`}>
                                                {msg.message}
                                                <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Message Input */}
                        {!['cancelled', 'declined'].includes(commission.status) && (
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
