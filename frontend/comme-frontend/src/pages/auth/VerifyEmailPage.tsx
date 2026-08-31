import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MailCheck, RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { AuthHeroBanner } from '@/components/auth/AuthHeroBanner';

export const VerifyEmailPage: React.FC = () => {
    const { confirmRegistration } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as { email?: string })?.email;
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(60);

    // Cooldown countdown timer for Resend Code
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    // If no email in state, redirect to register
    if (!email) {
        return <Navigate to="/register" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) {
            toast.error('Please enter the 6-digit verification code');
            return;
        }

        setIsSubmitting(true);
        try {
            await confirmRegistration(email, code);
            toast.success('Account verified! Welcome to Comme!');
            navigate('/explore', { replace: true });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Verification failed';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || isResending) return;
        setIsResending(true);
        try {
            await authService.resendRegistrationCode(email);
            toast.success('A new 6-digit code has been dispatched to your email!');
            setCountdown(60);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to resend code';
            toast.error(message);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-background text-foreground">
            {/* Left 50%: 15-second Rotating Artwork Hero Banner */}
            <AuthHeroBanner />

            {/* Right 50%: Clean Unsplash-style Form Container */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md space-y-8"
                >
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                            <MailCheck className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Verify Your Email
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We sent a 6-digit confirmation code to{' '}
                            <span className="font-semibold text-foreground underline decoration-primary/40 underline-offset-2">
                                {email}
                            </span>
                        </p>
                    </div>

                    {/* Verification Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="code" className="text-xs font-semibold text-foreground/90">
                                    6-Digit Verification Code
                                </Label>
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                                    <Clock className="h-3 w-3 text-amber-500" />
                                    Expires in 15 mins
                                </span>
                            </div>
                            <Input
                                id="code"
                                placeholder="000000"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="h-14 text-center text-3xl tracking-[0.5em] font-mono rounded-xl bg-card border-border/80 focus-visible:ring-primary font-bold"
                                maxLength={6}
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 rounded-xl font-bold shadow-md"
                            disabled={isSubmitting || code.length < 6}
                        >
                            {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
                        </Button>
                    </form>

                    {/* Resend & Navigation Controls */}
                    <div className="space-y-4 pt-2 text-center text-xs text-muted-foreground">
                        <div className="flex items-center justify-center gap-1.5">
                            <span>Didn't receive the code?</span>
                            {countdown > 0 ? (
                                <span className="font-semibold text-muted-foreground/80">
                                    Resend code in <span className="text-primary font-bold">{countdown}s</span>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="font-bold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                                >
                                    <RefreshCw className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
                                    <span>{isResending ? 'Sending...' : 'Resend code'}</span>
                                </button>
                            )}
                        </div>

                        <div className="pt-2 border-t border-border/60">
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Wrong email address? Return to register</span>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
