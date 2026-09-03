import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AuthModalConfig, AuthModalIntent } from '@/contexts/authModalContextDef';

interface IntentPreset {
    title: string;
    subtitle: string;
    images: string[];
    checklist: string[];
    primaryCtaText: string;
}

const INTENT_PRESETS: Record<AuthModalIntent, IntentPreset> = {
    bookmark: {
        title: 'Bookmark your favorite images',
        subtitle: 'Add images on the go without breaking your flow.',
        images: [
            '/JPGs/bookmark-looking-thing.jpg',
            '/JPGs/photography-because-why-not.jpg',
            '/JPGs/hand-drawn.jpg',
        ],
        checklist: [
            'Quickly save as you browse, privately',
            'Review everything later in one grid',
            'Convert into custom moodboards & references',
            'Download and organize collections',
        ],
        primaryCtaText: 'Create free account',
    },
    like: {
        title: 'Show love to independent creators',
        subtitle: 'Support artists and help great artwork get discovered.',
        images: [
            '/JPGs/super-cool-abstract-art-thingy.jpg',
            '/JPGs/random-paint.jpg',
            '/JPGs/pixel-art-thingy.jpg',
        ],
        checklist: [
            'Like and appreciate community original works',
            'Build your personal liked artwork library',
            'Get recognized on creator supporter feeds',
            'Join community discussions and feedback',
        ],
        primaryCtaText: 'Create free account',
    },
    comment: {
        title: 'Join the creative discussion',
        subtitle: 'Share feedback, ask questions, and connect with artists.',
        images: [
            '/JPGs/close-up-hand-writing-notebook.jpg',
            '/JPGs/writing.jpg',
            '/JPGs/composer-looking-girl.jpg',
        ],
        checklist: [
            'Leave feedback on original artworks and WIPs',
            'Ask artists about tools, styles, and options',
            'Build your community profile and connections',
            'Receive notifications when creators reply',
        ],
        primaryCtaText: 'Create free account',
    },
    commission: {
        title: 'Commission custom artwork safely',
        subtitle: 'Order bespoke illustrations with 100% milestone escrow protection.',
        images: [
            '/JPGs/digital-art-looking.jpg',
            '/JPGs/composer-looking-girl.jpg',
            '/JPGs/3d-model-of-buddha.jpg',
        ],
        checklist: [
            'Funds are held securely in escrow until you approve delivery',
            'Direct real-time order chat with milestone WIP check-ins',
            'Guaranteed 7-day review window with free revision requests',
            'Automated bank-grade receipts and license management',
        ],
        primaryCtaText: 'Create free account to order',
    },
    follow: {
        title: 'Follow your favorite creators',
        subtitle: 'Stay up to date with new commission openings and gallery drops.',
        images: [
            '/JPGs/androgynous-character-lowkey.jpg',
            '/JPGs/pottery.jpg',
            '/JPGs/handcraft-things.jpg',
        ],
        checklist: [
            'Get notified immediately when commission queues open',
            'Personalize your explore feed with followed artists',
            'Direct access to new works and exclusive discounts',
            'Support independent artists on their journey',
        ],
        primaryCtaText: 'Create free account',
    },
    message: {
        title: 'Message verified artists directly',
        subtitle: 'Discuss ideas, custom requirements, and quotes before ordering.',
        images: [
            '/JPGs/handcraft-things.jpg',
            '/JPGs/close-up-hand-writing-notebook.jpg',
            '/JPGs/pottery.jpg',
        ],
        checklist: [
            'Direct real-time chat with creator studios',
            'Share reference photos, color palettes, and sketches',
            'Receive tailored price quotes and milestone schedules',
            'All conversations safely archived in one place',
        ],
        primaryCtaText: 'Create free account',
    },
    studio: {
        title: 'Open your creator studio',
        subtitle: 'Monetize your creativity with automated bank payouts and escrow safety.',
        images: [
            '/JPGs/super-cool-abstract-art-thingy.jpg',
            '/JPGs/pottery.jpg',
            '/JPGs/random-paint.jpg',
        ],
        checklist: [
            'Set your own tiered packages, addons, and turnaround times',
            'Escrow guarantees client payment before you start drawing',
            'Automated Iris disbursements straight to your bank account',
            'Integrated portfolio management and client messaging thread',
        ],
        primaryCtaText: 'Get started as an artist',
    },
    report: {
        title: 'Submit a report or dispute',
        subtitle: 'Sign in to file moderation reports and track support ticket resolutions.',
        images: [
            '/JPGs/super-cool-abstract-art-thingy.jpg',
            '/JPGs/close-up-hand-writing-notebook.jpg',
            '/JPGs/digital-art-looking.jpg',
        ],
        checklist: [
            'Direct communication with moderation staff',
            'Track investigation progress in your ticket portal',
            'Safeguard intellectual property and community standards',
            'Confidential dispute mediation',
        ],
        primaryCtaText: 'Sign in to report',
    },
    generic: {
        title: 'Welcome to Comme',
        subtitle: 'Join thousands of creators and collectors ordering custom art.',
        images: [
            '/JPGs/digital-art-looking.jpg',
            '/JPGs/composer-looking-girl.jpg',
            '/JPGs/super-cool-abstract-art-thingy.jpg',
        ],
        checklist: [
            '100% Escrow protected commissions',
            'Private bookmark collections and custom feeds',
            'Direct creator chat with milestone WIP previews',
            'Verified artist directory and ratings',
        ],
        primaryCtaText: 'Create free account',
    },
};

