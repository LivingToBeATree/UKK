import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Send,
    Star,
    XCircle,
    CheckCircle2,
    CreditCard,
    Calendar,
    Clock,
    Sparkles,
    AlertCircle,
    RefreshCw,
    MessageSquare,
} from 'lucide-react';
import { commissionOrderApi, commissionReviewApi } from '@/services/commissionService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
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
    const [actionLoading, setActionLoading] = useState(false);

    // Review state
    const [showReview, setShowReview] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    // Artist Reply state
    const [artistReplyText, setArtistReplyText] = useState('');
    const [showReplyForm, setShowReplyForm] = useState(false);

    // Deadline Dialog state
    const [newDeadline, setNewDeadline] = useState('');
    const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);

    // Revision Dialog state
    const [revisionModalOpen, setRevisionModalOpen] = useState(false);
    const [revisionNotes, setRevisionNotes] = useState('');

    const isBuyer = commission && user && commission.user_id === user.id;
    const isArtistUser =
        commission &&
        user &&
        (commission.artist_profile?.user_id === user.id ||
            user.artist_profile?.id === commission.artist_profile_id);

    const refreshData = async () => {
        if (!id) return;
        try {
            const data = await commissionOrderApi.show(Number(id));
            const msgRes = await commissionOrderApi.getMessages(Number(id));
            setCommission(data);
            setMessages(msgRes.data);
        } catch {
            // refresh error
        }
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (!id) return;
            try {
                const data = await commissionOrderApi.show(Number(id));
                const msgRes = await commissionOrderApi.getMessages(Number(id));
                if (isMounted) {
                    setCommission(data);
                    setMessages(msgRes.data);
                }
            } catch {
                if (isMounted) toast.error('Failed to load commission');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => {
            isMounted = false;
        };
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

    // Buyer actions
    const handleCancel = async () => {
        if (!commission) return;
        setActionLoading(true);
        try {
            const updated = await commissionOrderApi.cancel(commission.id);
            setCommission(updated);
            toast.success('Commission cancelled');
        } catch {
            toast.error('Failed to cancel commission');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmCompletion = async () => {
        if (!commission) return;
        setActionLoading(true);
        try {
            const updated = await commissionOrderApi.confirm(commission.id);
            setCommission(updated);
            toast.success('Commission confirmed! Payout has been queued for the artist.');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to confirm completion';
            toast.error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    const handleInitiatePayment = async () => {
        if (!commission) return;
        setActionLoading(true);
        try {
            const payment = await commissionOrderApi.initiatePayment(commission.id);
            toast.success('Midtrans payment session initialized');

            // If Snap JS is available in window
            if (payment.snap_token && typeof (window as unknown as { snap?: { pay: (token: string, cb: unknown) => void } }).snap?.pay === 'function') {
                (window as unknown as { snap: { pay: (token: string, cb: unknown) => void } }).snap.pay(payment.snap_token, {
                    onSuccess: () => {
                        toast.success('Payment captured! Commission is now in progress.');
                        refreshData();
                    },
                    onPending: () => {
                        toast.info('Payment pending completion.');
                        refreshData();
                    },
                    onError: () => {
                        toast.error('Payment failed.');
                    },
                });
            } else {
                toast.info(`Snap token generated: ${payment.snap_token || payment.order_id}`);
                refreshData();
            }
        } catch {
            toast.error('Failed to initiate Midtrans payment');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestRevision = async () => {
        if (!commission || !revisionNotes.trim()) return;
        setActionLoading(true);
        try {
            await commissionOrderApi.requestRevision(commission.id);
            const formData = new FormData();
            formData.append('message', `[Revision Request]: ${revisionNotes}`);
            await commissionOrderApi.sendMessage(commission.id, formData);
            toast.success('Revision requested. Artist notified.');
            setRevisionModalOpen(false);
            setRevisionNotes('');
            refreshData();
        } catch {
            toast.error('Failed to request revision');
        } finally {
            setActionLoading(false);
        }
    };

    // Artist actions
    const handleAccept = async () => {
        if (!commission) return;
        setActionLoading(true);
        try {
            const updated = await commissionOrderApi.accept(commission.id);
            setCommission(updated);
            toast.success('Commission accepted! Client can now proceed to payment.');
        } catch {
            toast.error('Failed to accept commission');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecline = async () => {
        if (!commission) return;
        setActionLoading(true);
        try {
            const updated = await commissionOrderApi.decline(commission.id);
            setCommission(updated);
            toast.info('Commission request declined.');
        } catch {
            toast.error('Failed to decline commission');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeliver = async () => {
        if (!commission) return;
        setActionLoading(true);
        try {
            const updated = await commissionOrderApi.deliver(commission.id);
            setCommission(updated);
            toast.success('Work marked as delivered! 7-day client review window started.');
        } catch {
            toast.error('Failed to mark work as delivered');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateDeadline = async () => {
        if (!commission || !newDeadline) return;
        setActionLoading(true);
        try {
            const updated = await commissionOrderApi.updateDeadline(commission.id, newDeadline);
            setCommission(updated);
            toast.success('Deadline updated successfully');
            setDeadlineModalOpen(false);
        } catch {
            toast.error('Failed to update deadline');
        } finally {
            setActionLoading(false);
        }
    };

    // Review submission (Buyer)
    const handleReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewComment.trim()) return;
        setReviewSubmitting(true);
        try {
            await commissionReviewApi.create(Number(id), {
                rating: reviewRating,
                title: reviewTitle || undefined,
                comment: reviewComment,
                recommended: reviewRating >= 4,
            });
            toast.success('Review submitted successfully!');
            setShowReview(false);
            refreshData();
        } catch {
            toast.error('Failed to submit review');
        } finally {
            setReviewSubmitting(false);
        }
    };

    // Artist Reply to Review
    const handleArtistReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commission?.review?.id || !artistReplyText.trim()) return;
        setActionLoading(true);
        try {
            await commissionReviewApi.reply(commission.review.id, artistReplyText);
            toast.success('Reply posted to client review');
            setShowReplyForm(false);
            refreshData();
        } catch {
            toast.error('Failed to post reply');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (!commission) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
                <h2 className="text-xl font-bold">Commission Not Found</h2>
                <p className="text-sm text-muted-foreground">The commission order does not exist or you do not have permission to view it.</p>
                <Link to="/commissions">
                    <Button variant="outline">Back to Commissions</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
                <Link to="/commissions" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to My Commissions
                </Link>
                <Badge variant={commission.status === 'completed' ? 'teal' : commission.status === 'in_progress' ? 'purple' : 'gold'}>
                    Status: {commission.status.replace('_', ' ').toUpperCase()}
                </Badge>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* 1. Order Summary Card */}
                <Card className="overflow-hidden border border-border">
                    <div className="h-2 bg-gradient-to-r from-primary via-emerald-400 to-amber-400" />
                    <CardContent className="p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-foreground">
                                    {commission.commission_service?.name || `Commission Order #${commission.id}`}
                                </h1>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Tier Option: <span className="font-semibold text-foreground">{commission.commission_option?.title || 'Custom Service'}</span>
                                </p>
                            </div>
                            <div className="text-left sm:text-right">
                                <span className="text-[11px] text-muted-foreground block font-mono uppercase">Total Agreed Price</span>
                                <span className="text-xl font-black text-primary">{formatPrice(commission.total_price)}</span>
                            </div>
                        </div>

                        {/* Parties Metadata */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {/* Artist Info */}
                            <div className="p-3 rounded-xl border border-border bg-secondary/30 flex items-center gap-3">
                                <Avatar size="md" fallback={commission.artist_profile?.user?.display_name || commission.artist_profile?.user?.username || 'Artist'} src={commission.artist_profile?.user?.avatar_url} isOnline={true} />
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold block">Illustrator</span>
                                    <span className="font-bold text-foreground">{commission.artist_profile?.user?.display_name || commission.artist_profile?.user?.username || 'Artist Creator'}</span>
                                    <span className="text-[11px] text-muted-foreground block">@{commission.artist_profile?.user?.username || 'artist'}</span>
                                </div>
                            </div>

                            {/* Buyer Info */}
                            <div className="p-3 rounded-xl border border-border bg-secondary/30 flex items-center gap-3">
                                <Avatar size="md" fallback={commission.user?.display_name || commission.user?.username || 'Client'} src={commission.user?.avatar_url} />
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold block">Client / Commissioner</span>
                                    <span className="font-bold text-foreground">{commission.user?.display_name || commission.user?.username}</span>
                                    <span className="text-[11px] text-muted-foreground block">@{commission.user?.username}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deadline & Timelines */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-2">
                            <div>
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5 text-primary" /> Created
                                </p>
                                <p className="font-bold mt-1">{new Date(commission.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-amber-400" /> Deadline
                                </p>
                                <p className="font-bold mt-1">
                                    {commission.deadline
                                        ? new Date(commission.deadline).toLocaleDateString('en-US', { dateStyle: 'medium' })
                                        : 'Flexible'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Escrow Status
                                </p>
                                <p className="font-bold mt-1 text-emerald-400">
                                    {commission.status === 'pending'
                                        ? 'Awaiting Acceptance'
                                        : commission.status === 'accepted'
                                        ? 'Ready for Payment'
                                        : commission.status === 'in_progress'
                                        ? 'Secured in Escrow'
                                        : 'Released / Settled'}
                                </p>
                            </div>
                        </div>

                        {/* Brief Description */}
                        {commission.description && (
                            <div className="space-y-1.5 pt-2">
                                <Label className="text-xs text-muted-foreground">Order Brief & Requirements</Label>
                                <p className="text-xs bg-muted/60 rounded-xl p-3.5 leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                    {commission.description}
                                </p>
                            </div>
                        )}

                        {/* Review Window Notice when WAITING_FOR_CLIENT */}
                        {commission.status === 'waiting_for_client' && (
                            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1 text-xs">
                                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" /> Work Delivered — Review Window Active
                                </p>
                                <p className="text-muted-foreground leading-relaxed">
                                    {isBuyer
                                        ? `The artist has delivered their work. Please inspect the deliverables. If everything looks good, confirm to release payment. If changes are needed, you can request a revision. If no action is taken, funds will automatically release on ${commission.review_deadline ? new Date(commission.review_deadline).toLocaleDateString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '7 days'}.`
                                        : `You marked this work as delivered. The client has until ${commission.review_deadline ? new Date(commission.review_deadline).toLocaleDateString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '7 days'} to review or request a revision, after which your payout will automatically be released.`}
                                </p>
                            </div>
                        )}

                        {/* Payout Status Banner when COMPLETED */}
                        {commission.status === 'completed' && commission.payout && (
                            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1 text-xs">
                                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4" /> Payout Ledger Status: {commission.payout.status?.toUpperCase()}
                                </p>
                                <p className="text-muted-foreground">
                                    Reference: <span className="font-mono text-foreground font-semibold">{commission.payout.reference}</span> • Destination: <span className="font-semibold text-foreground">{commission.payout.bank_name || 'Bank'}</span> ({commission.payout.bank_account_number})
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                            {/* BUYER: Pay with Midtrans (When Status is 'accepted') */}
                            {isBuyer && commission.status === 'accepted' && (
                                <Button
                                    size="lg"
                                    onClick={handleInitiatePayment}
                                    disabled={actionLoading}
                                    className="gap-2 shadow-lg shadow-primary/25 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Pay with Midtrans ({formatPrice(commission.total_price)})
                                </Button>
                            )}

                            {/* BUYER: Confirm & Release Payout (When Status is 'waiting_for_client') */}
                            {isBuyer && commission.status === 'waiting_for_client' && (
                                <Button
                                    size="lg"
                                    onClick={handleConfirmCompletion}
                                    disabled={actionLoading}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Accept Deliverables & Release Payout
                                </Button>
                            )}

                            {/* BUYER: Request Revision (When Status is 'waiting_for_client' or 'in_progress') */}
                            {isBuyer && ['waiting_for_client', 'in_progress'].includes(commission.status) && (
                                <Dialog open={revisionModalOpen} onOpenChange={setRevisionModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-1.5">
                                            <RefreshCw className="h-3.5 w-3.5 text-amber-400" /> Request Revision
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Request Commission Revision</DialogTitle>
                                            <DialogDescription>
                                                Detail what adjustments you would like the artist to make. This will pause the automatic payout timer.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-3 py-2">
                                            <Label>Revision Notes & Feedback</Label>
                                            <Textarea
                                                placeholder="e.g. Shift the eye color toward amethyst and brighten the weapon highlights..."
                                                rows={4}
                                                value={revisionNotes}
                                                onChange={(e) => setRevisionNotes(e.target.value)}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleRequestRevision} disabled={actionLoading || !revisionNotes.trim()}>
                                                Send Revision Request
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {/* BUYER: Cancel (When Pending) */}
                            {isBuyer && commission.status === 'pending' && (
                                <Button variant="destructive" size="sm" onClick={handleCancel} disabled={actionLoading}>
                                    <XCircle className="h-4 w-4 mr-1.5" /> Cancel Request
                                </Button>
                            )}

                            {/* BUYER: Leave Review (When Completed) */}
                            {isBuyer && commission.status === 'completed' && !commission.review && !showReview && (
                                <Button size="sm" onClick={() => setShowReview(true)} className="gap-1.5">
                                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Leave a Review
                                </Button>
                            )}

                            {/* ARTIST: Accept / Decline Commission (When Pending) */}
                            {isArtistUser && commission.status === 'pending' && (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={handleAccept}
                                        disabled={actionLoading}
                                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        <CheckCircle2 className="h-4 w-4" /> Accept Commission
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDecline}
                                        disabled={actionLoading}
                                        className="gap-1.5"
                                    >
                                        <XCircle className="h-4 w-4" /> Decline
                                    </Button>
                                </>
                            )}

                            {/* ARTIST: Mark as Delivered (When In Progress or Revision) */}
                            {isArtistUser && ['in_progress', 'revision'].includes(commission.status) && (
                                <Button
                                    size="sm"
                                    onClick={handleDeliver}
                                    disabled={actionLoading}
                                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <CheckCircle2 className="h-4 w-4" /> Mark as Delivered (Start 7-Day Review)
                                </Button>
                            )}

                            {/* ARTIST: Update Deadline */}
                            {isArtistUser && !['completed', 'cancelled', 'declined'].includes(commission.status) && (
                                <Dialog open={deadlineModalOpen} onOpenChange={setDeadlineModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" /> Adjust Deadline
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Update Delivery Deadline</DialogTitle>
                                            <DialogDescription>
                                                Set an updated expected delivery date for this commission.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-3 py-2">
                                            <Label>New Deadline Date</Label>
                                            <Input
                                                type="date"
                                                value={newDeadline}
                                                onChange={(e) => setNewDeadline(e.target.value)}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleUpdateDeadline} disabled={actionLoading || !newDeadline}>
                                                Update Deadline
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Review Section (Existing Review or Submission Form) */}
                {commission.review && (
                    <Card className="border border-border">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Client Review
                                </h3>
                                <div className="flex gap-1 text-amber-400">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <Star
                                            key={n}
                                            className={`h-4 w-4 ${n <= commission.review!.rating ? 'fill-current' : 'text-muted'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {commission.review.title && (
                                <h4 className="font-bold text-sm text-foreground">{commission.review.title}</h4>
                            )}

                            <p className="text-xs sm:text-sm text-foreground/90 bg-muted/40 p-4 rounded-xl leading-relaxed">
                                {commission.review.comment}
                            </p>

                            {/* Artist Reply */}
                            {commission.review.artist_reply ? (
                                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5 ml-4 sm:ml-8">
                                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5" /> Artist Response:
                                    </span>
                                    <p className="text-xs text-foreground/80 leading-relaxed">{commission.review.artist_reply}</p>
                                </div>
                            ) : isArtistUser ? (
                                <div>
                                    {!showReplyForm ? (
                                        <Button size="xs" variant="outline" onClick={() => setShowReplyForm(true)}>
                                            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Reply to Review
                                        </Button>
                                    ) : (
                                        <form onSubmit={handleArtistReply} className="space-y-3 pt-2">
                                            <Label>Your Response as Artist</Label>
                                            <Textarea
                                                placeholder="Thank you for commissioning me! It was a pleasure working with your character design..."
                                                rows={3}
                                                value={artistReplyText}
                                                onChange={(e) => setArtistReplyText(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <Button size="xs" type="submit" disabled={actionLoading || !artistReplyText.trim()}>
                                                    Post Reply
                                                </Button>
                                                <Button size="xs" variant="ghost" type="button" onClick={() => setShowReplyForm(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                )}

                {/* Review Submission Form (Buyer) */}
                {showReview && !commission.review && (
                    <Card className="border border-primary/30">
                        <CardContent className="p-6">
                            <form onSubmit={handleReview} className="space-y-4">
                                <h3 className="font-bold text-base">Leave a Review for @{commission.artist_profile?.user?.username || 'artist'}</h3>
                                <div className="space-y-2">
                                    <Label>Rating</Label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setReviewRating(n)}
                                                className="p-1 cursor-pointer"
                                            >
                                                <Star className={`h-6 w-6 ${n <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="review-title">Review Title (Optional)</Label>
                                    <Input
                                        id="review-title"
                                        value={reviewTitle}
                                        onChange={(e) => setReviewTitle(e.target.value)}
                                        placeholder="e.g. Stunning coloring and fast delivery!"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="review-comment">Your Feedback & Comment</Label>
                                    <Textarea
                                        id="review-comment"
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="Leave feedback on communication, turnaround, or the final artwork..."
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={reviewSubmitting || !reviewComment.trim()}>
                                        Submit Review
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => setShowReview(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* 3. Messages & Collaboration Thread */}
                <Card className="border border-border">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" /> Commission Chat ({messages.length})
                            </h3>
                            <span className="text-[11px] text-muted-foreground">Direct collaboration thread</span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                            {messages.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-10">
                                    No messages yet. Send a note to discuss poses, references, and sketch updates!
                                </p>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.user_id === user?.id || msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <Avatar
                                                size="sm"
                                                fallback={msg.user?.display_name || msg.user?.username || '?'}
                                                src={msg.user?.avatar_url}
                                            />
                                            <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                                isMe
                                                    ? 'bg-primary text-primary-foreground rounded-tr-xs'
                                                    : 'bg-muted text-foreground rounded-tl-xs'
                                            }`}>
                                                {msg.message}
                                                <p className={`text-[10px] mt-1 font-mono ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Message Input Form */}
                        {!['cancelled', 'declined'].includes(commission.status) && (
                            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-border">
                                <Input
                                    placeholder="Type a message or paste revision feedback..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 text-xs"
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
