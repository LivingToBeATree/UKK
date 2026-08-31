import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Copy, Check, RefreshCw, Lock, X, AlertTriangle } from 'lucide-react';
import { twoFactorService } from '@/services/twoFactorService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';

interface TwoFactorRecoveryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TwoFactorRecoveryModal: React.FC<TwoFactorRecoveryModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [password, setPassword] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);

    if (!isOpen) return null;

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            toast.error('Please enter your password.');
            return;
        }

        setLoading(true);
        try {
            const data = await twoFactorService.getRecoveryCodes(password);
            setRecoveryCodes(data.recovery_codes);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Incorrect password.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!confirm('Regenerating will invalidate all existing recovery codes. Are you sure?')) return;
        setRegenerating(true);
        try {
            const data = await twoFactorService.regenerateRecoveryCodes(password);
            setRecoveryCodes(data.recovery_codes);
            toast.success('8 new recovery codes generated!');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to regenerate codes.';
            toast.error(message);
        } finally {
            setRegenerating(false);
        }
    };

    const handleCopyAll = () => {
        if (!recoveryCodes) return;
        navigator.clipboard.writeText(recoveryCodes.join('\n'));
        setCopiedCodes(true);
        toast.success('Recovery codes copied.');
        setTimeout(() => setCopiedCodes(false), 2000);
    };

    const handleClose = () => {
        setPassword('');
        setRecoveryCodes(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 sm:p-8 overflow-hidden"
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>

                {!recoveryCodes ? (
                    /* Password Prompt */
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-xl font-extrabold text-foreground">
                                View Recovery Codes
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                For your security, enter your current password to view your 2FA recovery backup codes.
                            </p>
                        </div>

                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="unlock_pw" className="text-xs font-semibold">
                                    Current Password
                                </Label>
                                <Input
                                    id="unlock_pw"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 rounded-xl bg-card border-border/80"
                                    required
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !password}
                                className="w-full h-11 rounded-xl font-bold shadow-md"
                            >
                                {loading ? 'Unlocking...' : 'Unlock Recovery Codes'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    /* Codes Display */
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-extrabold text-foreground">
                                Active 2FA Recovery Codes
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Use these one-time codes if you lose access to your authenticator device.
                            </p>
                        </div>

                        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-200 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                            <span>Each recovery code can only be used once to sign into your account.</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-secondary/50 p-4 rounded-xl border border-border/80 font-mono text-xs font-bold text-center text-foreground">
                            {recoveryCodes.map((c, i) => (
                                <div key={i} className="p-1.5 bg-card/80 rounded border border-border/60">
                                    {c}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRegenerate}
                                disabled={regenerating}
                                className="flex-1 h-11 rounded-xl text-xs font-semibold gap-1.5"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                                <span>{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCopyAll}
                                className="flex-1 h-11 rounded-xl font-bold shadow-md gap-1.5"
                            >
                                {copiedCodes ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                <span>{copiedCodes ? 'Copied' : 'Copy All'}</span>
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
