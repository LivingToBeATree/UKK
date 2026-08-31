import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { KeyRound, ArrowLeft } from 'lucide-react';
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
    email: z.email('Please enter a valid email address'),
});

type ForgotForm = z.infer<typeof schema>;

export const ForgotPasswordPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: ForgotForm) => {
        try {
            await authService.forgotPassword(data.email);
            toast.success('Password reset link sent to your email!');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send reset link';
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
                            <KeyRound className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Forgot Password
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Enter your registered email address and we'll send you instructions to reset your password.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                        <Button
                            type="submit"
                            className="w-full h-11 rounded-xl font-bold shadow-md"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending instructions...' : 'Send Reset Link'}
                        </Button>
                    </form>

                    {/* Return link */}
                    <div className="text-center pt-2 border-t border-border/60">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Remember your password? Sign in</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
