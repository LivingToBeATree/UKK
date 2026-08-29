import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Sparkles,
    Palette,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const LandingPage: React.FC = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="w-full flex-1 flex flex-col justify-center min-h-[calc(100vh-4rem-16rem)]">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 sm:py-36 lg:py-44 flex items-center justify-center">
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
                    <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-accent/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-12 text-center">
                    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8">
                        <motion.div variants={fadeUp}>
                            <Badge variant="secondary" className="px-4 py-1.5 text-xs font-semibold">
                                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                Independent Creator Commission Hub
                            </Badge>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[1.1]"
                        >
                            Commission Art with{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-amber-400">
                                Zero Friction.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="max-w-2xl mx-auto text-base sm:text-xl text-muted-foreground leading-relaxed font-normal"
                        >
                            Order custom illustrations directly from digital artists with milestone check-ins and escrow-backed payments.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/store">
                                        <Button size="lg" className="h-12 px-6 text-sm font-semibold gap-2">
                                            Browse Store <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    {user?.artist_profile ? (
                                        <Link to="/dashboard">
                                            <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-semibold gap-2">
                                                <Palette className="h-4 w-4 text-emerald-400" />
                                                Artist Studio
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link to="/apply-artist">
                                            <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-semibold gap-2">
                                                <Sparkles className="h-4 w-4 text-amber-400" />
                                                Become an Artist
                                            </Button>
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Link to="/register">
                                        <Button size="lg" className="h-12 px-8 text-sm font-semibold gap-2">
                                            Create Account <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link to="/explore">
                                        <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-semibold">
                                            Explore Feed
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