export interface AuthModalProps {
    isOpen: boolean;
    config: AuthModalConfig;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, config, onClose }) => {
    const intent = config.intent || 'generic';
    const preset = INTENT_PRESETS[intent] || INTENT_PRESETS.generic;

    const title = config.title || preset.title;
    const subtitle = config.subtitle || preset.subtitle;
    const images = config.images || preset.images;
    const checklist = config.checklist || preset.checklist;
    const primaryCtaText = config.primaryCtaText || preset.primaryCtaText;
    const redirectUrl = config.redirectUrl || window.location.pathname;

    const registerUrl = `/register?redirect=${encodeURIComponent(redirectUrl)}`;
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/75 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Card */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 12 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 360 }}
                        className="relative z-10 w-full max-w-[460px] rounded-3xl bg-card border border-border/80 text-card-foreground shadow-2xl overflow-hidden select-none"
                    >
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer shadow-md focus:outline-none"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Top Artwork Collage Header (Matching Reference Screenshot) */}
                        <div className="relative w-full h-44 sm:h-48 bg-muted/40 overflow-hidden pt-4 px-4 flex items-center justify-center gap-2.5">
                            {/* Left Peek Image */}
                            <div className="w-24 sm:w-28 h-32 rounded-xl overflow-hidden shadow-md opacity-70 -rotate-3 shrink-0 border border-border/40">
                                <img
                                    src={images[0] || '/JPGs/digital-art-looking.jpg'}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Center Main Image */}
                            <div className="w-48 sm:w-56 h-36 sm:h-40 rounded-2xl overflow-hidden shadow-xl z-10 border-2 border-background shrink-0">
                                <img
                                    src={images[1] || images[0] || '/JPGs/composer-looking-girl.jpg'}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Right Peek Image */}
                            <div className="w-24 sm:w-28 h-32 rounded-xl overflow-hidden shadow-md opacity-70 rotate-3 shrink-0 border border-border/40">
                                <img
                                    src={images[2] || images[0] || '/JPGs/hand-drawn.jpg'}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Gradient bottom fade for seamless transition */}
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                        </div>

                        {/* Body Content */}
                        <div className="p-6 sm:p-8 space-y-6 text-left">
                            {/* Title & Subtitle */}
                            <div className="space-y-1.5">
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-snug">
                                    {title}
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {subtitle}
                                </p>
                            </div>

                            {/* Feature Checklist */}
                            <div className="space-y-2.5 pt-1">
                                {checklist.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
                                        <div className="h-4 w-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="h-3 w-3 stroke-[2.5]" />
                                        </div>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-2">
                                <Link to={registerUrl} onClick={onClose} className="block w-full">
                                    <Button
                                        className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] border-0"
                                    >
                                        {primaryCtaText}
                                    </Button>
                                </Link>

                                <div className="text-center pt-1">
                                    <p className="text-xs text-muted-foreground">
                                        Already have an account?{' '}
                                        <Link
                                            to={loginUrl}
                                            onClick={onClose}
                                            className="font-bold text-foreground hover:text-primary transition-colors underline underline-offset-4"
                                        >
                                            Log in
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
