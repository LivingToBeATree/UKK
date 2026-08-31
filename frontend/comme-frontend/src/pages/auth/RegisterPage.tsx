import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { AuthHeroBanner } from '@/components/auth/AuthHeroBanner';

const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores are allowed'),
    email: z.email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            await authService.register(data);
            toast.success('Verification code sent to your email!');
            navigate('/register/verify', { state: { email: data.email } });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
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
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Join Comme
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline font-semibold">
                                Log in
                            </Link>
                        </p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-xs font-semibold text-foreground/90">
                                Username <span className="text-muted-foreground font-normal">(only letters, numbers, and underscores)</span>
                            </Label>
                            <Input
                                id="username"
                                placeholder="alex_art"
                                className="h-11 rounded-xl bg-card border-border/80 focus-visible:ring-primary"
                                {...register('username')}
                            />
                            {errors.username && (
                                <p className="text-xs text-destructive mt-1 font-medium">{errors.username.message}</p>
                            )}
                        </div>

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
                            <Label htmlFor="password" className="text-xs font-semibold text-foreground/90">
                                Password <span className="text-muted-foreground font-normal">(min. 8 chars)</span>
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
                                Confirm password
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
                                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-xs text-destructive mt-1 font-medium">{errors.password_confirmation.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90 shadow-md transition-all cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating account...' : 'Join Comme'}
                            </Button>
                        </div>
                    </form>

                    {/* Terms and Privacy Policy notice matching Unsplash */}
                    <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
                        By joining, you agree to our{' '}
                        <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link> and{' '}
                        <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
