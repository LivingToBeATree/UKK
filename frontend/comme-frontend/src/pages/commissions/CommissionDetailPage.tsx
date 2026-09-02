import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
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
    Paperclip,
    FileText,
    Download,
    Maximize2,
    Loader2,
    X,
    Lock,
    UploadCloud,
    FileCheck,
} from 'lucide-react';
import { commissionOrderApi, commissionReviewApi } from '@/services/commissionService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDateSafe, formatDateTimeSafe } from '@/utils/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaLightboxModal } from '@/components/ui/MediaLightboxModal';
import { DatePicker } from '@/components/ui/date-picker';
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

const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const CommissionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [commission, setCommission] = useState<CommissionOrder | null>(null);
    const [messages, setMessages] = useState<CommissionMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Messages auto-scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Media attachment state for chat
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<{ file: File; url: string; isImage: boolean; name: string; size: number }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Deliver Final Work state (Artist Upload)
    const [deliverModalOpen, setDeliverModalOpen] = useState(false);
    const [deliverFiles, setDeliverFiles] = useState<File[]>([]);
    const [deliverPreviews, setDeliverPreviews] = useState<{ file: File; url: string; isImage: boolean; name: string; size: number }[]>([]);
    const [deliverNote, setDeliverNote] = useState('');
    const deliverFileInputRef = useRef<HTMLInputElement>(null);

    // Lightbox modal state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxMedia, setLightboxMedia] = useState<{ url: string; file_name?: string; media_type?: string; mime_type?: string }[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Review state
    const [showReview, setShowReview] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    // Artist Reply state
    const [artistReplyText, setArtistReplyText] = useState('');
    const [showReplyForm, setShowReplyForm] = useState(false);

    // Deadline Proposal Dialog state
    const [newDeadline, setNewDeadline] = useState('');
    const [deadlineProposalNote, setDeadlineProposalNote] = useState('');
    const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);

    // Revision Dialog state
    const [revisionModalOpen, setRevisionModalOpen] = useState(false);
    const [revisionNotes, setRevisionNotes] = useState('');

    const isBuyer = Boolean(commission && user && commission.user_id === user.id);
    const isArtistUser = Boolean(
        commission &&
        user &&
        (commission.artist_profile?.user_id === user.id ||
            user.artist_profile?.id === commission.artist_profile_id)
    );

    // If an artist accesses the standalone /commissions/:id route, seamlessly redirect to /dashboard/commissions/:id for the sidebar
    useEffect(() => {
        if (commission && isArtistUser && location.pathname.startsWith('/commissions/')) {
            navigate(`/dashboard/commissions/${commission.id}`, { replace: true });
        }
    }, [commission, isArtistUser, location.pathname, navigate]);

    // Auto-scroll chat to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFilesSelect = (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        if (!fileArray.length) return;

        // Limit to max 5 files per message
        const combined = [...selectedFiles, ...fileArray].slice(0, 5);
        setSelectedFiles(combined);

        const previews = combined.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            isImage: file.type.startsWith('image/'),
            name: file.name,
            size: file.size,
        }));
        setFilePreviews(previews);
    };

    const handleRemoveFile = (index: number) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        if (filePreviews[index]?.url) {
            URL.revokeObjectURL(filePreviews[index].url);
        }
        const updatedPreviews = filePreviews.filter((_, i) => i !== index);
        setFilePreviews(updatedPreviews);
    };

    const handleDeliverFilesSelect = (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        if (!fileArray.length) return;

        const combined = [...deliverFiles, ...fileArray].slice(0, 10);
        setDeliverFiles(combined);

        const previews = combined.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            isImage: file.type.startsWith('image/'),
            name: file.name,
            size: file.size,
        }));
        setDeliverPreviews(previews);
    };

    const handleRemoveDeliverFile = (index: number) => {
        const updated = deliverFiles.filter((_, i) => i !== index);
        setDeliverFiles(updated);
        if (deliverPreviews[index]?.url) {
            URL.revokeObjectURL(deliverPreviews[index].url);
        }
        setDeliverPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmitDelivery = async () => {
        if (!commission) return;
        setActionLoading(true);
        try {
            const formData = new FormData();
            if (deliverNote.trim()) {
                formData.append('note', deliverNote.trim());
            }
            deliverFiles.forEach((file) => {
                formData.append('attachments[]', file);
            });

            const updated = await commissionOrderApi.deliver(commission.id, formData);
            setCommission(updated);
            toast.success('Completed deliverables submitted! 7-day client review window started.');
            setDeliverModalOpen(false);
            setDeliverFiles([]);
            setDeliverPreviews([]);
            setDeliverNote('');
            refreshData();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit deliverables';
            toast.error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            e.preventDefault();
            handleFilesSelect(e.clipboardData.files);
        }
    };

    const openLightbox = (mediaItems: { url: string; file_name?: string; media_type?: string; mime_type?: string }[], index = 0) => {
        setLightboxMedia(mediaItems);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

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
        if (!newMessage.trim() && selectedFiles.length === 0) return;
        setSending(true);
        try {
            const formData = new FormData();
            if (newMessage.trim()) {
                formData.append('message', newMessage.trim());
            }
            selectedFiles.forEach((file) => {
                formData.append('attachments[]', file);
            });

            const msg = await commissionOrderApi.sendMessage(Number(id), formData);
            setMessages((prev) => [...prev, msg]);
            setNewMessage('');
            setSelectedFiles([]);
            setFilePreviews([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err: unknown) {
            const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send message';
            toast.error(errorMsg);
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

            // If token is a mock/dev token or window.snap is unavailable, simulate escrow payment
            if (
                payment.snap_token?.startsWith('mock_snap_token_') ||
                typeof (window as unknown as { snap?: { pay: (token: string, cb: unknown) => void } }).snap?.pay !== 'function'
            ) {
                const updated = await commissionOrderApi.simulatePayment(commission.id);
                setCommission(updated);
                toast.success('Escrow Payment simulated successfully! Commission is now in progress.');
                refreshData();
                return;
            }

            toast.success('Midtrans payment session initialized');

            (window as unknown as { snap: { pay: (token: string, cb: unknown) => void } }).snap.pay(payment.snap_token!, {
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
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to initiate Midtrans payment';
            toast.error(msg);
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

    const handleProposeDeadline = async () => {
        if (!commission || !newDeadline) return;
        setActionLoading(true);
        try {
            const updated = await commissionOrderApi.proposeDeadline(commission.id, {
                proposed_deadline: newDeadline,
                note: deadlineProposalNote.trim() || undefined,
            });
            setCommission(updated);
            toast.success('Deadline extension proposal submitted to client!');
            setDeadlineModalOpen(false);
            setDeadlineProposalNote('');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to propose deadline';
            toast.error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAcceptDeadline = async () => {
        if (!commission) return;
        setActionLoading(true);
        try {
            const updated = await commissionOrderApi.acceptDeadline(commission.id);
            setCommission(updated);
            toast.success('New delivery deadline accepted!');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to accept proposed deadline';
            toast.error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeclineDeadline = async () => {
        if (!commission) return;
        setActionLoading(true);
        try {
            const updated = await commissionOrderApi.declineDeadline(commission.id);
            setCommission(updated);
            toast.info('Deadline proposal declined/withdrawn.');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to decline proposal';
            toast.error(msg);
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

    const isInsideDashboard = location.pathname.startsWith('/dashboard');

    if (loading) {
        return (
            <div className={`w-full max-w-7xl mx-auto space-y-6 ${isInsideDashboard ? '' : 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8'}`}>
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-6">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-44 w-full rounded-2xl" />
                    </div>
                    <div className="lg:col-span-5">
                        <Skeleton className="h-[480px] w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!commission) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
                <h2 className="text-xl font-bold">Commission Not Found</h2>
                <p className="text-sm text-muted-foreground">The commission order does not exist or you do not have permission to view it.</p>
                <Link to={isArtistUser ? "/dashboard/commissions" : "/commissions"}>
                    <Button variant="outline">
                        {isArtistUser ? "Back to Studio Order Queue" : "Back to My Commissions"}
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className={`w-full max-w-7xl mx-auto space-y-6 pb-16 ${isInsideDashboard ? '' : 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8'}`}>
            {/* Header Navigation */}
            <div className="flex items-center justify-between gap-4">
                <Link
                    to={isArtistUser ? "/dashboard/commissions" : "/commissions"}
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border border-border bg-card/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all shadow-xs"
                >
                    <ArrowLeft className="h-4 w-4" /> {isArtistUser ? "Back to Studio Order Queue" : "Back to My Commissions"}
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">Order #COM-{commission.id}</span>
                    <Badge variant={commission.status === 'completed' ? 'teal' : commission.status === 'in_progress' ? 'purple' : 'gold'}>
                        Status: {commission.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── Left Column: Order Summary & Review (7 cols) ── */}
                <div className="lg:col-span-7 xl:col-span-7 space-y-6">
                    {/* 1. Order Summary Card */}
                    <Card className="overflow-hidden border border-border bg-card/80 backdrop-blur-md shadow-xs">
                        <div className="h-2 bg-gradient-to-r from-primary via-emerald-400 to-amber-400" />
                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-5">
                                <div className="space-y-1">
                                    <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                                        {commission.commission_service?.name || `Commission Order #${commission.id}`}
                                    </h1>
                                    <p className="text-xs text-muted-foreground">
                                        Package Tier: <span className="font-semibold text-foreground">{commission.commission_option?.title || 'Standard Service'}</span>
                                    </p>
                                    {commission.addons_selections && commission.addons_selections.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Add-ons:</span>
                                            {commission.addons_selections.map((addon) => (
                                                <Badge key={addon.id} variant="secondary" className="text-[10px] bg-secondary/80 text-foreground font-medium">
                                                    +{addon.title} ({formatPrice(addon.price)})
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-left sm:text-right shrink-0 bg-secondary/30 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                    <span className="text-[11px] text-muted-foreground block font-mono uppercase font-bold">Total Agreed Price</span>
                                    <span className="text-2xl font-black text-primary font-mono">{formatPrice(commission.total_price)}</span>
                                </div>
                            </div>

                            {/* Parties Metadata */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                {/* Artist Info */}
                                <div className="p-3.5 rounded-2xl border border-border bg-secondary/30 flex items-center gap-3">
                                    <Avatar size="md" fallback={commission.artist_profile?.user?.display_name || commission.artist_profile?.user?.username || 'Artist'} src={commission.artist_profile?.user?.avatar_url} isOnline={true} />
                                    <div className="min-w-0">
                                        <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold block">Illustrator</span>
                                        <span className="font-bold text-foreground truncate block">{commission.artist_profile?.user?.display_name || commission.artist_profile?.user?.username || 'Artist Creator'}</span>
                                        <span className="text-[11px] text-muted-foreground block">@{commission.artist_profile?.user?.username || 'artist'}</span>
                                    </div>
                                </div>

                                {/* Buyer Info */}
                                <div className="p-3.5 rounded-2xl border border-border bg-secondary/30 flex items-center gap-3">
                                    <Avatar size="md" fallback={commission.user?.display_name || commission.user?.username || 'Client'} src={commission.user?.avatar_url} />
                                    <div className="min-w-0">
                                        <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold block">Client / Commissioner</span>
                                        <span className="font-bold text-foreground truncate block">{commission.user?.display_name || commission.user?.username || 'Client'}</span>
                                        <span className="text-[11px] text-muted-foreground block">@{commission.user?.username || 'client'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deadline & Timelines */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                                <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                                    <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                        <Calendar className="h-3.5 w-3.5 text-primary" /> Created
                                    </p>
                                    <p className="font-bold mt-1 text-foreground">{formatDateSafe(commission.created_at)}</p>
                                </div>
                                <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                                    <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                        <Clock className="h-3.5 w-3.5 text-amber-400" /> Deadline
                                    </p>
                                    <p className="font-bold mt-1 text-foreground">
                                        {formatDateSafe(commission.deadline, { dateStyle: 'medium' }, 'Flexible')}
                                    </p>
                                    {commission.proposed_deadline && (
                                        <span className="text-[10px] text-purple-400 block mt-0.5 font-mono">
                                            Proposed: {formatDateSafe(commission.proposed_deadline, { dateStyle: 'short' })}
                                        </span>
                                    )}
                                </div>
                                <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                                    <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
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

                            {/* BUYER: Deadline Extension Proposal Alert Banner */}
                            {isBuyer && commission.proposed_deadline && (
                                <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/40 bg-purple-500/10 backdrop-blur-md space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="font-bold text-sm text-purple-300 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-purple-400" /> Deadline Extension Proposed by Artist
                                            </p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                The artist has requested to extend the delivery deadline to{' '}
                                                <span className="font-bold text-foreground font-mono">
                                                    {formatDateSafe(commission.proposed_deadline, { dateStyle: 'medium' })}
                                                </span>.
                                            </p>
                                        </div>
                                        <Badge variant="purple" className="shrink-0 font-mono text-[10px]">
                                            Pending Your Approval
                                        </Badge>
                                    </div>

                                    {commission.deadline_proposal_note && (
                                        <div className="p-3 rounded-xl bg-black/20 border border-purple-500/20 text-xs text-foreground/90 italic">
                                            "{commission.deadline_proposal_note}"
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2.5 pt-1">
                                        <Button
                                            size="sm"
                                            onClick={handleAcceptDeadline}
                                            disabled={actionLoading}
                                            className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                                        >
                                            <CheckCircle2 className="h-4 w-4" /> Accept New Deadline
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleDeclineDeadline}
                                            disabled={actionLoading}
                                            className="cursor-pointer"
                                        >
                                            Decline Proposal
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ARTIST: Deadline Extension Proposal Pending Banner */}
                            {isArtistUser && commission.proposed_deadline && (
                                <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 space-y-2 text-xs">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-bold text-purple-300 flex items-center gap-1.5">
                                            <Clock className="h-4 w-4 text-purple-400" /> Pending Deadline Extension Proposal
                                        </p>
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            onClick={handleDeclineDeadline}
                                            disabled={actionLoading}
                                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                            Withdraw Proposal
                                        </Button>
                                    </div>
                                    <p className="text-muted-foreground">
                                        You proposed to extend the deadline to{' '}
                                        <span className="font-bold text-foreground font-mono">
                                            {formatDateSafe(commission.proposed_deadline, { dateStyle: 'medium' })}
                                        </span>. Awaiting client's review.
                                    </p>
                                </div>
                            )}

                            {/* Brief Description */}
                            {commission.description && (
                                <div className="space-y-1.5 pt-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">Order Brief & Requirements</Label>
                                    <p className="text-xs sm:text-sm bg-muted/50 rounded-2xl p-4 leading-relaxed text-foreground/90 whitespace-pre-wrap border border-border/50">
                                        {commission.description}
                                    </p>
                                </div>
                            )}

                            {/* Review Window Notice when WAITING_FOR_CLIENT */}
                            {commission.status === 'waiting_for_client' && (
                                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-1 text-xs">
                                    <p className="font-bold text-amber-400 flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" /> Work Delivered — Review Window Active
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {isBuyer
                                            ? `The artist has delivered their work. Please inspect the deliverables. If everything looks good, confirm to release payment. If changes are needed, you can request a revision. If no action is taken, funds will automatically release on ${formatDateTimeSafe(commission.review_deadline, '7 days')}.`
                                            : `You marked this work as delivered. The client has until ${formatDateTimeSafe(commission.review_deadline, '7 days')} to review or request a revision, after which your payout will automatically be released.`}
                                    </p>
                                </div>
                            )}

                            {/* Payout Status Banner when COMPLETED */}
                            {commission.status === 'completed' && commission.payout && (
                                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-1 text-xs">
                                    <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4" /> Payout Ledger Status: {commission.payout.status?.toUpperCase()}
                                    </p>
                                    <p className="text-muted-foreground">
                                        Reference: <span className="font-mono text-foreground font-semibold">{commission.payout.reference}</span> • Destination: <span className="font-semibold text-foreground">{commission.payout.bank_name || 'Bank'}</span> ({commission.payout.bank_account_number})
                                    </p>
                                </div>
                            )}

                            {/* Final Deliverables Showcase (When waiting_for_client or completed) */}
                            {['waiting_for_client', 'completed'].includes(commission.status) && (
                                <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                                                <FileCheck className="h-4 w-4" /> Final Deliverables & Completed Work
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Delivered on {formatDateTimeSafe(commission.delivered_at, 'Recently')}
                                            </p>
                                        </div>
                                        <Badge variant="teal" className="shrink-0 font-mono text-[10px]">
                                            {commission.status === 'completed' ? 'Delivered & Accepted' : 'Under Review'}
                                        </Badge>
                                    </div>

                                    {/* Deliverable media grid */}
                                    {messages.some(m => m.message?.startsWith('[Final Work Delivered]') && m.media && m.media.length > 0) ? (
                                        <div className="space-y-2 pt-1">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                                {messages
                                                    .filter(m => m.message?.startsWith('[Final Work Delivered]'))
                                                    .flatMap(m => m.media || [])
                                                    .map((item, idx, allMedia) => {
                                                        const isImage = !item.media_type || item.media_type === 'image' || item.mime_type?.startsWith('image/');
                                                        return (
                                                            <div key={item.id || idx} className="group relative rounded-xl overflow-hidden border border-border bg-card">
                                                                {isImage ? (
                                                                    <div
                                                                        onClick={() => openLightbox(allMedia, idx)}
                                                                        className="aspect-square cursor-pointer overflow-hidden bg-black/20 relative"
                                                                    >
                                                                        <img
                                                                            src={item.url}
                                                                            alt={item.file_name || 'Deliverable'}
                                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                            <Maximize2 className="h-5 w-5 drop-shadow" />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="aspect-square p-3 flex flex-col items-center justify-center text-center bg-muted/40 gap-1.5">
                                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                                            <FileText className="h-5 w-5" />
                                                                        </div>
                                                                        <p className="font-semibold text-[11px] truncate w-full px-1 text-foreground">{item.file_name || 'File'}</p>
                                                                    </div>
                                                                )}
                                                                <div className="p-2 border-t border-border flex items-center justify-between gap-1.5 bg-card/90">
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-[11px] font-medium truncate text-foreground">{item.file_name || 'Deliverable'}</p>
                                                                        {item.size && <p className="text-[9px] text-muted-foreground">{formatFileSize(item.size)}</p>}
                                                                    </div>
                                                                    <a
                                                                        href={item.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        download={item.file_name || 'deliverable'}
                                                                        className="h-7 w-7 rounded-lg bg-secondary hover:bg-muted text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                                                                        title="Download deliverable"
                                                                    >
                                                                        <Download className="h-3.5 w-3.5" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">
                                            Final work deliverables have been submitted by the artist in the workspace.
                                        </p>
                                    )}
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
                                        className="gap-2 shadow-lg shadow-primary/25 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
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
                                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Accept Deliverables & Release Payout
                                    </Button>
                                )}

                                {/* BUYER: Request Revision (When Status is 'waiting_for_client' or 'in_progress') */}
                                {isBuyer && ['waiting_for_client', 'in_progress'].includes(commission.status) && (
                                    <Dialog open={revisionModalOpen} onOpenChange={setRevisionModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
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
                                    <Button variant="destructive" size="sm" onClick={handleCancel} disabled={actionLoading} className="cursor-pointer">
                                        <XCircle className="h-4 w-4 mr-1.5" /> Cancel Request
                                    </Button>
                                )}

                                {/* BUYER: Leave Review (When Completed) */}
                                {isBuyer && commission.status === 'completed' && !commission.review && !showReview && (
                                    <Button size="sm" onClick={() => setShowReview(true)} className="gap-1.5 cursor-pointer">
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
                                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                                        >
                                            <CheckCircle2 className="h-4 w-4" /> Accept Commission
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleDecline}
                                            disabled={actionLoading}
                                            className="gap-1.5 font-bold cursor-pointer"
                                        >
                                            <XCircle className="h-4 w-4" /> Decline
                                        </Button>
                                    </>
                                )}

                                {/* ARTIST: Deliver Completed Work (When In Progress or Revision) */}
                                {isArtistUser && ['in_progress', 'revision'].includes(commission.status) && (
                                    <Dialog open={deliverModalOpen} onOpenChange={setDeliverModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/20"
                                            >
                                                <UploadCloud className="h-4 w-4" /> Deliver Completed Work
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-xl">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <UploadCloud className="h-5 w-5 text-emerald-400" /> Deliver Completed Commission Work
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Upload your final high-resolution files (PNG, JPG, PSD, CLIP, PDF, ZIP). The client will receive these deliverables and enter the 7-day review window.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-4 py-3">
                                                {/* Upload Drag & Drop Zone */}
                                                <div
                                                    onClick={() => deliverFileInputRef.current?.click()}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        if (e.dataTransfer.files) handleDeliverFilesSelect(e.dataTransfer.files);
                                                    }}
                                                    className="border-2 border-dashed border-border/80 hover:border-emerald-500/60 bg-muted/20 hover:bg-emerald-500/5 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                                                >
                                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                                                        <UploadCloud className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground">Click to browse or drag & drop deliverable files</p>
                                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                                            PNG, JPG, PSD, CLIP, PDF, ZIP (Max 10 files)
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        ref={deliverFileInputRef}
                                                        onChange={(e) => {
                                                            if (e.target.files) handleDeliverFilesSelect(e.target.files);
                                                        }}
                                                        multiple
                                                        accept="image/*,.png,.jpg,.jpeg,.gif,.webp,.pdf,.zip,.psd,.clip,.rar,.7z"
                                                        className="hidden"
                                                    />
                                                </div>

                                                {/* Previews Grid */}
                                                {deliverPreviews.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold text-muted-foreground">Attached Deliverable Files ({deliverPreviews.length})</Label>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                                            {deliverPreviews.map((p, idx) => (
                                                                <div key={idx} className="relative rounded-xl border border-border bg-card p-2 flex items-center gap-2.5">
                                                                    {p.isImage ? (
                                                                        <img src={p.url} alt={p.name} className="h-10 w-10 object-cover rounded-lg shrink-0" />
                                                                    ) : (
                                                                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                                                            <FileText className="h-5 w-5" />
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="font-semibold text-xs truncate text-foreground">{p.name}</p>
                                                                        <p className="text-[10px] text-muted-foreground">{formatFileSize(p.size)}</p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRemoveDeliverFile(idx);
                                                                        }}
                                                                        className="h-6 w-6 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center cursor-pointer transition-colors"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Delivery Note */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-muted-foreground">Delivery Message & Notes for Client</Label>
                                                    <Textarea
                                                        placeholder="e.g. Here is the full resolution artwork with transparent and background variants, along with the source files! Thank you for the wonderful commission."
                                                        rows={3}
                                                        value={deliverNote}
                                                        onChange={(e) => setDeliverNote(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <DialogFooter className="gap-2 sm:gap-0">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setDeliverModalOpen(false)}
                                                    disabled={actionLoading}
                                                    className="cursor-pointer"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSubmitDelivery}
                                                    disabled={actionLoading || (deliverFiles.length === 0 && !deliverNote.trim())}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer gap-1.5"
                                                >
                                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                    Confirm & Send Deliverables
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}

                                {/* ARTIST: Propose New Deadline */}
                                {isArtistUser && !['completed', 'cancelled', 'declined', 'pending'].includes(commission.status) && (
                                    <Dialog open={deadlineModalOpen} onOpenChange={setDeadlineModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
                                                <Calendar className="h-3.5 w-3.5 text-purple-400" /> Propose New Deadline
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Propose New Delivery Deadline</DialogTitle>
                                                <DialogDescription>
                                                    Select a proposed delivery date. The client will be asked to review and accept or decline your proposal.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-3">
                                                <div className="space-y-2">
                                                    <Label>Proposed Delivery Date</Label>
                                                    <DatePicker
                                                        value={newDeadline}
                                                        onChange={setNewDeadline}
                                                        minDate={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                                        placeholder="Select proposed deadline..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Reason / Note for Client (Optional)</Label>
                                                    <Textarea
                                                        placeholder="e.g. Need a few extra days to polish complex background rendering and character armor..."
                                                        rows={3}
                                                        value={deadlineProposalNote}
                                                        onChange={(e) => setDeadlineProposalNote(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    onClick={handleProposeDeadline}
                                                    disabled={actionLoading || !newDeadline}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                                                >
                                                    Send Proposal to Client
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
                        <Card className="border border-border bg-card/80 backdrop-blur-md shadow-xs">
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

                                <p className="text-xs sm:text-sm text-foreground/90 bg-muted/40 p-4 rounded-xl leading-relaxed border border-border/40">
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
                                            <Button size="xs" variant="outline" onClick={() => setShowReplyForm(true)} className="cursor-pointer">
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
                        <Card className="border border-primary/30 bg-card/80 backdrop-blur-md shadow-xs">
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
                                        <Button type="submit" disabled={reviewSubmitting || !reviewComment.trim()} className="cursor-pointer font-bold">
                                            Submit Review
                                        </Button>
                                        <Button type="button" variant="ghost" onClick={() => setShowReview(false)} className="cursor-pointer">
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* ── Right Column: Collaboration & Direct Chat (5 cols) ── */}
                <div className="lg:col-span-5 xl:col-span-5 space-y-6 lg:sticky lg:top-6">
                    <Card className="border border-border bg-card/80 backdrop-blur-md shadow-xs overflow-hidden flex flex-col h-[640px]">
                        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">
                                        Commission Chat
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground">Direct collaboration workspace</p>
                                </div>
                            </div>
                            <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                                {messages.length} msg{messages.length === 1 ? '' : 's'}
                            </Badge>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-muted-foreground">
                                    <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                                    <p className="text-xs">No messages in this workspace yet.</p>
                                    <p className="text-[11px] text-muted-foreground/70">Send a note to discuss poses, references, and sketch updates!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.user_id === user?.id || msg.sender_id === user?.id;
                                    const hasMedia = msg.media && msg.media.length > 0;
                                    const imageMedia = hasMedia
                                        ? msg.media!.filter(
                                              (m) =>
                                                  !m.media_type ||
                                                  m.media_type === 'image' ||
                                                  m.mime_type?.startsWith('image/')
                                          )
                                        : [];
                                    const otherMedia = hasMedia
                                        ? msg.media!.filter(
                                              (m) =>
                                                  m.media_type !== 'image' &&
                                                  !m.mime_type?.startsWith('image/')
                                          )
                                        : [];

                                    return (
                                        <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <Avatar
                                                size="sm"
                                                fallback={msg.user?.display_name || msg.user?.username || '?'}
                                                src={msg.user?.avatar_url}
                                            />
                                            <div className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                                                isMe
                                                    ? 'bg-primary text-primary-foreground rounded-tr-xs shadow-xs'
                                                    : 'bg-muted/80 text-foreground rounded-tl-xs border border-border/40'
                                            }`}>
                                                {/* Text Message */}
                                                {msg.message && (
                                                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                                )}

                                                {/* Image Attachments Grid */}
                                                {imageMedia.length > 0 && (
                                                    <div className={`grid gap-1.5 rounded-xl overflow-hidden ${
                                                        imageMedia.length === 1 ? 'grid-cols-1 max-w-[260px]' : 'grid-cols-2 max-w-[300px]'
                                                    }`}>
                                                        {imageMedia.map((mediaItem, idx) => (
                                                            <div
                                                                key={mediaItem.id || idx}
                                                                onClick={() => openLightbox(imageMedia, idx)}
                                                                className="group relative cursor-pointer overflow-hidden rounded-lg bg-black/20 aspect-video sm:aspect-square"
                                                            >
                                                                <img
                                                                    src={mediaItem.url}
                                                                    alt={mediaItem.file_name || 'Attached image'}
                                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                    loading="lazy"
                                                                />
                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                    <Maximize2 className="h-5 w-5 drop-shadow" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Non-Image File Attachments */}
                                                {otherMedia.length > 0 && (
                                                    <div className="space-y-1.5 pt-1">
                                                        {otherMedia.map((mediaItem, idx) => (
                                                            <a
                                                                key={mediaItem.id || idx}
                                                                href={mediaItem.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download={mediaItem.file_name || 'attachment'}
                                                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-xs ${
                                                                    isMe
                                                                        ? 'bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20 text-primary-foreground'
                                                                        : 'bg-card border-border hover:bg-secondary text-foreground'
                                                                }`}
                                                            >
                                                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                                                                    <FileText className="h-4 w-4" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-semibold truncate text-[11px]">{mediaItem.file_name || 'Attachment'}</p>
                                                                    {mediaItem.size && (
                                                                        <p className="text-[10px] opacity-75">{formatFileSize(mediaItem.size)}</p>
                                                                    )}
                                                                </div>
                                                                <Download className="h-4 w-4 shrink-0 opacity-80" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                <p className={`text-[10px] font-mono ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                    {formatDateSafe(msg.created_at, { hour: '2-digit', minute: '2-digit' }, 'Just now')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* File Previews Tray */}
                        {filePreviews.length > 0 && (
                            <div className="p-2.5 border-t border-border bg-muted/30 flex items-center gap-2 overflow-x-auto">
                                {filePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative group shrink-0 rounded-xl overflow-hidden border border-border bg-card p-1 flex items-center gap-2 pr-2">
                                        {preview.isImage ? (
                                            <img src={preview.url} alt={preview.name} className="h-10 w-10 object-cover rounded-lg" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                        )}
                                        <div className="text-[11px] max-w-[120px]">
                                            <p className="font-medium truncate text-foreground">{preview.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{formatFileSize(preview.size)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(idx)}
                                            className="h-5 w-5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => {
                                if (e.target.files) handleFilesSelect(e.target.files);
                            }}
                            multiple
                            accept="image/*,.png,.jpg,.jpeg,.gif,.webp,.pdf,.zip,.psd,.clip"
                            className="hidden"
                        />

                        {/* Message Input Form or Status Lock Notice */}
                        {['accepted', 'in_progress', 'waiting_for_client', 'revision'].includes(commission.status) ? (
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-muted/10 flex items-center gap-2">
                                {/* Media Attachment Insert Button */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Attach media or files (Images, Sketches, PSDs, PDFs, ZIPs)"
                                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </Button>

                                <Input
                                    placeholder="Type a message or paste revision feedback..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onPaste={handlePaste}
                                    className="flex-1 text-xs h-9 bg-card"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-9 w-9 shrink-0 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                                    disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}
                                >
                                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        ) : commission.status === 'pending' ? (
                            <div className="p-4 border-t border-border bg-muted/20 text-center space-y-1.5">
                                <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs">
                                    <Lock className="h-4 w-4" /> Workspace Locked
                                </div>
                                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                                    Direct messaging will unlock once the artist reviews and accepts this commission request.
                                </p>
                            </div>
                        ) : commission.status === 'completed' ? (
                            <div className="p-4 border-t border-border bg-muted/20 text-center space-y-1">
                                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs">
                                    <CheckCircle2 className="h-4 w-4" /> Commission Completed
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    This commission has concluded. Workspace chat is archived.
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 border-t border-border bg-muted/20 text-center space-y-1">
                                <div className="flex items-center justify-center gap-1.5 text-rose-400 font-bold text-xs">
                                    <XCircle className="h-4 w-4" /> Commission {commission.status.toUpperCase()}
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    This commission was {commission.status}. Workspace chat is archived.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </motion.div>

            {/* Media Lightbox Modal for Chat Images & Media */}
            <MediaLightboxModal
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                mediaList={lightboxMedia}
                initialIndex={lightboxIndex}
            />
        </div>
    );
};

