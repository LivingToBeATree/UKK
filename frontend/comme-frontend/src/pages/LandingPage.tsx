import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Sparkles,
    Palette,
    ShieldCheck,
    ArrowRight,
    Star,
    Zap,
    Users,
    Heart,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const featuredArtists = [
    { name: 'Sakura Mizu', specialty: 'Anime Illustration', avatar: null, rating: 4.9, commissions: 128 },
    { name: 'PixelForge', specialty: 'Game Assets', avatar: null, rating: 4.8, commissions: 95 },
    { name: 'Neon Dreams', specialty: 'Character Design', avatar: null, rating: 4.95, commissions: 210 },
    { name: 'CloudCanvas', specialty: 'Concept Art', avatar: null, rating: 4.7, commissions: 67 },
];

const howItWorks = [
    { step: '01', title: 'Discover Artists', description: 'Browse talented artists and their commission services in our global marketplace.', icon: Users },
    { step: '02', title: 'Place Your Order', description: 'Choose a service, pick your options and addons, and describe your vision.', icon: Sparkles },
    { step: '03', title: 'Collaborate & Chat', description: 'Work directly with your artist through built-in messaging and revisions.', icon: Heart },
    { step: '04', title: 'Receive & Review', description: 'Get your finished artwork, make payment, and leave a review.', icon: CheckCircle2 },
];

const stats = [
    { value: '2,400+', label: 'Active Artists' },
    { value: '18,000+', label: 'Commissions Delivered' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '$1.2M+', label: 'Artist Earnings' },
];

export const LandingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen">
            {/* ─── Hero Section ─── */}
            <section className="relative overflow-hidden py-20 sm:py-32">
                {/* Background gradient */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/5" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
                    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                        <motion.div variants={fadeUp}>
                            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold">
                                <Sparkles className="h-3 w-3 mr-1.5" />
                                The Art Commission Platform
                            </Badge>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight"
                        >
                            Commission Art,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                Made Simple
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed"
                        >
                            Connect with talented artists worldwide. Order custom artwork, collaborate in real-time,
                            and bring your creative vision to life.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 pt-4">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/store">
                                        <Button size="lg">
                                            Browse Store <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </Link>
                                    <Link to="/explore">
                                        <Button size="lg" variant="outline">
                                            Explore Feed
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/register">
                                        <Button size="lg">
                                            Get Started <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </Link>
                                    <Link to="/store">
                                        <Button size="lg" variant="outline">
                                            Browse Artists
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Stats Bar ─── */}
            <section className="border-y border-border bg-card/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-8"
                    >
                        {stats.map((stat) => (
                            <motion.div key={stat.label} variants={fadeUp} className="text-center">
                                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
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
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold">
                            How It Works
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-muted-foreground mt-3 max-w-xl mx-auto">
                            From discovery to delivery — commissioning art has never been easier.
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
                                            <Badge variant="secondary" className="text-[10px]">
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

            {/* ─── Featured Artists ─── */}
            <section className="py-20 sm:py-28 bg-card/30">
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold">
                            Featured Artists
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-muted-foreground mt-3 max-w-xl mx-auto">
                            Discover world-class talent ready to bring your ideas to life.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {featuredArtists.map((artist) => (
                            <motion.div key={artist.name} variants={fadeUp}>
                                <Card className="h-full hover:border-primary/40 transition-all hover:-translate-y-1">
                                    <CardContent className="p-6 text-center space-y-4">
                                        <Avatar size="lg" fallback={artist.name} />
                                        <div>
                                            <h3 className="font-bold text-sm">{artist.name}</h3>
                                            <p className="text-xs text-muted-foreground">{artist.specialty}</p>
                                        </div>
                                        <div className="flex items-center justify-center gap-3 text-xs">
                                            <span className="flex items-center gap-1 text-amber-400">
                                                <Star className="h-3 w-3 fill-current" />
                                                {artist.rating}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {artist.commissions} orders
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="text-center mt-10">
                        <Link to="/artists">
                            <Button variant="outline" size="lg">
                                View All Artists <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Why Comme ─── */}
            <section className="py-20 sm:py-28">
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold">
                            Why Choose Comme?
                        </motion.h2>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid sm:grid-cols-3 gap-8"
                    >
                        {[
                            { icon: ShieldCheck, title: 'Secure Payments', desc: 'Protected transactions with Midtrans. Pay only when you\'re satisfied.' },
                            { icon: Palette, title: 'Creative Freedom', desc: 'Full collaboration tools — messaging, revisions, and reference uploads.' },
                            { icon: Zap, title: 'Built for Speed', desc: 'Streamlined workflow from order to delivery. No more back-and-forth chaos.' },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <motion.div key={item.title} variants={fadeUp}>
                                    <Card className="h-full">
                                        <CardContent className="p-8 space-y-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="font-bold text-base">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ─── CTA Section ─── */}
            <section className="py-20 sm:py-28">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold">
                            Ready to Get Started?
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Join thousands of artists and clients already creating amazing work together.
                        </motion.p>
                        <motion.div variants={fadeUp} className="flex justify-center gap-4 pt-4">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/register">
                                        <Button size="lg">
                                            Create Account <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </Link>
                                    <Link to="/apply-artist">
                                        <Button size="lg" variant="outline">
                                            Apply as Artist
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/store">
                                        <Button size="lg">
                                            Explore Store <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </Link>
                                    <Link to="/apply-artist">
                                        <Button size="lg" variant="outline">
                                            Become an Artist
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="border-t border-border py-10 bg-card/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/Comme_Wordmark.svg" alt="Comme" className="h-6 w-auto" />
                            <span className="text-xs text-muted-foreground">© 2026 Comme. All rights reserved.</span>
                        </div>
                        <nav className="flex items-center gap-6 text-xs text-muted-foreground">
                            <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
                            <Link to="/artists" className="hover:text-foreground transition-colors">Artists</Link>
                            <Link to="/store" className="hover:text-foreground transition-colors">Store</Link>
                        </nav>
                    </div>
                </div>
            </footer>
        </div>
    );
};
