import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Menu,
    Building2,
    Layers,
    Users,
    X,
    ExternalLink,
    Shield,
} from 'lucide-react';

export const InfoFlyout: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close on click outside or Escape
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div className="w-full relative" ref={popoverRef}>
            {/* Trigger Button in Sidebar */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`w-full h-11 flex items-center rounded-xl pl-2 pr-2.5 gap-3 transition-colors duration-150 cursor-pointer focus:outline-none overflow-hidden ${
                    isOpen
                        ? 'bg-secondary text-foreground font-semibold shadow-xs ring-1 ring-border/50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                aria-label="Platform Information and Company Menu"
                aria-expanded={isOpen}
            >
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <Menu className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isOpen ? 'text-primary' : ''}`} />
                </div>

                <AnimatePresence initial={false}>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.15 }}
                            className="text-xs font-semibold truncate whitespace-nowrap text-left"
                        >
                            More &amp; About
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Collapsed Tooltip */}
            <AnimatePresence>
                {collapsed && showTooltip && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -8, scale: 0.94 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -6, scale: 0.94 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 420 }}
                        className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none select-none"
                    >
                        More &amp; Company
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Unsplash-style Floating Multi-Column Popover Card */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -12, scale: 0.96 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.96 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 380 }}
                        className="absolute left-[calc(100%+16px)] bottom-0 z-50 w-[640px] max-w-[90vw] bg-card/98 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl overflow-hidden p-6 select-none"
                    >
                        {/* Header with Close button */}
                        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <img
                                    src="/Comme_Emblem.svg"
                                    alt="Comme"
                                    className="h-6 w-6 object-contain"
                                />
                                <span className="font-extrabold text-sm tracking-tight text-foreground">
                                    COMME DIRECT PLATFORM
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                                aria-label="Close menu"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* 3 Main Link Columns */}
                        <div className="grid grid-cols-3 gap-8 text-left">
                            {/* Column 1: Company */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <span>Company</span>
                                </div>
                                <ul className="space-y-2 text-xs text-muted-foreground">
                                    <li>
                                        <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors block">
                                            About Comme
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/artists" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors block">
                                            Artists Roster
                                        </Link>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Milestone Escrow
                                        </span>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Careers &amp; Team
                                        </span>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Blog &amp; Press
                                        </span>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Help &amp; FAQ
                                        </span>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Contact Support
                                        </span>
                                    </li>
                                </ul>

                                {/* Social Links */}
                                <div className="pt-2 flex items-center gap-3 text-muted-foreground">
                                    <a
                                        href="https://x.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-7 w-7 rounded-md flex items-center justify-center hover:text-foreground hover:bg-secondary/70 transition-colors"
                                        aria-label="X (Twitter)"
                                    >
                                        <span className="font-bold text-xs">𝕏</span>
                                    </a>
                                    <a
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-7 w-7 rounded-md flex items-center justify-center hover:text-foreground hover:bg-secondary/70 transition-colors"
                                        aria-label="Instagram"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* Column 2: Product */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                                    <Layers className="h-4 w-4 text-emerald-400" />
                                    <span>Product</span>
                                </div>
                                <ul className="space-y-2 text-xs text-muted-foreground">
                                    <li>
                                        <Link to="/explore" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors block">
                                            Artwork Showcase
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/store" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors block">
                                            Commission Store
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors block">
                                            Artist Studio
                                        </Link>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Developers &amp; API
                                        </span>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Direct Milestones
                                        </span>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Placement Ads
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 3: Community */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                                    <Users className="h-4 w-4 text-amber-400" />
                                    <span>Community</span>
                                </div>
                                <ul className="space-y-2 text-xs text-muted-foreground">
                                    <li>
                                        <Link to="/apply-artist" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors block font-medium text-amber-400/90 hover:text-amber-400">
                                            Become an Artist
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/artists" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors block">
                                            Featured Creators
                                        </Link>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Collections &amp; Moods
                                        </span>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Creative Trends
                                        </span>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Comme Awards 2026
                                        </span>
                                    </li>
                                    <li>
                                        <span className="hover:text-foreground transition-colors cursor-pointer block">
                                            Platform Stats
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Legal & Copyright Bar */}
                        <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-4">
                                <Link to="/license" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors">License</Link>
                                <Link to="/privacy" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors">Privacy Policy</Link>
                                <Link to="/terms" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors">Terms of Service</Link>
                                <Link to="/terms" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors flex items-center gap-1">
                                    <Shield className="h-3 w-3 text-emerald-400" /> Escrow Security
                                </Link>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                <span>© {new Date().getFullYear()} Comme</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
