import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldAlert, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';

export const WarningNoticeModal: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [acknowledging, setAcknowledging] = useState(false);

    // Show only when authenticated user has an active unacknowledged warning
    const shouldShow = Boolean(user && user.has_unacknowledged_warning && user.active_warning);

    if (!shouldShow) return null;

    const handleAcknowledge = async () => {
        try {
            setAcknowledging(true);
            await userService.acknowledgeWarning();
            await refreshUser();
            toast.success('Warning acknowledged. Thank you for keeping our community safe and respectful.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to acknowledge warning. Please try again.');
        } finally {
            setAcknowledging(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop with strong blur and lockout effect */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/30 bg-card/95 shadow-2xl backdrop-blur-xl z-10"
                >
                    {/* Top Amber Glowing Gradient Accent Bar */}
                    <div className="h-2 w-full bg-linear-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse" />

                    <div className="p-6 md:p-8 space-y-6">
                        {/* Header Badge & Icon */}
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                                <AlertTriangle className="h-6 w-6 animate-bounce" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Staff Notice
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-foreground mt-1 tracking-tight">
                                    Official Moderation Warning
                                </h2>
                            </div>
                        </div>

                        {/* Informational Message */}
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Your account or recent submissions have been flagged for violating our{' '}
                            <span className="font-semibold text-foreground">Community Guidelines &amp; Creator Terms</span>. Please review the official staff remark below:
                        </p>

                        {/* Staff Remark Card */}
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2 relative overflow-hidden">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                                <ShieldAlert className="h-4 w-4" />
                                <span>Staff Enforcement Reason</span>
                            </div>
                            <p className="text-sm font-medium text-foreground/90 leading-relaxed bg-black/30 p-3 rounded-xl border border-border/50 select-text">
                                "{user?.active_warning}"
                            </p>
                        </div>

                        {/* Rules Compliance Notice */}
                        <div className="space-y-2 text-[12px] text-muted-foreground bg-muted/30 p-3.5 rounded-2xl border border-border/50">
                            <div className="flex items-center gap-2 text-foreground font-semibold">
                                <FileText className="h-3.5 w-3.5 text-purple-400" />
                                <span>Platform Rules &amp; Compliance Policy</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                                <li>Repeated policy violations will trigger automated or permanent account suspension.</li>
                                <li>Taken-down contents remain locked until an appeal ticket is submitted and approved by staff.</li>
                                <li>Our team is committed to maintaining a safe, creative, and respectful marketplace for all artists.</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2">
                            <Button
                                onClick={handleAcknowledge}
                                disabled={acknowledging}
                                className="w-full h-11 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-500/20 gap-2 cursor-pointer transition-all active:scale-[0.98]"
                            >
                                {acknowledging ? (
                                    <span>Acknowledging Notice...</span>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>I Acknowledge &amp; Understand</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
