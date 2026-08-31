import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { ArrowRight, ArrowUpRight, Palette, ShieldCheck, Sparkles, Compass, Store, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { ModeToggle } from '@/components/mode-toggle';
import { ColorThemeToggle } from '@/components/color-theme-toggle';

const heroReveal: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const steps = [
    {
        n: '01',
        title: 'Pick an artist and an option',
        body: 'Browse portfolios, compare packages, and message the artist about what you need before you commit.',
    },
    {
        n: '02',
        title: 'Your payment goes into escrow',
        body: "Funds are held the moment you pay — the artist can't touch them until there's something to approve.",
    },
    {
        n: '03',
        title: 'The artist delivers on your timeline',
        body: 'Track progress and messages in one thread. You get a 7-day window to review the finished piece.',
    },
    {
        n: '04',
        title: 'Approve it, or ask for a revision',
        body: "If it's right, confirm and the artist gets paid. If not, request a revision — no extra charge, no new escrow.",
    },
];

const gallery = [
    { src: '/JPGs/hand-drawn.jpg', label: 'Traditional ink' },
    { src: '/JPGs/androgynous-character-lowkey.jpg', label: 'Character design & OC' },
    { src: '/JPGs/pottery.jpg', label: 'Ceramic & craft' },
    { src: '/JPGs/3d-model-of-buddha.jpg', label: '3D sculpt & asset' },
    { src: '/JPGs/pixel-art-thingy.jpg', label: 'Retro pixel art' },
    { src: '/JPGs/super-cool-abstract-art-thingy.jpg', label: 'Abstract & visual FX' },
    { src: '/JPGs/close-up-hand-writing-notebook.jpg', label: 'Creative writing & lore' },
    { src: '/JPGs/handcraft-things.jpg', label: 'Handmade crafts' },
    { src: '/JPGs/random-paint.jpg', label: 'Painterly fine art' },
    { src: '/JPGs/photography-because-why-not.jpg', label: 'Photography & mood' },
    { src: '/JPGs/writing.jpg', label: 'Calligraphy & typography' },
    { src: '/JPGs/bookmark-looking-thing.jpg', label: 'Stationery & print' },
];

export const LandingPage: React.FC = () => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const { requireAuth, openAuthModal } = useAuthModal();

    if (isLoading) return null;

    if (isAuthenticated) {
        return <Navigate to="/explore" replace />;
    }

    return (
        <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-between">
            {/* ── Standalone Marketing Navbar (No internal sidebar on landing) ── */}
            <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-4">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/Comme_Emblem.svg"
                            alt="Comme"
                            className="h-7 w-7 object-contain"
                        />
                        <span className="font-extrabold text-base tracking-tight text-foreground">
                            COMME
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
                        <Link to="/explore" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                            <Compass className="h-3.5 w-3.5" />
                            <span>Artwork Feed</span>
                        </Link>
                        <Link to="/store" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                            <Store className="h-3.5 w-3.5" />
                            <span>Commission Store</span>
                        </Link>
                        <Link to="/artists" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5" />
                            <span>Artists Directory</span>
                        </Link>
                        <Link to="/escrow-terms" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Escrow Protection</span>
                        </Link>
                    </nav>

                    {/* Right Action Controls */}
                    <div className="flex items-center gap-2.5">
                        <ColorThemeToggle />
                        <ModeToggle />

                        {isAuthenticated ? (
                            <Link to={user?.artist_profile ? '/dashboard' : '/explore'}>
                                <Button size="sm" className="font-semibold text-xs h-9">
                                    {user?.artist_profile ? 'Go to Studio' : 'Launch Feed'}
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openAuthModal('generic')}
                                    className="font-semibold text-xs h-9"
                                >
                                    Log In
                                </Button>
                                <Link to="/explore">
                                    <Button size="sm" className="font-semibold text-xs h-9">
                                        Explore App
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Main Marketing Body ── */}
            <main className="flex-1">
                {/* ── Hero ── */}
                <section className="relative overflow-hidden">
                    <div className="absolute -top-32 right-[-10%] w-[520px] h-[520px] rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10" />

                    <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-24">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            <motion.div
                                variants={heroReveal}
                                initial="hidden"
                                animate="show"
                                className="lg:col-span-7 space-y-6"
                            >
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                                    Commission original art.{' '}
                                    <span className="text-primary">Your payment stays protected</span> until it's done.
                                </h1>
                                <p className="text-base text-muted-foreground max-w-md leading-relaxed">
                                    Comme connects you with independent artists for custom illustrations, character designs, and more — with escrow that holds your payment until you approve the work.
                                </p>
                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <Link to="/store">
                                        <Button size="lg">
                                            Browse commissions <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </Link>
                                    {isAuthenticated ? (
                                        user?.artist_profile ? (
                                            <Link to="/dashboard">
                                                <Button variant="outline" size="lg">
                                                    <Palette className="h-4 w-4 mr-2" /> Go to studio
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link to="/apply-artist">
                                                <Button variant="outline" size="lg">Become an artist</Button>
                                            </Link>
                                        )
                                    ) : (
                                        <Link to="/explore">
                                            <Button variant="outline" size="lg">Explore the feed</Button>
                                        </Link>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                variants={heroReveal}
                                initial="hidden"
                                animate="show"
                                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                                className="lg:col-span-5 relative h-72 sm:h-96"
                            >
                                <div className="absolute right-0 top-4 w-[78%] h-[78%] rounded-xl overflow-hidden shadow-xl rotate-2">
                                    <img src="/JPGs/digital-art-looking.jpg" alt="Digital art commission" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute left-0 bottom-0 w-[52%] h-[52%] rounded-xl overflow-hidden shadow-xl -rotate-3 border-4 border-background">
                                    <img src="/JPGs/composer-looking-girl.jpg" alt="Portrait commission" className="w-full h-full object-cover" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── How it works ── */}
                <section className="border-t border-border">
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
                        <div className="max-w-lg mb-12">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How a commission works</h2>
                            <p className="text-sm text-muted-foreground mt-2">Four steps, from request to finished piece.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
                            {steps.map((step) => (
                                <div key={step.n} className="flex gap-4">
                                    <span className="text-2xl font-bold text-primary/40 tabular-nums shrink-0">{step.n}</span>
                                    <div>
                                        <h3 className="font-semibold">{step.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Escrow trust strip ── */}
                <section className="border-t border-border bg-secondary/40">
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5 text-accent" />
                            </div>
                            <span className="font-semibold">Escrow protection</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Funds are held from the moment you pay and only released once you approve delivery — or automatically after a 7-day review window. If something's off, request a revision at no extra cost.
                        </p>
                        <Link to="/escrow-terms" className="shrink-0 text-sm font-medium text-primary inline-flex items-center gap-1 hover:underline">
                            Read the terms <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </section>

                {/* ── Gallery ── */}
                <section className="border-t border-border">
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
                        <div className="flex items-end justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Every style, one marketplace</h2>
                                <p className="text-sm text-muted-foreground mt-2">Painting, sculpture, calligraphy, concept art — commissioned by real people.</p>
                            </div>
                            <Link to="/explore" className="hidden sm:inline-flex text-sm font-medium text-primary items-center gap-1 hover:underline shrink-0">
                                See the feed <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="columns-2 sm:columns-3 gap-3 [column-fill:_balance]">
                            {gallery.map((item) => (
                                <div key={item.src} className="relative rounded-lg overflow-hidden break-inside-avoid mb-3">
                                    <img src={item.src} alt={item.label} className="w-full h-auto object-cover" />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
                                        <span className="text-white text-xs font-medium">{item.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── For artists ── */}
                <section className="border-t border-border">
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
            </main>

            {/* ── Landing Footer ── */}
            <footer className="border-t border-border py-8 px-6 sm:px-8 bg-background">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <img
                            src="/Comme_Emblem.svg"
                            alt="Comme"
                            className="h-5 w-5 object-contain"
                        />
                        <span>© {new Date().getFullYear()} Comme Platform. All rights reserved.</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
                        <Link to="/store" className="hover:text-foreground transition-colors">Store</Link>
                        <Link to="/license" className="hover:text-foreground transition-colors">License</Link>
                        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                        <Link to="/escrow-terms" className="hover:text-foreground transition-colors">Escrow</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};