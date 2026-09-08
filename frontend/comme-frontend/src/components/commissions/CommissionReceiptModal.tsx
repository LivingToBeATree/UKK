import React, { useState, useRef } from 'react';
import {
    Receipt,
    Printer,
    CheckCircle2,
    ShieldCheck,
    CreditCard,
    Copy,
    Check,
    Lock,
    X,
    Sparkles,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDateSafe, formatDateTimeSafe } from '@/utils/format';
import type { CommissionOrder } from '@/types/commission';
import { toast } from '@/components/ui/sonner';

interface CommissionReceiptModalProps {
    open: boolean;
    onClose: () => void;
    commission: CommissionOrder;
}

export const CommissionReceiptModal: React.FC<CommissionReceiptModalProps> = ({
    open,
    onClose,
    commission,
}) => {
    const [copied, setCopied] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    if (!open) return null;

    // Determine payment details
    const activePayment = commission.payment || commission.payments?.find(p => p.status === 'paid') || commission.payments?.[0];
    const paidDate = activePayment?.paid_at || commission.updated_at || commission.created_at;
    const paymentMethod = activePayment?.payment_type 
        ? activePayment.payment_type.replace(/_/g, ' ').toUpperCase()
        : 'MIDTRANS ESCROW';
    const transactionId = activePayment?.order_id || `CMS-${commission.id}-${Date.parse(commission.created_at || '')}`;
    const receiptNumber = `REC-COM-${commission.id}-${transactionId.slice(-8).toUpperCase()}`;

    const handleCopyReceiptId = () => {
        navigator.clipboard.writeText(receiptNumber);
        setCopied(true);
        toast.success('Receipt reference copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    const isEscrowSecured = ['in_progress', 'waiting_for_client', 'revision'].includes(commission.status);
    const isCompleted = commission.status === 'completed';
    const isRefunded = commission.status === 'cancelled' && (activePayment?.status === 'refunded' || commission.payments?.some(p => p.status === 'refunded'));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Inline print style sheet */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #comme-receipt-print-area, #comme-receipt-print-area * {
                        visibility: visible !important;
                    }
                    #comme-receipt-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        background: white !important;
                        color: black !important;
                        box-shadow: none !important;
                        border: none !important;
                        padding: 20px !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div
                id="comme-receipt-print-area"
                ref={receiptRef}
                className="relative w-full max-w-2xl bg-zinc-950 border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
            >
                {/* Decorative Top Accent Bar */}
                <div className={`h-2 bg-gradient-to-r ${isRefunded ? 'from-rose-500 via-amber-400 to-rose-400' : 'from-purple-500 via-emerald-400 to-amber-400'} shrink-0`} />

                {/* Modal Header Actions (Screen Only) */}
                <div className="p-4 sm:p-6 pb-0 flex items-center justify-between gap-3 shrink-0 no-print">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">
                        <Receipt className={`h-4 w-4 ${isRefunded ? 'text-rose-400' : 'text-emerald-400'}`} /> {isRefunded ? 'Cancelled & Refunded Receipt' : 'Official Escrow Receipt'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePrint}
                            className="gap-1.5 cursor-pointer text-xs font-semibold"
                        >
                            <Printer className="h-3.5 w-3.5" /> Print / Save PDF
                        </Button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-8 w-8 rounded-full border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Receipt Body */}
                <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                    {/* Receipt Branding & Reference */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-black text-xl tracking-tight text-foreground font-mono">
                                    COM<span className={isRefunded ? 'text-rose-400' : 'text-emerald-400'}>ME</span>
                                </span>
                                <Badge variant={isRefunded ? 'rose' : 'teal'} className="text-[10px] gap-1 py-0.5">
                                    {isRefunded ? <RotateCcw className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />} {isRefunded ? 'ESCROW REFUNDED' : 'VERIFIED ESCROW'}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Creator Commission Escrow &amp; Marketplace
                            </p>
                            <div className="pt-2 flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-foreground">
                                    {receiptNumber}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCopyReceiptId}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                                    title="Copy Receipt Number"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>

                        <div className="text-left sm:text-right space-y-1">
                            <span className="text-[10px] text-muted-foreground block uppercase font-mono tracking-wider font-semibold">
                                {isRefunded ? 'Escrow Deposit Refunded' : 'Total Paid & Protected'}
                            </span>
                            <span className={`text-2xl sm:text-3xl font-black font-mono block ${isRefunded ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {formatPrice(commission.total_price)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                                {isRefunded ? (
                                    <span className="text-rose-400 flex items-center gap-1 font-mono">
                                        <RotateCcw className="h-3.5 w-3.5" /> Order Cancelled &amp; Refunded
                                    </span>
                                ) : isCompleted ? (
                                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Order Completed &amp; Settled
                                    </span>
                                ) : isEscrowSecured ? (
                                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                                        <Lock className="h-3.5 w-3.5" /> Held in Escrow Vault
                                    </span>
                                ) : (
                                    <span className="text-amber-400 font-mono">
                                        Status: {commission.status.toUpperCase()}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Metadata Cards: Client (Buyer) & Artist (Creator) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider">
                                Commissioner (Client)
                            </span>
                            <p className="font-bold text-sm text-foreground">
                                {commission.user?.display_name || commission.user?.username || 'Client'}
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                                @{commission.user?.username || 'client'}
                            </p>
                            {commission.user?.email && (
                                <p className="text-muted-foreground text-[11px] truncate">
                                    {commission.user.email}
                                </p>
                            )}
                        </div>

                        <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider">
                                Illustrator / Creator
                            </span>
                            <p className="font-bold text-sm text-foreground">
                                {commission.artist_profile?.user?.display_name || commission.artist_profile?.user?.username || 'Artist'}
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                                @{commission.artist_profile?.user?.username || 'artist'}
                            </p>
                            <p className="text-purple-400 text-[11px] font-medium flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> Verified Comme Artist Studio
                            </p>
                        </div>
                    </div>

                    {/* Payment & Transaction Info Details */}
                    <div className="p-4 rounded-2xl border border-border/60 bg-card/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono block">Payment Date</span>
                            <span className="font-semibold text-foreground mt-0.5 block">
                                {formatDateTimeSafe(paidDate, 'Recently')}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono block">Payment Gateway</span>
                            <span className="font-semibold text-foreground mt-0.5 block flex items-center gap-1">
                                <CreditCard className="h-3.5 w-3.5 text-emerald-400" /> Midtrans Snap
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono block">Method / Type</span>
                            <span className="font-semibold text-foreground mt-0.5 block font-mono">
                                {paymentMethod}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono block">Order Reference</span>
                            <span className="font-mono text-foreground mt-0.5 block truncate" title={transactionId}>
                                {transactionId}
                            </span>
                        </div>
                    </div>

                    {/* Itemized Breakdown Table */}
                    <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                            Purchased Service &amp; Package
                        </span>
                        <div className="rounded-2xl border border-border/80 overflow-hidden text-xs">
                            <div className="p-3.5 bg-muted/40 border-b border-border/60 flex items-center justify-between font-bold text-foreground">
                                <div>
                                    <p className="font-bold text-sm text-foreground">
                                        {commission.commission_service?.name || 'Custom Commission Service'}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
                                        Tier: <span className="font-semibold text-foreground">{commission.commission_option?.title || 'Standard Package'}</span>
                                    </p>
                                </div>
                                <span className="font-mono text-sm">
                                    {formatPrice(commission.commission_option?.base_price ?? commission.total_price)}
                                </span>
                            </div>

                            {/* Addons List */}
                            {commission.addons_selections && commission.addons_selections.length > 0 && (
                                <div className="divide-y divide-border/40 bg-card/40">
                                    {commission.addons_selections.map((addon) => (
                                        <div key={addon.id} className="p-3 flex items-center justify-between text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-purple-400 font-bold">+</span>
                                                {addon.title} (Add-on)
                                            </span>
                                            <span className="font-mono text-foreground font-medium">
                                                {formatPrice(addon.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Summary Rows */}
                            <div className="p-3.5 bg-muted/20 border-t border-border/60 space-y-1.5 font-mono">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>Escrow Protection Fee (100% Guaranteed)</span>
                                    <span className="text-emerald-400 font-bold">FREE / Rp 0</span>
                                </div>
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>Turnaround Target</span>
                                    <span className="text-foreground">
                                        {commission.deadline ? formatDateSafe(commission.deadline, { dateStyle: 'medium' }) : 'Flexible'}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-sm font-bold text-foreground">
                                    <span>Total Amount Charged</span>
                                    <span className="text-emerald-400 text-base font-mono font-black">
                                        {formatPrice(commission.total_price)}
                                    </span>
                                </div>
                                {isRefunded && (
                                    <>
                                        <div className="pt-1.5 flex items-center justify-between text-sm font-bold text-rose-400">
                                            <span className="flex items-center gap-1">
                                                <RotateCcw className="h-3.5 w-3.5" /> Full Escrow Refund Credited
                                            </span>
                                            <span className="text-base font-mono font-black">
                                                -{formatPrice(commission.total_price)}
                                            </span>
                                        </div>
                                        <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                            <span>Net Settled Amount</span>
                                            <span className="font-mono text-foreground font-bold">Rp 0</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Escrow Terms & Assurance Notice */}
                    {isRefunded ? (
                        <div className="p-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 space-y-1.5 text-xs">
                            <p className="font-bold text-rose-400 flex items-center gap-1.5">
                                <RotateCcw className="h-4 w-4" /> Escrow Refund Processed
                            </p>
                            <p className="text-muted-foreground leading-relaxed text-[11px]">
                                This commission order was mutually cancelled. The full escrow deposit of <span className="text-foreground font-bold font-mono">{formatPrice(commission.total_price)}</span> has been credited back to the client. No payout was disbursed to the creator.
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 space-y-1.5 text-xs">
                            <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4" /> COMME Escrow Purchase Protection
                            </p>
                            <p className="text-muted-foreground leading-relaxed text-[11px]">
                                Payment has been captured into COMME Escrow. The illustrator will only receive the payout after you review and approve the delivered artwork, or after the 7-day inspection window has passed. You retain the right to request revisions under your selected package terms.
                            </p>
                        </div>
                    )}

                    {/* Transaction Audit History (if payments exist) */}
                    {commission.payments && commission.payments.length > 0 && (
                        <div className="space-y-2 pt-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                                Transaction History Log ({commission.payments.length})
                            </span>
                            <div className="space-y-2">
                                {commission.payments.map((p, idx) => (
                                    <div key={p.id || idx} className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between text-xs font-mono">
                                        <div className="space-y-0.5">
                                            <span className="font-semibold text-foreground block">
                                                {p.order_id}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {p.payment_type ? p.payment_type.toUpperCase() : 'MIDTRANS GATEWAY'} • {formatDateTimeSafe(p.paid_at || p.created_at, 'Recently')}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={p.status === 'paid' ? 'teal' : p.status === 'pending' ? 'gold' : 'rose'}
                                            className="text-[10px] uppercase font-mono"
                                        >
                                            {p.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls (Screen Only) */}
                <div className="p-4 sm:p-6 border-t border-border/60 bg-card/80 flex items-center justify-between gap-3 shrink-0 no-print">
                    <p className="text-[11px] text-muted-foreground">
                        Order #{commission.id} • Verified digital transaction receipt
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePrint}
                            className="gap-1.5 cursor-pointer"
                        >
                            <Printer className="h-3.5 w-3.5" /> Print
                        </Button>
                        <Button
                            size="sm"
                            onClick={onClose}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
