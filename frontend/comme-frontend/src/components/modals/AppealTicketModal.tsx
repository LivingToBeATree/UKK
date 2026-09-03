import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ShieldAlert,
    X,
    Send,
    Loader2,
    CheckCircle2,
    HelpCircle,
    AlertTriangle,
    LifeBuoy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { reportService } from '@/services/reportService';
import { useNavigate } from 'react-router-dom';

interface AppealTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialType?: 'post' | 'portfolio' | 'commission_service' | 'user';
    initialId?: number;
    initialTitle?: string;
    initialReason?: string;
    onSuccess?: (ticketId?: number) => void;
}

export const AppealTicketModal: React.FC<AppealTicketModalProps> = ({
    isOpen,
    onClose,
    initialType = 'post',
    initialId,
    initialTitle,
    initialReason,
    onSuccess,
}) => {
    const navigate = useNavigate();
    const isDirectAppeal = Boolean(initialId);

    const [category, setCategory] = useState<'appeal' | 'inquiry' | 'report'>(
        isDirectAppeal ? 'appeal' : 'inquiry'
    );
    const [reportableType, setReportableType] = useState<string>(initialType);
    const [reportableId, setReportableId] = useState<number | undefined>(initialId);
    const [subject, setSubject] = useState(
        initialTitle ? `Appeal Review: ${initialTitle}` : ''
    );
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            toast.error('Please provide details for your ticket request.');
            return;
        }

        if (category === 'appeal' && !reportableId) {
            toast.error('Please specify the content item ID for this appeal.');
            return;
        }

        setSubmitting(true);
        try {
            const finalDescription = subject.trim()
                ? `[${subject.trim()}]\n\n${description.trim()}`
                : description.trim();

            const reportReason = category === 'appeal' ? 'appeal' : category === 'inquiry' ? 'inquiry' : 'other';

            const created = await reportService.create({
                reportable_type: reportableType,
                reportable_id: reportableId || (initialId ?? 1),
                reason: reportReason,
                description: finalDescription,
            });

            toast.success(
                category === 'appeal'
                    ? 'Appeal ticket opened successfully! Moderation will review your request.'
                    : 'Support ticket submitted successfully!'
            );

            onClose();
            const ticketId = created?.ticket?.id;

            if (onSuccess) {
                onSuccess(ticketId);
            } else {
                navigate('/tickets');
            }
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message ||
                'Failed to submit your ticket. Please try again.';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                />

                {/* Dialog Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden z-10 space-y-5"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                                {category === 'appeal' ? (
                                    <ShieldAlert className="h-6 w-6 text-rose-400" />
                                ) : (
                                    <LifeBuoy className="h-6 w-6 text-purple-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">
                                    {category === 'appeal'
                                        ? 'Submit Moderation Appeal'
                                        : 'Open Support Ticket'}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {category === 'appeal'
                                        ? 'Request staff review for your taken-down content or warning.'
                                        : 'Connect directly with Comme support staff & moderation.'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Context Notice for Taken Down Items */}
                    {isDirectAppeal && (
                        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-1.5 text-xs">
                            <div className="flex items-center gap-2 font-bold text-rose-400">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <span>Target Item: {initialType.toUpperCase()} #{initialId}</span>
                                {initialTitle && (
                                    <span className="text-foreground/80 font-normal truncate">
                                        ("{initialTitle}")
                                    </span>
                                )}
                            </div>
                            {initialReason && (
                                <p className="text-[11px] text-muted-foreground pl-6">
                                    <span className="font-semibold text-rose-300">Take-down reason: </span>
                                    "{initialReason}"
                                </p>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* If opened generally (not a direct item appeal), show category options */}
                        {!isDirectAppeal && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">
                                    Ticket Category
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCategory('inquiry')}
                                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                                            category === 'inquiry'
                                                ? 'bg-purple-600/15 border-purple-500/60 ring-2 ring-purple-500/20'
                                                : 'bg-secondary/40 border-border/60 hover:bg-secondary/70'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                            <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                                            General Inquiry
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            Questions or general support
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCategory('appeal')}
                                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                                            category === 'appeal'
                                                ? 'bg-rose-600/15 border-rose-500/60 ring-2 ring-rose-500/20'
                                                : 'bg-secondary/40 border-border/60 hover:bg-secondary/70'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                                            Dispute / Appeal
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            Appeal moderation decisions
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Item Type & ID Selection for manual appeals */}
                        {!isDirectAppeal && category === 'appeal' && (
                            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-secondary/30 border border-border/60">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-muted-foreground">Item Type</label>
                                    <select
                                        value={reportableType}
                                        onChange={(e) => setReportableType(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/70 border border-border/80 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                    >
                                        <option value="post">Post</option>
                                        <option value="portfolio">Artwork / Portfolio</option>
                                        <option value="commission_service">Commission Listing</option>
                                        <option value="user">Account / Warning</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-muted-foreground">Item ID (Optional)</label>
                                    <input
                                        type="number"
                                        value={reportableId || ''}
                                        onChange={(e) => setReportableId(e.target.value ? Number(e.target.value) : undefined)}
                                        placeholder="e.g. 42"
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/70 border border-border/80 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Subject / Summary */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">
                                Subject / Summary
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder={
                                    category === 'appeal'
                                        ? 'e.g. Requesting review for revised artwork'
                                        : 'e.g. Need assistance with escrow payment'
                                }
                                className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary/50 border border-border/80 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                            />
                        </div>

                        {/* Appeal Explanation / Message Body */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-muted-foreground">
                                    {category === 'appeal' ? 'Appeal Justification & Edits Made' : 'Message Details'}
                                </label>
                                <span className="text-[10px] text-muted-foreground">
                                    {description.length}/1000
                                </span>
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                                rows={4}
                                placeholder={
                                    category === 'appeal'
                                        ? 'Explain why this item complies with guidelines, or explain what corrections you have made so staff can review and restore it...'
                                        : 'Describe your issue or question in detail...'
                                }
                                className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary/50 border border-border/80 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none leading-relaxed"
                            />
                        </div>

                        {/* Guidelines Note */}
                        <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50 flex items-start gap-2.5 text-[11px] text-muted-foreground leading-relaxed">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>
                                Once submitted, a moderation ticket is opened. You will be able to exchange messages directly with staff in the Support & Tickets dashboard.
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                disabled={submitting}
                                className="rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || !description.trim()}
                                className={`rounded-xl text-xs font-bold text-white shadow-md cursor-pointer ${
                                    category === 'appeal'
                                        ? 'bg-rose-600 hover:bg-rose-700'
                                        : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-3.5 w-3.5 mr-1.5" />
                                        {category === 'appeal' ? 'Submit Appeal Ticket' : 'Open Ticket'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
