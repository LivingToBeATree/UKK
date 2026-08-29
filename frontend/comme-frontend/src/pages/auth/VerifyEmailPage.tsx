import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

export const VerifyEmailPage: React.FC = () => {
    const { confirmRegistration } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as { email?: string })?.email;
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If no email in state, redirect to register
    if (!email) {
        return <Navigate to="/register" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }

        setIsSubmitting(true);
        try {
            await confirmRegistration(email, code);
            toast.success('Account verified! Welcome to Comme!');
            navigate('/', { replace: true });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Verification failed';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
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
                        <MailCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Verify Your Email</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
                    </p>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                    id="code"
                                    placeholder="000000"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="text-center text-2xl tracking-[0.5em] font-mono"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting || code.length < 6}>
                                {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Didn't receive the code? Check your spam folder or{' '}
                    <button
                        onClick={() => navigate('/register')}
                        className="text-primary hover:underline"
                    >
                        try again
                    </button>
                </p>
            </motion.div>
        </div>
    );
};
