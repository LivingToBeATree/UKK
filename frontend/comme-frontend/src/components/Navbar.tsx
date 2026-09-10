import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Store, Layers, ShieldCheck, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { AnimatePresence, motion } from 'motion/react';

export const Navbar: React.FC = () => {
    const { openAuthModal } = useAuthModal();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        {
            label: 'Artwork Feed',
            path: '/explore',
            icon: Compass,
            isActive: location.pathname === '/explore' || location.pathname.startsWith('/posts/'),
        },
        {
            label: 'Commission Store',
            path: '/store',
            icon: Store,
            isActive: location.pathname === '/store' || location.pathname.startsWith('/store/'),
        },
        {
            label: 'Artists Directory',
            path: '/artists',
            icon: Layers,
            isActive: location.pathname.startsWith('/artists'),
        },
        {
            label: 'Escrow Protection',
            path: '/escrow-terms',
            icon: ShieldCheck,
            iconClass: 'text-emerald-400',
            isActive: location.pathname === '/escrow-terms',
        },
    ];

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-4">
                {/* Brand Logo - Official Wordmark */}
                <Link to="/" className="inline-flex items-center shrink-0">
                    <img
                        src="/Comme_Wordmark.svg"
                        alt="Comme"
                        className="h-7 sm:h-8 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
                    {navLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`transition-colors flex items-center gap-1.5 py-1 ${
                                    item.isActive
                                        ? 'text-foreground font-bold'
                                        : 'hover:text-foreground'
                                }`}
                            >
                                <Icon className={`h-3.5 w-3.5 ${item.iconClass || ''}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Action Controls: Log In Only */}
                <div className="hidden md:flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
                        }}
                        className="h-8 px-2.5 text-xs text-muted-foreground gap-2 rounded-xl hidden lg:flex border-border/80 hover:text-foreground"
                    >
                        <Search className="h-3.5 w-3.5" />
                        <span>Search...</span>
                        <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-muted rounded border border-border/70">
                            ⌘K
                        </kbd>
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => openAuthModal('generic')}
                        className="font-semibold text-xs h-9 px-4"
                    >
                        Log In
                    </Button>
                </div>

                {/* Mobile Hamburger Button */}
                <div className="flex md:hidden items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => openAuthModal('generic')}
                        className="font-semibold text-xs h-8 px-3"
                    >
                        Log In
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-xl overflow-hidden"
                    >
                        <div className="px-6 py-4 space-y-3">
                            {navLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-2.5 py-2 text-sm font-semibold transition-colors ${
                                            item.isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className={`h-4 w-4 ${item.iconClass || ''}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
