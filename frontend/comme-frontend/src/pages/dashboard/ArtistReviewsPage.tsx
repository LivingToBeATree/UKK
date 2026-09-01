import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Star,
    Sparkles,
    CornerDownRight,
    Send,
    ThumbsUp,
    Clock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { artistReviewApi } from '@/services/artistService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { CommissionReview } from '@/types';

export const ArtistReviewsPage: React.FC = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<CommissionReview[]>([]);
    const [loading, setLoading] = useState(true);

    // Replying state
    const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const artistProfileId = user?.artist_profile?.id || (user as any)?.artistProfile?.id;

    const fetchReviews = async () => {
        if (!artistProfileId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await artistReviewApi.listByArtist(artistProfileId);
            setReviews(res.data || []);
        } catch {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [artistProfileId]);

    const handleSendReply = async (reviewId: number) => {
        if (!replyText.trim()) return;

        try {
            setSubmittingReply(true);
            const updated = await artistReviewApi.reply(reviewId, replyText.trim());
            setReviews((prev) =>
                prev.map((r) => (r.id === reviewId ? { ...r, artist_reply: updated.artist_reply, artist_replied_at: updated.artist_replied_at } : r))
            );
            toast.success('Reply posted successfully!');
            setReplyingReviewId(null);
            setReplyText('');
        } catch {
            toast.error('Failed to post reply');
        } finally {
            setSubmittingReply(false);
        }
    };

    // Calculate rating metrics
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / totalReviews).toFixed(1)
        : '5.0';

    const starCounts = [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: reviews.filter((r) => Math.round(Number(r.rating)) === stars).length,
    }));

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black flex items-center gap-2.5 text-foreground">
                    <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
                    Reviews & Client Ratings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Verified client feedback and ratings from your completed commission orders.
                </p>
            </div>

            {/* Overall Rating Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-3xl border-border/80 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 md:col-span-1 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400/90 mb-2 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Average Score
                    </span>
                    <span className="text-5xl font-black text-foreground tracking-tight font-mono">
                        {avgRating}
                    </span>
                    <div className="flex items-center gap-1 my-2.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                className={`h-4 w-4 ${
                                    s <= Math.round(Number(avgRating))
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-muted-foreground/30'
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Based on <span className="font-bold text-foreground">{totalReviews}</span> verified client reviews
                    </p>
                </Card>

                {/* Star Distribution Breakdown */}
                <Card className="rounded-3xl border-border/80 bg-card p-6 md:col-span-2 flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Rating Breakdown
                    </h3>
                    <div className="space-y-2">
                        {starCounts.map(({ stars, count }) => {
                            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                            return (
                                <div key={stars} className="flex items-center gap-3 text-xs">
                                    <span className="font-bold text-muted-foreground w-8 flex items-center gap-0.5">
                                        {stars} <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                    </span>
                                    <div className="flex-1 h-2 rounded-full bg-secondary/80 overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="w-10 text-right font-mono text-muted-foreground text-[11px]">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Reviews Feed */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <Card key={i} className="rounded-2xl border-border/80 p-5 space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                            <Skeleton className="h-12 w-full" />
                        </Card>
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <Card
                            key={review.id}
                            className="rounded-2xl border-border/80 bg-card/60 backdrop-blur-md overflow-hidden shadow-xs hover:border-amber-500/40 transition-all duration-200"
                        >
                            <CardContent className="p-5 space-y-3.5">
                                {/* Review Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            size="md"
                                            src={review.user?.avatar_url}
                                            fallback={review.user?.display_name || review.user?.username || 'Client'}
                                            className="border border-border/80"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-foreground">
                                                    {review.user?.display_name || review.user?.username || 'Verified Client'}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    @{review.user?.username || 'client'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                                {review.recommended && (
                                                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                                        • <ThumbsUp className="h-3 w-3" /> Recommends Artist
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Star Rating Badge */}
                                    <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`h-3 w-3 ${
                                                    s <= Number(review.rating)
                                                        ? 'text-amber-400 fill-amber-400'
                                                        : 'text-muted-foreground/30'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Review Content */}
                                <p className="text-sm text-foreground/90 leading-relaxed pl-1">
                                    {review.comment}
                                </p>

                                {/* Artist Reply Section */}
                                {review.artist_reply ? (
                                    <div className="ml-4 pl-4 border-l-2 border-purple-500/40 bg-purple-950/20 rounded-r-2xl p-3.5 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] font-bold">
                                                Artist Response
                                            </Badge>
                                            {review.artist_replied_at && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(review.artist_replied_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-foreground/90 italic">
                                            "{review.artist_reply}"
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        {replyingReviewId === review.id ? (
                                            <div className="ml-4 pl-4 border-l-2 border-purple-500/40 space-y-2 pt-2">
                                                <Textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write a warm response thanking the client..."
                                                    className="text-xs rounded-xl bg-secondary/50 border-border/80 min-h-[70px]"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        disabled={submittingReply || !replyText.trim()}
                                                        onClick={() => handleSendReply(review.id)}
                                                        className="h-8 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs gap-1.5"
                                                    >
                                                        <Send className="h-3 w-3" />
                                                        {submittingReply ? 'Posting...' : 'Post Reply'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setReplyingReviewId(null);
                                                            setReplyText('');
                                                        }}
                                                        className="h-8 text-xs font-semibold cursor-pointer"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setReplyingReviewId(review.id);
                                                    setReplyText('');
                                                }}
                                                className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 font-bold gap-1.5 h-8 px-3 rounded-xl cursor-pointer"
                                            >
                                                <CornerDownRight className="h-3.5 w-3.5" />
                                                Reply to review
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-3xl border-dashed border-border/80 p-12 text-center bg-card/40">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                        <Star className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">No client reviews yet</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1.5">
                        Reviews will be posted here as clients complete commissions and rate your artworks.
                    </p>
                </Card>
            )}
        </motion.div>
    );
};
