import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Menu,
    Layers,
    Sparkles,
    X,
    Shield,
    Store,
    Palette,
    Compass,
    FileText,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const InfoFlyout: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

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
                aria-label="Platform Information"
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
                            Explore &amp; Info
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
                        Explore &amp; Info
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Honest, Clean Floating Popover Card */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -12, scale: 0.96 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.96 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 380 }}
                        className="absolute left-[calc(100%+16px)] bottom-0 z-50 w-[420px] max-w-[90vw] bg-card/98 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl overflow-hidden p-5 select-none"
                    >
                        {/* Header with Close button */}
                        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border/60">
                            <div className="flex items-center gap-2">
                                <img
                                    src="/Comme_Emblem.svg"
                                    alt="Comme"
                                    className="h-5 w-5 object-contain"
                                />
                                <span className="font-bold text-xs tracking-wider uppercase text-foreground">
                                    COMME DIRECT
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                                aria-label="Close menu"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* 2 Focused, Real Link Columns */}
                        <div className="grid grid-cols-2 gap-6 text-left">
                            {/* Column 1: Marketplace & Art */}
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                                    <Store className="h-3.5 w-3.5 text-primary" />
                                    <span>Marketplace</span>
                                </div>
                                <ul className="space-y-1.5 text-xs text-muted-foreground">
                                    <li>
                                        <Link to="/explore" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors flex items-center gap-1.5 py-0.5">
                                            <Compass className="h-3 w-3 text-muted-foreground" />
                                            <span>Artwork Feed</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/store" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors flex items-center gap-1.5 py-0.5">
                                            <Store className="h-3 w-3 text-muted-foreground" />
                                            <span>Commission Store</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/artists" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors flex items-center gap-1.5 py-0.5">
                                            <Layers className="h-3 w-3 text-muted-foreground" />
                                            <span>Artists Directory</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/commissions" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors flex items-center gap-1.5 py-0.5">
                                            <FileText className="h-3 w-3 text-muted-foreground" />
                                            <span>My Orders</span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 2: Creator & Platform */}
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                                    <Palette className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Creator &amp; Escrow</span>
                                </div>
                                <ul className="space-y-1.5 text-xs text-muted-foreground">
                                    {user?.artist_profile ? (
                                        <li>
                                            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors flex items-center gap-1.5 py-0.5 font-medium text-emerald-400">
                                                <Palette className="h-3 w-3" />
                                                <span>Artist Studio</span>
                                            </Link>
                                        </li>
                                    ) : (
                                        <li>
                                            <Link to="/apply-artist" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors flex items-center gap-1.5 py-0.5 font-medium text-primary">
                                                <Sparkles className="h-3 w-3" />
                                                <span>Become an Artist</span>
                                            </Link>
                                        </li>
                                    )}
                                    <li>
                                        <Link to="/escrow-terms" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors flex items-center gap-1.5 py-0.5">
                                            <Shield className="h-3 w-3 text-emerald-400" />
                                            <span>Escrow Protection</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/license" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors flex items-center gap-1.5 py-0.5">
                                            <FileText className="h-3 w-3 text-muted-foreground" />
                                            <span>Commercial License</span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Legal & Copyright Bar */}
                        <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <Link to="/license" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors">License</Link>
                                <Link to="/privacy" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors">Privacy</Link>
                                <Link to="/terms" onClick={() => setIsOpen(false)} className="hover:text-foreground transition-colors">Terms</Link>
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
