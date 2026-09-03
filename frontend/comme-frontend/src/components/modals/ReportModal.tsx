import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    X,
    CheckCircle2,
    Flag,
    FileWarning,
    ExternalLink,
    Ban,
    Copyright,
    UserX,
    DollarSign,
    HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import { reportService } from '@/services/reportService';
import type { ReportReason, ReportableType } from '@/types';

export interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportableType: ReportableType;
    reportableId: number;
    targetTitle?: string;
    targetSubtitle?: string;
}

const REPORT_REASONS: {
    id: ReportReason;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}[] = [
    {
        id: 'spam',
        label: 'Spam or Advertising',
        description: 'Unsolicited promotional content, bot spam, or deceptive bulk postings.',
        icon: FileWarning,
        color: 'text-amber-400',
    },
    {
        id: 'harassment',
        label: 'Harassment & Bullying',
        description: 'Targeted attacks, threats, insults, or intimidation directed at individuals.',
        icon: Ban,
        color: 'text-rose-400',
    },
    {
        id: 'hate_speech',
        label: 'Hate Speech & Discrimination',
        description: 'Attacking individuals or groups based on race, religion, gender, or orientation.',
        icon: AlertTriangle,
        color: 'text-rose-500',
    },
    {
        id: 'copyright',
        label: 'Copyright or IP Infringement',
        description: 'Stolen artwork, unauthorized use of copyrighted assets, or design plagiarism.',
        icon: Copyright,
        color: 'text-indigo-400',
    },
    {
        id: 'impersonation',
        label: 'Impersonation & Fake Account',
        description: 'Pretending to be another artist, creator, client, or official staff member.',
        icon: UserX,
        color: 'text-purple-400',
    },
    {
        id: 'scam',
        label: 'Fraud or Scam Activity',
        description: 'Payment evasion, chargeback fraud, fake commission offers, or extortion.',
        icon: DollarSign,
        color: 'text-emerald-400',
    },
    {
        id: 'other',
        label: 'Other Policy Violation',
        description: 'Other violations not covered above. Please provide detailed notes below.',
        icon: HelpCircle,
        color: 'text-muted-foreground',
    },
];

export const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    reportableType,
    reportableId,
    targetTitle,
    targetSubtitle,
}) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

    const [selectedReason, setSelectedReason] = useState<ReportReason>('spam');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [createdReportId, setCreatedReportId] = useState<number | null>(null);

    React.useEffect(() => {
        if (isOpen && isStaff) {
            onClose();
            navigate('/admin/reports');
            toast.info('Fast-travelled to Moderation & Reports Workbench');
        }
    }, [isOpen, isStaff, onClose, navigate]);

    if (!isOpen || isStaff) return null;

    const formatTypeLabel = (type: string) => {
        switch (type) {
            case 'post':
                return 'Post';
            case 'portfolio':
                return 'Artwork';
            case 'user':
                return 'User Profile';
            case 'post_comment':
                return 'Comment';
            case 'commission_review':
                return 'Review';
            case 'commission_service':
                return 'Commission Listing';
            default:
                return 'Content';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const report = await reportService.create({
                reportable_type: reportableType,
                reportable_id: reportableId,
                reason: selectedReason,
                description: description.trim() || undefined,
            });

            setIsSuccess(true);
            setCreatedReportId(report.id);
            toast.success('Report submitted successfully to our moderation team');
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.reportable_id?.[0] ||
                'Failed to submit report. Please try again.';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetAndClose = () => {
        setIsSuccess(false);
        setDescription('');
        setSelectedReason('spam');
        setCreatedReportId(null);
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                {/* Backdrop Click */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                    onClick={handleResetAndClose}
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-lg bg-card/95 border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-5 pb-4 border-b border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                                <Flag className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-base text-foreground flex items-center gap-2">
                                    Report {formatTypeLabel(reportableType)}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Help us keep the creative community safe and respectful.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleResetAndClose}
                            className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {isSuccess ? (
                        /* ── Success Screen ── */
                        <div className="p-6 text-center space-y-5">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>

                            <div className="space-y-1.5">
                                <h4 className="font-bold text-lg text-foreground">
                                    Report {createdReportId ? `#${createdReportId} ` : ''}Received
                                </h4>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                    Thank you for your report. A support ticket has been created and our moderation team will review this case shortly.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 text-xs text-muted-foreground text-left flex items-start gap-2.5">
                                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                <span>
                                    You can track the investigation progress or provide additional details directly in your{' '}
                                    <strong className="text-foreground">Support Tickets</strong> hub.
                                </span>
                            </div>

                            <div className="flex items-center justify-center gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl text-xs font-bold"
                                    onClick={handleResetAndClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    type="button"
                                    className="rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-md"
                                    onClick={() => {
                                        handleResetAndClose();
                                        navigate('/dashboard/tickets');
                                    }}
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    View My Tickets
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* ── Report Form ── */
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* Target Preview Box */}
                            {(targetTitle || targetSubtitle) && (
                                <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Reporting {formatTypeLabel(reportableType)}:
                                        </div>
                                        {targetTitle && (
                                            <div className="text-xs font-bold text-foreground truncate mt-0.5">
                                                {targetTitle}
                                            </div>
                                        )}
                                        {targetSubtitle && (
                                            <div className="text-[11px] text-muted-foreground truncate">
                                                {targetSubtitle}
                                            </div>
                                        )}
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold shrink-0">
                                        ID #{reportableId}
                                    </Badge>
                                </div>
                            )}

                            {/* Reason Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Select Reason <span className="text-rose-400">*</span>
                                </label>
                                <div className="grid gap-2">
                                    {REPORT_REASONS.map((item) => {
                                        const isSelected = selectedReason === item.id;
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => setSelectedReason(item.id)}
                                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                                                    isSelected
                                                        ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30'
                                                        : 'border-border/60 bg-secondary/20 hover:border-border hover:bg-secondary/40'
                                                }`}
                                            >
                                                <div
                                                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                                        isSelected
                                                            ? 'border-purple-500 bg-purple-600 text-white'
                                                            : 'border-muted-foreground/40'
                                                    }`}
                                                >
                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                                                        <span className="text-xs font-bold text-foreground">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Optional Details / Evidence */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Additional Context or Evidence
                                    </label>
                                    <span className="text-[10px] text-muted-foreground">
                                        {description.length}/1000
                                    </span>
                                </div>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                                    placeholder="Provide any relevant timestamps, original source links, or details to help staff investigate..."
                                    rows={3}
                                    className="rounded-2xl bg-secondary/30 border-border/80 text-xs focus-visible:ring-purple-500"
                                />
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-2 flex items-center justify-end gap-2.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl text-xs font-bold"
                                    onClick={handleResetAndClose}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md gap-2"
                                >
                                    <Flag className="h-3.5 w-3.5" />
                                    {submitting ? 'Submitting...' : 'Submit Report'}
                                </Button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
