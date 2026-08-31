import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Copy, Check, KeyRound, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { twoFactorService, type TwoFactorSetupData } from '@/services/twoFactorService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';

interface TwoFactorSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [step, setStep] = useState<'setup' | 'confirm' | 'recovery'>('setup');
    const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
    const [loadingSetup, setLoadingSetup] = useState(false);
    const [code, setCode] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep('setup');
            setCode('');
            setLoadingSetup(true);
            twoFactorService.setup()
                .then((data) => setSetupData(data))
                .catch((err) => {
                    const message = err?.response?.data?.message || 'Failed to initialize 2FA setup.';
                    toast.error(message);
                    onClose();
                })
                .finally(() => setLoadingSetup(false));
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleCopyKey = () => {
        if (!setupData?.secret) return;
        navigator.clipboard.writeText(setupData.secret);
        setCopiedKey(true);
        toast.success('Secret key copied to clipboard.');
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) {
            toast.error('Please enter the 6-digit code.');
            return;
        }

        setConfirming(true);
        try {
            const res = await twoFactorService.confirm(code);
            setRecoveryCodes(res.recovery_codes);
            setStep('recovery');
            toast.success('Two-factor authentication verified successfully!');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid code. Check your device time and try again.';
            toast.error(message);
        } finally {
            setConfirming(false);
        }
    };

    const handleCopyAllCodes = () => {
        navigator.clipboard.writeText(recoveryCodes.join('\n'));
        setCopiedCodes(true);
        toast.success('All recovery codes copied to clipboard.');
        setTimeout(() => setCopiedCodes(false), 2000);
    };

    const handleFinish = () => {
        onSuccess();
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
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>

                <AnimatePresence mode="wait">
                    {/* ─── STEP 1: Scan QR Code ─── */}
                    {step === 'setup' && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-xl font-extrabold text-foreground">
                                    Set Up Two-Factor Authentication
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Scan this QR code using Google Authenticator, Apple Passwords, Authy, or 1Password.
                                </p>
                            </div>

                            {loadingSetup ? (
                                <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                                    Generating security keys...
                                </div>
                            ) : setupData ? (
                                <div className="space-y-4">
                                    <div className="flex justify-center p-4 bg-white rounded-2xl w-fit mx-auto shadow-inner ring-1 ring-border">
                                        <QRCodeSVG value={setupData.qr_code_url} size={180} level="M" />
                                    </div>

                                    <div className="space-y-1.5 text-center">
                                        <p className="text-[11px] text-muted-foreground">
                                            Cannot scan QR code? Enter this secret key manually:
                                        </p>
                                        <div className="inline-flex items-center gap-2 bg-secondary/80 px-3 py-1.5 rounded-lg border border-border/80 text-xs font-mono font-bold tracking-wider">
                                            <span>{setupData.secret}</span>
                                            <button
                                                type="button"
                                                onClick={handleCopyKey}
                                                className="text-primary hover:text-primary/80 cursor-pointer"
                                                title="Copy Secret"
                                            >
                                                {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <Button
                                onClick={() => setStep('confirm')}
                                disabled={loadingSetup || !setupData}
                                className="w-full h-11 rounded-xl font-bold shadow-md gap-2"
                            >
                                <span>Continue to Confirmation</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    )}

                    {/* ─── STEP 2: Enter 6-digit Code ─── */}
                    {step === 'confirm' && (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <KeyRound className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-xl font-extrabold text-foreground">
                                    Verify Authenticator App
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Enter the 6-digit code currently generated by your authenticator app.
                                </p>
                            </div>

                            <form onSubmit={handleConfirm} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="twofa_code" className="text-xs font-semibold text-center block">
                                        6-Digit Verification Code
                                    </Label>
                                    <Input
                                        id="twofa_code"
                                        placeholder="000000"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="h-14 text-center text-3xl tracking-[0.5em] font-mono rounded-xl bg-card border-border/80 font-bold"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep('setup')}
                                        className="flex-1 h-11 rounded-xl text-xs font-semibold"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={confirming || code.length !== 6}
                                        className="flex-1 h-11 rounded-xl font-bold shadow-md"
                                    >
                                        {confirming ? 'Verifying...' : 'Enable 2FA'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* ─── STEP 3: Recovery Backup Codes ─── */}
                    {step === 'recovery' && (
                        <motion.div
                            key="recovery"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6 text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-extrabold text-foreground">
                                    Save Your Recovery Codes
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    If you lose access to your authenticator app, these one-time codes are the only way to recover your account.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-200 flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                                <span>Store these codes in a secure password manager. Each code can only be used once.</span>
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
                                    onClick={handleCopyAllCodes}
                                    className="flex-1 h-11 rounded-xl text-xs font-semibold gap-1.5"
                                >
                                    {copiedCodes ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    <span>{copiedCodes ? 'Copied!' : 'Copy All Codes'}</span>
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleFinish}
                                    className="flex-1 h-11 rounded-xl font-bold shadow-md"
                                >
                                    I Have Saved My Codes
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
