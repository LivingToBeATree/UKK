import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

interface LegalLayoutProps {
    children: React.ReactNode;
}

const LEGAL_NAV_ITEMS = [
    { label: 'License', path: '/license' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' },
    { label: 'API Terms', path: '/api-terms' },
    { label: 'Escrow & Security', path: '/escrow-terms' },
];

export const LegalLayout: React.FC<LegalLayoutProps> = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background text-foreground py-16 px-6 sm:px-12 lg:px-16 selection:bg-primary/20">
            <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
                {/* ── Left Column: Unsplash-style Brand & Sticky Legal Nav ── */}
                <aside className="md:col-span-3 lg:col-span-3 space-y-8">
                    {/* Brand Header */}
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <img
                            src="/Comme_Emblem.svg"
                            alt="Comme"
                            className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
                        />
                        <span className="text-2xl font-black tracking-tight text-foreground">
                            Comme
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="flex flex-col space-y-3 pt-2">
                        {LEGAL_NAV_ITEMS.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`text-sm transition-colors py-1 ${
                                        isActive
                                            ? 'font-bold text-foreground underline underline-offset-4 decoration-primary decoration-2'
                                            : 'text-muted-foreground hover:text-foreground hover:underline underline-offset-4'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-8 border-t border-border/50 text-xs text-muted-foreground space-y-1">
                        <p>© {new Date().getFullYear()} Comme Platform Inc.</p>
                        <p>All rights reserved.</p>
                    </div>
                </aside>

                {/* ── Center & Right Area: Content ── */}
                <main className="md:col-span-9 lg:col-span-9">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};
