import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';

export const ForArtistsCta: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const { requireAuth } = useAuthModal();

    return (
        <section className="border-t border-border mt-auto w-full bg-background">
            <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl bg-foreground text-background p-8 sm:p-12">
                    <div className="lg:col-span-8 space-y-3">
                        <div className="inline-flex items-center gap-2 text-xs font-medium text-background/70">
                            <Sparkles className="h-3.5 w-3.5" /> For artists
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Set your own packages. Get paid on delivery.</h2>
                        <p className="text-sm text-background/70 max-w-md leading-relaxed">
                            Build tiered commission options, manage a portfolio, and message clients directly — payouts go straight to your bank once a commission is confirmed.
                        </p>
                    </div>
                    <div className="lg:col-span-4 flex lg:justify-end">
                        {isAuthenticated ? (
                            <Link to={user?.artist_profile ? '/dashboard' : '/apply-artist'}>
                                <Button size="lg" variant="secondary">
                                    {user?.artist_profile ? 'Go to studio' : 'Apply as an artist'}
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                size="lg"
                                variant="secondary"
                                onClick={() => requireAuth('studio')}
                            >
                                Get started <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
