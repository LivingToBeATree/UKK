import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { AuthHeroBanner } from '@/components/auth/AuthHeroBanner';

const schema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
});

type ResetForm = z.infer<typeof schema>;

export const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetForm>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: ResetForm) => {
        try {
            await authService.resetPassword({
                token,
                email,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });
            toast.success('Password reset successfully! Please sign in.');
            navigate('/login', { replace: true });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Reset failed';
            toast.error(message);
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
                            <ShieldCheck className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Reset Password
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Create a new, secure password for{' '}
                            <span className="font-semibold text-foreground">{email}</span>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold text-foreground/90">
                                New Password <span className="text-muted-foreground font-normal">(min. 8 chars)</span>
                            </Label>
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

                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation" className="text-xs font-semibold text-foreground/90">
                                Confirm New Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="h-11 rounded-xl pr-10 bg-card border-border/80 focus-visible:ring-primary"
                                    {...register('password_confirmation')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-xs text-destructive mt-1 font-medium">{errors.password_confirmation.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 rounded-xl font-bold shadow-md mt-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>

                    {/* Return link */}
                    <div className="text-center pt-2 border-t border-border/60">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back to Sign In</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
