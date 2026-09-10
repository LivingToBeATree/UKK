import React, { useState } from 'react';
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
import { Heart, Coffee, Palette, Pizza, Sparkles, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { api } from '@/services/api';
import { formatCurrencySafe } from '@/utils/format';

interface TipArtistModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    username: string;
    displayName?: string;
    avatarUrl?: string | null;
}

const PRESET_TIERS = [
    { label: 'Coffee', icon: Coffee, amount: 15000 },
    { label: 'Art Supplies', icon: Palette, amount: 50000 },
    { label: 'Pizza', icon: Pizza, amount: 100000 },
];

export const TipArtistModal: React.FC<TipArtistModalProps> = ({
    open,
    onOpenChange,
    username,
    displayName,
    avatarUrl,
}) => {
    const [selectedAmount, setSelectedAmount] = useState<number>(50000);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [isCustom, setIsCustom] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [supporterName, setSupporterName] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    const effectiveAmount = isCustom ? (parseInt(customAmount, 10) || 0) : selectedAmount;

    const handleSelectPreset = (amount: number) => {
        setIsCustom(false);
        setSelectedAmount(amount);
    };

    const handleSubmitTip = async () => {
        if (effectiveAmount < 10000) {
            toast.error('Minimum tip amount is Rp 10.000');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post(`/artists/${username}/tip`, {
                amount: effectiveAmount,
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
                toast.success(`Tip of ${formatCurrencySafe(effectiveAmount)} submitted! Thank you!`);
                onOpenChange(false);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to initialize tip payment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-card border-border rounded-2xl p-6">
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
                        Send a quick appreciation tip directly to the artist.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 my-2">
                    {/* Preset Tier Pills */}
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase font-mono block mb-2">
                            Select Amount
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {PRESET_TIERS.map((tier) => {
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
                                            {formatCurrencySafe(tier.amount)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Amount Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Custom Amount (IDR)</label>
                            <button
                                type="button"
                                onClick={() => setIsCustom(true)}
                                className="text-[11px] text-primary hover:underline font-medium"
                            >
                                Enter Custom
                            </button>
                        </div>
                        <Input
                            type="number"
                            min="10000"
                            step="5000"
                            placeholder="e.g. 75000"
                            value={customAmount}
                            onChange={(e) => {
                                setIsCustom(true);
                                setCustomAmount(e.target.value);
                            }}
                            className={`rounded-xl ${isCustom ? 'border-primary ring-1 ring-primary' : ''}`}
                        />
                    </div>

                    {/* Supporter Name */}
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Your Name (Optional)</label>
                        <Input
                            placeholder="Anonymous Supporter"
                            value={supporterName}
                            onChange={(e) => setSupporterName(e.target.value)}
                            maxLength={80}
                            className="rounded-xl"
                        />
                    </div>

                    {/* Cheer Message */}
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Cheer Message</label>
                        <Textarea
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
                        disabled={submitting || effectiveAmount < 10000}
                        className="w-full rounded-xl font-bold gap-2 h-11 text-sm bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md hover:opacity-95"
                    >
                        {submitting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Preparing Checkout...</>
                        ) : (
                            <><Sparkles className="h-4 w-4" /> Tip {formatCurrencySafe(effectiveAmount)}</>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
