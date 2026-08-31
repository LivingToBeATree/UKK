import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { AuthHeroBanner } from '@/components/auth/AuthHeroBanner';

const loginSchema = z.object({
    email: z.email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const { login, loginWith2FA } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    // 2FA Challenge State
    const [is2FAPrompt, setIs2FAPrompt] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [isUsingRecovery, setIsUsingRecovery] = useState(false);
    const [verifying2FA, setVerifying2FA] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            const res = await login(data.email, data.password);
            if (res && 'requires_2fa' in res && res.requires_2fa) {
                setTwoFactorToken(res.two_factor_token);
                setIs2FAPrompt(true);
                toast.info('Please enter your Two-Factor Authentication code.');
                return;
            }
            toast.success('Welcome back!');
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
            toast.error(message);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!twoFactorCode.trim()) {
            toast.error(isUsingRecovery ? 'Please enter a recovery code' : 'Please enter the 6-digit code');
            return;
        }

        setVerifying2FA(true);
        try {
            await loginWith2FA(twoFactorToken, twoFactorCode.trim());
            toast.success('Two-factor authentication verified! Welcome back.');
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid verification code. Please try again.';
            toast.error(message);
        } finally {
            setVerifying2FA(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-background text-foreground">
            {/* Left 50%: 15-second Rotating Artwork Hero Banner */}
            <AuthHeroBanner />

            {/* Right 50%: Clean Unsplash-style Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md space-y-8"
                >
                    <AnimatePresence mode="wait">
                        {!is2FAPrompt ? (
                            <motion.div
                                key="credentials"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 16 }}
                                className="space-y-8"
                            >
                                {/* Header */}
                                <div className="text-center space-y-2">
                                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                                        Login to Comme
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Don't have an account?{' '}
                                        <Link to="/register" className="text-primary hover:underline font-semibold">
                                            Join now
                                        </Link>
                                    </p>
                                </div>

                                {/* Login Form */}
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-xs font-semibold text-foreground/90">
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="alex@example.com"
                                            className="h-11 rounded-xl bg-card border-border/80 focus-visible:ring-primary"
                                            {...register('email')}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-xs font-semibold text-foreground/90">
                                                Password
                                            </Label>
                                            <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="h-11 rounded-xl pr-10 bg-card border-border/80 focus-visible:ring-primary"
                                                {...register('password')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 rounded-xl font-bold shadow-md cursor-pointer mt-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                                    </Button>
                                </form>
                            </motion.div>
                        ) : (
                            /* 2FA Challenge Form */
                            <motion.div
                                key="twofa"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-3">
                                    <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                                        {isUsingRecovery ? (
                                            <KeyRound className="h-7 w-7 text-primary" />
                                        ) : (
                                            <ShieldCheck className="h-7 w-7 text-primary" />
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                                        {isUsingRecovery ? 'Two-Factor Recovery' : 'Two-Factor Verification'}
                                    </h1>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {isUsingRecovery
                                            ? 'Enter one of your 10-character emergency recovery codes.'
                                            : 'Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, Apple Passwords).'}
                                    </p>
                                </div>

                                <form onSubmit={handle2FASubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="twofa_input" className="text-xs font-semibold text-center block">
                                            {isUsingRecovery ? 'Emergency Recovery Code' : '6-Digit Authenticator Code'}
                                        </Label>
                                        <Input
                                            id="twofa_input"
                                            placeholder={isUsingRecovery ? 'XXXXX-XXXXX' : '000000'}
                                            value={twoFactorCode}
                                            onChange={(e) => {
                                                if (isUsingRecovery) {
                                                    setTwoFactorCode(e.target.value.toUpperCase());
                                                } else {
                                                    setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                                }
                                            }}
                                            className={`h-14 text-center ${isUsingRecovery ? 'text-xl tracking-widest' : 'text-3xl tracking-[0.5em]'} font-mono rounded-xl bg-card border-border/80 font-bold`}
                                            maxLength={isUsingRecovery ? 12 : 6}
                                            autoFocus
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 rounded-xl font-bold shadow-md cursor-pointer"
                                        disabled={verifying2FA || (isUsingRecovery ? twoFactorCode.length < 8 : twoFactorCode.length !== 6)}
                                    >
                                        {verifying2FA ? 'Verifying...' : 'Verify & Complete Sign In'}
                                    </Button>
                                </form>

                                <div className="space-y-3 text-center text-xs text-muted-foreground pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsUsingRecovery(!isUsingRecovery);
                                            setTwoFactorCode('');
                                        }}
                                        className="text-primary hover:underline font-semibold cursor-pointer"
                                    >
                                        {isUsingRecovery ? 'Use 6-digit authenticator code instead' : 'Lost device? Use an emergency recovery code'}
                                    </button>

                                    <div className="pt-2 border-t border-border/60">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIs2FAPrompt(false);
                                                setTwoFactorCode('');
                                            }}
                                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                                        >
                                            <ArrowLeft className="h-3.5 w-3.5" />
                                            <span>Back to email and password login</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};
