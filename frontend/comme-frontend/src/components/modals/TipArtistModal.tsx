import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Coffee, Palette, Pizza, Sparkles, Loader2, Globe, ShieldCheck } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { api } from '@/services/api';
import { useCurrency, type SupportedCurrency, CURRENCY_CONFIGS } from '@/contexts/CurrencyContext';
import { FlagIcon } from '@/components/ui/FlagIcon';
import { formatRegionalCurrency } from '@/utils/pppPricing';

interface TipArtistModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    username: string;
    displayName?: string;
    avatarUrl?: string | null;
}

interface PresetTier {
    label: string;
    icon: typeof Coffee;
    amount: number;
}

const REGIONAL_PRESETS: Record<SupportedCurrency, PresetTier[]> = {
    IDR: [
        { label: 'Coffee', icon: Coffee, amount: 15000 },
        { label: 'Art Supplies', icon: Palette, amount: 50000 },
        { label: 'Pizza', icon: Pizza, amount: 100000 },
    ],
    USD: [
        { label: 'Coffee', icon: Coffee, amount: 2 },
        { label: 'Art Supplies', icon: Palette, amount: 5 },
        { label: 'Pizza', icon: Pizza, amount: 10 },
    ],
    EUR: [
        { label: 'Coffee', icon: Coffee, amount: 2 },
        { label: 'Art Supplies', icon: Palette, amount: 5 },
        { label: 'Pizza', icon: Pizza, amount: 10 },
    ],
    GBP: [
        { label: 'Coffee', icon: Coffee, amount: 1.5 },
        { label: 'Art Supplies', icon: Palette, amount: 4 },
        { label: 'Pizza', icon: Pizza, amount: 8 },
    ],
    SGD: [
        { label: 'Coffee', icon: Coffee, amount: 3 },
        { label: 'Art Supplies', icon: Palette, amount: 7 },
        { label: 'Pizza', icon: Pizza, amount: 14 },
    ],
    JPY: [
        { label: 'Coffee', icon: Coffee, amount: 300 },
        { label: 'Art Supplies', icon: Palette, amount: 700 },
        { label: 'Pizza', icon: Pizza, amount: 1500 },
    ],
};

const CURRENCY_LIMITS: Record<SupportedCurrency, { min: number; step: number; placeholder: string }> = {
    IDR: { min: 10000, step: 5000, placeholder: 'e.g. 75000' },
    USD: { min: 1, step: 0.5, placeholder: 'e.g. 5.00' },
    EUR: { min: 1, step: 0.5, placeholder: 'e.g. 5.00' },
    GBP: { min: 1, step: 0.5, placeholder: 'e.g. 4.00' },
    SGD: { min: 1, step: 0.5, placeholder: 'e.g. 7.00' },
    JPY: { min: 100, step: 50, placeholder: 'e.g. 500' },
};

