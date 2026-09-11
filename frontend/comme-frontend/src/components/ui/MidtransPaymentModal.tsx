import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/utils/format';
import {
    QrCode,
    Building2,
    CreditCard,
    Copy,
    Check,
    Smartphone,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    Lock,
    Sparkles,
    ExternalLink,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { commissionOrderApi } from '@/services/commissionService';
import type { CommissionOrder } from '@/types';

interface MidtransPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    commission: CommissionOrder;
    orderId?: string;
    isMock?: boolean;
    onPaymentSuccess: (updated: CommissionOrder) => void;
}

type PaymentMethod = 'qris' | 'va' | 'card';
type BankChoice = 'bca' | 'bni' | 'bri' | 'mandiri' | 'permata';

export const MidtransPaymentModal: React.FC<MidtransPaymentModalProps> = ({
    isOpen,
    onClose,
    commission,
    orderId,
    isMock = false,
    onPaymentSuccess,
}) => {
    const [activeMethod, setActiveMethod] = useState<PaymentMethod>('qris');
    const [selectedBank, setSelectedBank] = useState<BankChoice>('bca');
    const [copied, setCopied] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Simulated card form
    const [cardNumber, setCardNumber] = useState('4811 1111 1111 1114');
    const [cardExpiry, setCardExpiry] = useState('12/28');
    const [cardCvv, setCardCvv] = useState('123');
    const [cardName, setCardName] = useState(commission.user?.display_name || 'Art Buyer');

    const formattedOrderId = orderId || `CMS-${commission.id}-${Date.now().toString().slice(-6)}`;

    // Virtual Account numbers for each bank
    const vaNumbers: Record<BankChoice, string> = {
        bca: `70070${commission.id.toString().padStart(5, '0')}${Date.now().toString().slice(-4)}`,
        bni: `8808${commission.id.toString().padStart(6, '0')}${Date.now().toString().slice(-4)}`,
        bri: `12345${commission.id.toString().padStart(6, '0')}${Date.now().toString().slice(-4)}`,
        mandiri: `89000${commission.id.toString().padStart(5, '0')}${Date.now().toString().slice(-4)}`,
        permata: `8777${commission.id.toString().padStart(6, '0')}${Date.now().toString().slice(-4)}`,
    };

    const handleCopyVa = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Virtual Account number copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenSnap = async () => {
        setProcessing(true);

        // Handle sandbox/mock mode in developer playground
        if (isMock) {
            setTimeout(() => {
                setProcessing(false);
                toast.info('Sandbox Showcase Mode', {
                    description: 'In live orders, this triggers Midtrans Snap. Simulating successful escrow capture...',
                });
                onPaymentSuccess({ ...commission, status: 'in_progress' });
                onClose();
            }, 600);
            return;
        }

        try {
            const payment = await commissionOrderApi.initiatePayment(commission.id);
            if (
                payment.snap_token &&
                typeof (window as unknown as { snap?: { pay: (token: string, cb: unknown) => void } }).snap?.pay === 'function'
            ) {
                onClose();
                (window as unknown as { snap: { pay: (token: string, cb: unknown) => void } }).snap.pay(payment.snap_token, {
                    onSuccess: () => {
                        toast.success('Payment captured into Escrow! Commission is now in progress.');
                        onPaymentSuccess(commission);
                    },
                    onPending: () => {
                        toast.info('Payment pending completion in Midtrans.');
                    },
                    onError: () => {
                        toast.error('Payment cancelled or failed.');
                    },
                });
            } else {
                toast.error('Could not initialize Midtrans Snap session.');
            }
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 404) {
                toast.info('Sandbox Demo Mode: Mock commission order', {
                    description: 'In live orders with real commissions, this triggers Midtrans Snap. Escrow payment simulated successfully!',
                });
                onPaymentSuccess({ ...commission, status: 'in_progress' });
                onClose();
                return;
            }
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to open Midtrans Snap';
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    const handleExecutePayment = async () => {
        setProcessing(true);

        // Handle sandbox/mock mode in developer playground
        if (isMock) {
            setTimeout(() => {
                setProcessing(false);
                toast.success('Payment captured into Escrow! Commission is now in progress.');
                onPaymentSuccess({ ...commission, status: 'in_progress' });
                onClose();
            }, 600);
            return;
        }

        try {
            const updated = await commissionOrderApi.simulatePayment(commission.id);
            toast.success('Payment captured into Escrow! Commission is now in progress.');
            onPaymentSuccess(updated);
            onClose();
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 404) {
                toast.success('Payment captured into Escrow! Commission is now in progress.');
                onPaymentSuccess({ ...commission, status: 'in_progress' });
                onClose();
                return;
            }
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Payment simulation failed';
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border border-border p-0 overflow-hidden shadow-2xl">
                {/* Header with Midtrans Branding & Right Padding for Close X button */}
                <div className="bg-gradient-to-r from-primary/10 via-background to-secondary/30 p-5 pr-14 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-base shadow-inner">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <DialogTitle className="text-base font-bold text-foreground">
                                    Midtrans Escrow Gateway
                                </DialogTitle>
                                <Badge variant="gold" className="text-[10px] uppercase font-mono tracking-wider py-0 px-1.5">
                                    Sandbox Test
                                </Badge>
                            </div>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Order #{formattedOrderId} • Secured by Comme Escrow
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-mono block">Total Due</span>
                        <span className="text-lg sm:text-xl font-black text-primary font-mono">
                            {formatPrice(commission.total_price)}
                        </span>
                    </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
                    {/* Method Selector Sidebar */}
                    <div className="md:col-span-4 bg-muted/20 border-r border-border p-3 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground px-2 block mb-1">
                            Select Channel
                        </span>

                        <button
                            type="button"
                            onClick={() => setActiveMethod('qris')}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                                activeMethod === 'qris'
                                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${activeMethod === 'qris' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <QrCode className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold">QRIS / GoPay</p>
                                <p className="text-[10px] opacity-75 font-normal">Instant QR Scan</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveMethod('va')}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                                activeMethod === 'va'
                                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${activeMethod === 'va' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <Building2 className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold">Virtual Account</p>
                                <p className="text-[10px] opacity-75 font-normal">BCA, Mandiri, BNI, BRI</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveMethod('card')}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                                activeMethod === 'card'
                                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${activeMethod === 'card' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <CreditCard className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold">Credit / Debit Card</p>
                                <p className="text-[10px] opacity-75 font-normal">Visa, Mastercard, JCB</p>
                            </div>
                        </button>

                        <div className="pt-4 px-2">
                            <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-[11px] text-muted-foreground space-y-1">
                                <p className="font-bold text-foreground flex items-center gap-1">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Escrow Protected
                                </p>
                                <p className="text-[10px] leading-tight">
                                    Funds remain safely held in escrow until you approve the delivered artwork.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Method Details Pane */}
                    <div className="md:col-span-8 p-5 flex flex-col justify-between">
                        {/* QRIS Screen */}
                        {activeMethod === 'qris' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm text-foreground">Scan QRIS Code</h4>
                                        <p className="text-xs text-muted-foreground">Compatible with GoPay, BCA, ShopeePay, Dana, LinkAja</p>
                                    </div>
                                    <Badge variant="primary" className="text-[10px] font-mono">
                                        Active
                                    </Badge>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-muted/20 border border-border">
                                    {/* Mock QR Code Pattern */}
                                    <div className="p-3 bg-white rounded-2xl shadow-md shrink-0 flex flex-col items-center">
                                        <div className="w-36 h-36 bg-black relative p-2 flex flex-col justify-between">
                                            {/* Simulated QR boxes */}
                                            <div className="flex justify-between w-full">
                                                <div className="w-8 h-8 bg-white p-1.5"><div className="w-full h-full bg-black" /></div>
                                                <div className="w-8 h-8 bg-white p-1.5"><div className="w-full h-full bg-black" /></div>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-black text-[10px] flex items-center justify-center shadow-md">
                                                    QRIS
                                                </div>
                                            </div>
                                            <div className="flex justify-between w-full">
                                                <div className="w-8 h-8 bg-white p-1.5"><div className="w-full h-full bg-black" /></div>
                                                <div className="w-8 h-8 bg-white flex items-center justify-center">
                                                    <div className="w-3 h-3 bg-black" />
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-mono font-bold text-zinc-800 mt-1 uppercase tracking-wider">
                                            NMID: ID1020039281
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div className="space-y-0.5">
                                            <span className="text-muted-foreground text-[11px]">Merchant</span>
                                            <p className="font-bold text-foreground">Comme Digital Commissions</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-muted-foreground text-[11px]">Amount</span>
                                            <p className="font-bold text-primary font-mono text-sm">{formatPrice(commission.total_price)}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-muted-foreground text-[11px]">Status</span>
                                            <p className="text-amber-400 font-medium flex items-center gap-1">
                                                <Smartphone className="h-3.5 w-3.5" /> Awaiting QR scan / simulator trigger
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Virtual Account Screen */}
                        {activeMethod === 'va' && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-sm text-foreground">Bank Virtual Account</h4>
                                    <p className="text-xs text-muted-foreground">Select your bank to generate your unique payment code</p>
                                </div>

                                {/* Bank selector chips */}
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                                    {(['bca', 'mandiri', 'bni', 'bri', 'permata'] as BankChoice[]).map((bank) => (
                                        <button
                                            key={bank}
                                            type="button"
                                            onClick={() => setSelectedBank(bank)}
                                            className={`p-2 rounded-xl text-center font-bold text-xs uppercase transition-all cursor-pointer border ${
                                                selectedBank === bank
                                                    ? 'bg-primary/20 text-primary border-primary/40 shadow-xs'
                                                    : 'bg-muted/30 text-muted-foreground hover:bg-muted border-border'
                                            }`}
                                        >
                                            {bank}
                                        </button>
                                    ))}
                                </div>

                                {/* VA Number Card */}
                                <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-muted-foreground uppercase font-mono font-bold">
                                            {selectedBank.toUpperCase()} Virtual Account Number
                                        </span>
                                        <span className="text-[10px] text-amber-400 font-mono">Expires in 24 hrs</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 p-3 bg-card rounded-xl border border-border">
                                        <span className="font-mono font-bold text-base sm:text-lg text-foreground tracking-wider">
                                            {vaNumbers[selectedBank]}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCopyVa(vaNumbers[selectedBank])}
                                            className="h-8 gap-1.5 cursor-pointer text-xs"
                                        >
                                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </Button>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                                        Transfer the exact amount via your {selectedBank.toUpperCase()} Mobile Banking, ATM, or Internet Banking.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Credit / Debit Card Screen */}
                        {activeMethod === 'card' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm text-foreground">Credit / Debit Card</h4>
                                        <p className="text-xs text-muted-foreground">Pre-filled with Midtrans 3D Secure test card</p>
                                    </div>
                                    <Badge variant="primary" className="text-[10px] font-mono">
                                        3DS Verified
                                    </Badge>
                                </div>

                                <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border text-xs">
                                    <div className="space-y-1">
                                        <Label className="text-[11px]">Card Number</Label>
                                        <Input
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            className="font-mono text-xs h-9 bg-card"
                                            placeholder="4811 1111 1111 1114"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Expiry Date</Label>
                                            <Input
                                                value={cardExpiry}
                                                onChange={(e) => setCardExpiry(e.target.value)}
                                                className="font-mono text-xs h-9 bg-card"
                                                placeholder="MM/YY"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[11px]">CVV / CVC</Label>
                                            <Input
                                                value={cardCvv}
                                                onChange={(e) => setCardCvv(e.target.value)}
                                                className="font-mono text-xs h-9 bg-card"
                                                placeholder="123"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[11px]">Cardholder Name</Label>
                                        <Input
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            className="text-xs h-9 bg-card"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sandbox Simulation Helper Banner */}
                        <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-2 mt-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="text-xs font-bold text-foreground">Sandbox Gateway Testing</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                You can test via the official Midtrans Snap popup, or simulate immediate escrow capture below.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleOpenSnap}
                                disabled={processing}
                                className="w-full h-8 rounded-xl font-medium text-xs hover:bg-muted cursor-pointer gap-2"
                            >
                                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                                Open Official Midtrans Snap Popup
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Full-width Modal Action Footer */}
                <div className="p-4 px-5 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={processing}
                        className="cursor-pointer text-xs"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleExecutePayment}
                        disabled={processing}
                        className="font-bold cursor-pointer gap-2 text-xs sm:text-sm px-6 shadow-md"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Verifying Escrow...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Simulate Payment ({formatPrice(commission.total_price)})
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
