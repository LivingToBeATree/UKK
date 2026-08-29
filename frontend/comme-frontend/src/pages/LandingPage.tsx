import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Sparkles,
    Palette,
    ArrowRight,
    Zap,
    Users,
    CheckCircle2,
    Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { artistProfileApi } from '@/services/artistService';
import type { ArtistProfile } from '@/types';

const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const howItWorks = [
    {
        step: '01',
        title: 'Discover Creators',
        description: 'Browse verified illustrators, Vtuber riggers, and concept artists by style and tier.',
        icon: Users,
    },
    {
        step: '02',
        title: 'Submit Your Brief',
        description: 'Choose options, define deadline limits, and attach character reference sheets.',
        icon: Sparkles,
    },
    {
        step: '03',
        title: 'Midtrans Escrow Hold',
        description: 'Funds are securely locked in escrow and only disbursed when you approve deliverables.',
        icon: Lock,
    },
    {
        step: '04',
        title: 'Collaborate & Approve',
        description: 'Inspect sketches, request revisions in the commission chat, and download source files.',
        icon: CheckCircle2,
    },
];

const launchHighlights = [
    { value: '0%', label: 'Platform Fees (Launch Period)' },
    { value: '100%', label: 'Midtrans Escrow Guarantee' },
    { value: 'Milestones', label: 'Review & Revision Rounds' },
    { value: 'Instant', label: 'QRIS, Snap & Bank Transfer' },
];

export const LandingPage: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const [artists, setArtists] = useState<ArtistProfile[]>([]);
    const [loadingArtists, setLoadingArtists] = useState(true);

    useEffect(() => {
        const loadFeaturedArtists = async () => {
            try {
                const res = await artistProfileApi.list(1);
                setArtists(res.data.slice(0, 4));
            } catch {
                // Fallback to empty
                setArtists([]);
            } finally {
                setLoadingArtists(false);
            }
        };
        loadFeaturedArtists();
    }, []);

    return (
        <div className="min-h-screen">
            {/* ─── Hero Section ─── */}
            <section className="relative overflow-hidden py-20 sm:py-32">
                {/* Background gradient */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
                    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                        <motion.div variants={fadeUp}>
                            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold">
                                <Sparkles className="h-3 w-3 mr-1.5 text-primary" />
                                The Anime & Digital Art Commission Hub
                            </Badge>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight"
                        >
                            Where Commission Art Finds Its{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-amber-400">
                                Flow.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed"
                        >
                            Connect with verified digital illustrators, commission tailor-made artwork with milestone approvals, and pay with complete peace of mind through Midtrans escrow protection.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 pt-4">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/store">
                                        <Button size="lg" className="gap-2">
                                            Browse Store <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    {user?.artist_profile ? (
                                        <Link to="/dashboard">
                                            <Button size="lg" variant="outline" className="gap-2">
                                                <Palette className="h-4 w-4 text-emerald-400" />
                                                Artist Studio
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link to="/apply-artist">
                                            <Button size="lg" variant="outline" className="gap-2">
                                                <Sparkles className="h-4 w-4 text-amber-400" />
                                                Become an Artist
                                            </Button>
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Link to="/register">
                                        <Button size="lg" className="gap-2">
                                            Get Started Free <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link to="/explore">
                                        <Button size="lg" variant="outline">
                                            Explore Artwork
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Highlights Bar ─── */}
            <section className="border-y border-border bg-card/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-8"
                    >
                        {launchHighlights.map((stat) => (
                            <motion.div key={stat.label} variants={fadeUp} className="text-center">
                                <p className="text-xl sm:text-2xl font-black text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section className="py-20 sm:py-28">
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold">
                            How Commissioning on Comme Works
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-muted-foreground mt-3 max-w-xl mx-auto text-xs sm:text-sm">
                            Clear milestone approvals, built-in communication, and automated Midtrans escrow protection.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {howItWorks.map((item) => {
                            const Icon = item.icon;
                            return (
                                <motion.div key={item.step} variants={fadeUp}>
                                    <Card className="h-full hover:border-primary/40 transition-colors">
                                        <CardContent className="p-6 text-center space-y-4">
                                            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                                                Step {item.step}
                                            </Badge>
                                            <h3 className="font-bold text-sm">{item.title}</h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {item.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ─── Featured Creators ─── */}
            <section className="py-20 sm:py-28 bg-card/30 border-y border-border">
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold">
                            Featured Creators
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-muted-foreground mt-3 max-w-xl mx-auto text-xs sm:text-sm">
                            Verified artists ready to collaborate and bring your ideas to life.
                        </motion.p>
                    </motion.div>

                    {loadingArtists ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i} className="p-6 space-y-4">
                                    <div className="h-16 w-16 rounded-full bg-muted animate-pulse mx-auto" />
                                    <div className="h-4 w-28 bg-muted animate-pulse mx-auto" />
                                </Card>
                            ))}
                        </div>
                    ) : artists.length > 0 ? (
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {artists.map((artist) => (
                                <motion.div key={artist.id} variants={fadeUp}>
                                    <Link to={`/artists/${artist.id}`}>
                                        <Card className="h-full hover:border-primary/50 transition-all group">
                                            <CardContent className="p-6 text-center space-y-3">
                                                <Avatar
                                                    size="lg"
                                                    fallback={artist.user?.display_name || artist.user?.username || 'Artist'}
                                                    src={artist.user?.avatar_url}
                                                    className="mx-auto border-2 border-primary/20 group-hover:scale-105 transition-transform"
                                                />
                                                <div>
                                                    <h3 className="font-bold text-sm group-hover:text-primary transition-colors">
                                                        {artist.user?.display_name || artist.user?.username}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground">@{artist.user?.username}</p>
                                                </div>
                                                <Badge variant="teal" className="text-[10px]">
                                                    Available for Orders
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-10 space-y-3">
                            <p className="text-sm text-muted-foreground">Join our first wave of verified creators!</p>
                            <Link to="/apply-artist">
                                <Button size="sm" className="gap-2">
                                    <Sparkles className="h-4 w-4" /> Apply as an Artist
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── CTA Section ─── */}
            <section className="py-20 sm:py-28">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8 sm:p-12">
                        <CardContent className="space-y-6 p-0">
                            <Badge variant="secondary" className="px-4 py-1 text-xs">
                                <Zap className="h-3 w-3 mr-1.5 text-primary" /> Start Creating Today
                            </Badge>
                            <h2 className="text-3xl sm:text-4xl font-extrabold">
                                Ready to Bring Your Vision to Life?
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
                                Join thousands of art lovers and creators. Order your first commission with complete escrow protection today.
                            </p>
                            <div className="flex items-center justify-center gap-4 pt-2">
                                <Link to="/register">
                                    <Button size="lg" className="gap-2">
                                        Sign Up Now <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link to="/store">
                                    <Button size="lg" variant="outline">
                                        Browse Services
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
};
