import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface SlideData {
    image: string;
    title: string;
    description: string;
    author: string;
    tag: string;
}

const AUTH_SLIDES: SlideData[] = [
    {
        image: '/digital-art-looking.jpg',
        title: 'Creation starts here',
        description: 'Connect directly with visionary artists, commission custom artwork, and elevate your creative space.',
        author: 'Digital Dreams Studio',
        tag: 'Digital Illustration',
    },
    {
        image: '/composer-looking-girl.jpg',
        title: 'Bring your vision to life',
        description: 'Transparent milestone escrow, real-time collaboration, and dedicated creator-first tools.',
        author: 'Studio Lumina',
        tag: 'Character Art',
    },
    {
        image: '/handcraft-things.jpg',
        title: 'Crafted with passion',
        description: 'Discover bespoke handmade commissions, physical artisan pieces, and one-of-a-kind treasures.',
        author: 'Artisan Guild',
        tag: 'Artisan Crafts',
    },
    {
        image: '/super-cool-abstract-art-thingy.jpg',
        title: 'Empowering original art',
        description: 'Join a thriving community of independent creators and collectors worldwide.',
        author: 'Vivid Abstract Realm',
        tag: 'Concept Art',
    },
];

export const AuthHeroBanner: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-cycle every 15 seconds as requested
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % AUTH_SLIDES.length);
        }, 15000); // 15 seconds

        return () => clearInterval(interval);
    }, []);

    const slide = AUTH_SLIDES[currentIndex];

    return (
        <div className="relative hidden lg:flex flex-col justify-between w-1/2 min-h-screen bg-zinc-950 p-10 overflow-hidden select-none">
            {/* Background Image Carousel with Smooth Crossfade */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={slide.image}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Multi-stop cinematic gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Top Brand Logo */}
            <div className="relative z-10">
                <Link to="/" className="inline-flex items-center gap-3 group">
                    <img
                        src="/Comme_Emblem.svg"
                        alt="Comme"
                        className="h-9 w-9 object-contain drop-shadow-md transition-transform group-hover:scale-105"
                    />
                    <span className="font-extrabold text-lg tracking-tight text-white drop-shadow-md">
                        COMME
                    </span>
                </Link>
            </div>

            {/* Bottom Content Area: Tagline, Description, Credit, & Progress Dots */}
            <div className="relative z-10 space-y-6 max-w-xl">
                {/* Text Transition */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="space-y-3"
                    >
                        <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white/90 uppercase tracking-wider mb-1">
                            {slide.tag}
                        </div>
                        <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                            {slide.title}
                        </h2>
                        <p className="text-sm xl:text-base text-zinc-200/90 leading-relaxed drop-shadow-sm max-w-lg">
                            {slide.description}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Metadata & 15-second Carousel Indicators */}
                <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                    <p className="text-xs text-zinc-300 font-medium">
                        Artwork by <span className="text-white font-semibold">{slide.author}</span>
                    </p>

                    {/* Progress Dots */}
                    <div className="flex items-center gap-2">
                        {AUTH_SLIDES.map((s, idx) => (
                            <button
                                key={s.image}
                                onClick={() => setCurrentIndex(idx)}
                                className="group relative py-2 focus:outline-none cursor-pointer"
                                aria-label={`Go to slide ${idx + 1}`}
                            >
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                        idx === currentIndex
                                            ? 'w-8 bg-white shadow-sm'
                                            : 'w-2 bg-white/40 hover:bg-white/70'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
