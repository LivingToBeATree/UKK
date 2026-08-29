import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

const schema = z.object({
    email: z.email('Please enter a valid email'),
});

type ForgotForm = z.infer<typeof schema>;

export const ForgotPasswordPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>();

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
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Forgot Password</h1>
                    <p className="text-sm text-muted-foreground mt-2">Enter your email and we'll send you a reset link</p>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register('email')}
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Remember your password?{' '}
                    <Link to="/login" className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};