export const TipArtistModal: React.FC<TipArtistModalProps> = ({
    open,
    onOpenChange,
    username,
    displayName,
    avatarUrl,
}) => {
    const { currency: activeUserCurrency, ratesToIdr } = useCurrency();
    const [tipCurrency, setTipCurrency] = useState<SupportedCurrency>(activeUserCurrency || 'IDR');
    const [selectedAmount, setSelectedAmount] = useState<number>(() => {
        const presets = REGIONAL_PRESETS[activeUserCurrency || 'IDR'] || REGIONAL_PRESETS.IDR;
        return presets[1]?.amount ?? 50000;
    });
    const [customAmount, setCustomAmount] = useState<string>('');
    const [isCustom, setIsCustom] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [supporterName, setSupporterName] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Sync tip currency when active user currency initializes or modal opens
    useEffect(() => {
        if (open) {
            const initialCur = activeUserCurrency || 'IDR';
            setTipCurrency(initialCur);
            const presets = REGIONAL_PRESETS[initialCur] || REGIONAL_PRESETS.IDR;
            setSelectedAmount(presets[1]?.amount ?? 50000);
            setIsCustom(false);
            setCustomAmount('');
        }
    }, [open, activeUserCurrency]);

    const handleCurrencyChange = (newCur: SupportedCurrency) => {
        setTipCurrency(newCur);
        const presets = REGIONAL_PRESETS[newCur] || REGIONAL_PRESETS.IDR;
        if (!isCustom) {
            setSelectedAmount(presets[1]?.amount ?? 50000);
        } else if (customAmount) {
            // Keep or adjust custom amount
            const num = parseFloat(customAmount);
            if (!isNaN(num) && num > 0) {
                // If switching from/to IDR, adjust reasonable scale
                if (newCur === 'IDR' && num < 1000) {
                    setCustomAmount(String(Math.round(num * (ratesToIdr[tipCurrency] || 15873))));
                } else if (newCur !== 'IDR' && num >= 1000) {
                    const toCurRate = ratesToIdr[newCur] || 1;
                    setCustomAmount((num / toCurRate).toFixed(newCur === 'JPY' ? 0 : 2));
                }
            }
        }
    };

    const limits = CURRENCY_LIMITS[tipCurrency] || CURRENCY_LIMITS.IDR;
    const presets = REGIONAL_PRESETS[tipCurrency] || REGIONAL_PRESETS.IDR;
    const effectiveAmount = isCustom ? (parseFloat(customAmount) || 0) : selectedAmount;

    // Approximate IDR escrow calculation
    const rateToIdr = ratesToIdr[tipCurrency] || (tipCurrency === 'USD' ? 15873 : 1);
    const estimatedIdr = tipCurrency === 'IDR' ? effectiveAmount : Math.round(effectiveAmount * rateToIdr);

    const handleSelectPreset = (amount: number) => {
        setIsCustom(false);
        setSelectedAmount(amount);
    };

    const handleSubmitTip = async () => {
        if (effectiveAmount < limits.min) {
            toast.error(`Minimum tip amount is ${formatRegionalCurrency(limits.min, tipCurrency)}`);
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post(`/artists/${username}/tip`, {
                amount: effectiveAmount,
                currency: tipCurrency,
                message: message.trim() || undefined,
                supporter_name: supporterName.trim() || undefined,
            });

            const snapToken = res.data?.data?.snap_token;

            if (snapToken && typeof window !== 'undefined' && (window as any).snap) {
                (window as any).snap.pay(snapToken, {
                    onSuccess: () => {
                        toast.success(`Thank you for supporting ${displayName || username}!`);
                        onOpenChange(false);
                    },
                    onPending: () => {
                        toast.info('Tip payment pending confirmation.');
                        onOpenChange(false);
                    },
                    onError: () => {
                        toast.error('Tip payment could not be completed.');
                    },
                    onClose: () => {
                        toast.info('Tip checkout closed.');
                    },
                });
            } else {
                toast.success(`Tip of ${formatRegionalCurrency(effectiveAmount, tipCurrency)} submitted! Thank you!`);
                onOpenChange(false);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to initialize tip payment');
        } finally {
            setSubmitting(false);
        }
    };

    const supportedCurrenciesList: SupportedCurrency[] = ['IDR', 'USD', 'EUR', 'GBP', 'SGD', 'JPY'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-card border-border rounded-2xl p-6 shadow-2xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={username} className="h-6 w-6 rounded-full object-cover border border-border" />
                        ) : (
                            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                        )}
                        Support {displayName || `@${username}`}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Send a quick appreciation tip directly to the artist in your preferred regional currency.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 my-2">
                    {/* Regional Currency Selection Selector */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase font-mono flex items-center gap-1.5">
                                <Globe className="h-3.5 w-3.5 text-primary" /> Regional Currency
                            </label>
                            <span className="text-[11px] text-muted-foreground">
                                {CURRENCY_CONFIGS[tipCurrency]?.name}
                            </span>
                        </div>
                        <div className="grid grid-cols-6 gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/50">
                            {supportedCurrenciesList.map((cur) => {
                                const isCurActive = tipCurrency === cur;
                                return (
                                    <button
                                        key={cur}
                                        type="button"
                                        onClick={() => handleCurrencyChange(cur)}
                                        className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-xs font-bold transition-all ${
                                            isCurActive
                                                ? 'bg-card text-foreground shadow-xs border border-border/80 ring-1 ring-primary/20'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                        }`}
                                        title={CURRENCY_CONFIGS[cur]?.name}
                                    >
                                        <FlagIcon code={cur} className="w-3.5 h-2.5 shrink-0" />
                                        <span>{cur}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Regional Preset Tier Pills */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                                Select Tier
                            </label>
                            <span className="text-[11px] text-muted-foreground font-mono">
                                {tipCurrency}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                            {presets.map((tier) => {
                                const Icon = tier.icon;
                                const isSelected = !isCustom && selectedAmount === tier.amount;
                                return (
                                    <button
                                        key={tier.amount}
                                        type="button"
                                        onClick={() => handleSelectPreset(tier.amount)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                            isSelected
                                                ? 'border-primary bg-primary/10 text-foreground font-bold shadow-xs'
                                                : 'border-border/80 hover:bg-muted/50 text-muted-foreground'
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? 'text-primary' : ''}`} />
                                        <span className="text-[11px] font-medium">{tier.label}</span>
                                        <span className="text-xs font-bold text-foreground mt-0.5">
                                            {formatRegionalCurrency(tier.amount, tipCurrency)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Amount Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="tipCustomAmount" className="text-xs font-semibold text-muted-foreground">
                                Custom Amount ({CURRENCY_CONFIGS[tipCurrency]?.symbol || tipCurrency})
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCustom(true);
                                    if (!customAmount) {
                                        setCustomAmount(String(selectedAmount));
                                    }
                                }}
                                className="text-[11px] text-primary hover:underline font-medium"
                            >
                                Enter Custom
                            </button>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                {CURRENCY_CONFIGS[tipCurrency]?.symbol}
                            </span>
                            <Input
                                id="tipCustomAmount"
                                name="customAmount"
                                type="number"
                                min={limits.min}
                                step={limits.step}
                                placeholder={limits.placeholder}
                                value={customAmount}
                                onChange={(e) => {
                                    setIsCustom(true);
                                    setCustomAmount(e.target.value);
                                }}
                                className={`pl-8 rounded-xl ${isCustom ? 'border-primary ring-1 ring-primary' : ''}`}
                            />
                        </div>
                    </div>

                    {/* Regional Escrow & Exchange Note */}
                    {tipCurrency !== 'IDR' && (
                        <div className="p-2.5 rounded-xl bg-sky-500/5 border border-sky-500/20 text-sky-400 text-xs flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                                Settlement Equivalent
                            </span>
                            <span className="font-bold text-foreground font-mono">
                                ≈ {formatRegionalCurrency(estimatedIdr, 'IDR')}
                            </span>
                        </div>
                    )}

                    {/* Supporter Name */}
                    <div>
                        <label htmlFor="tipSupporterName" className="text-xs font-semibold text-muted-foreground block mb-1.5">Your Name (Optional)</label>
                        <Input
                            id="tipSupporterName"
                            name="supporterName"
                            autoComplete="name"
                            placeholder="Anonymous Supporter"
                            value={supporterName}
                            onChange={(e) => setSupporterName(e.target.value)}
                            maxLength={80}
                            className="rounded-xl"
                        />
                    </div>

                    {/* Cheer Message */}
                    <div>
                        <label htmlFor="tipCheerMessage" className="text-xs font-semibold text-muted-foreground block mb-1.5">Cheer Message</label>
                        <Textarea
                            id="tipCheerMessage"
                            name="cheerMessage"
                            placeholder="Love your illustrations! Keep up the amazing art..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="rounded-xl text-sm"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmitTip}
                        disabled={submitting || effectiveAmount < limits.min}
                        className="w-full rounded-xl font-bold gap-2 h-11 text-sm bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md hover:opacity-95 cursor-pointer"
                    >
                        {submitting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Preparing Checkout...</>
                        ) : (
                            <><Sparkles className="h-4 w-4" /> Tip {formatRegionalCurrency(effectiveAmount, tipCurrency)}</>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
