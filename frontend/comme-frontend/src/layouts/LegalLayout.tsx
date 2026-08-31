import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

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
        <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground py-8 px-4 sm:px-8 lg:px-12 selection:bg-primary/20">
            <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                {/* ── Left Column: Sticky Legal Sub-Nav ── */}
                <aside className="md:col-span-3 lg:col-span-3">
                    <div className="sticky top-20 space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" /> Legal & Policies
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Governance, privacy, and creator rights
                            </p>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex flex-col space-y-1">
                            {LEGAL_NAV_ITEMS.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`text-xs sm:text-sm font-medium transition-all py-2 px-3 rounded-xl flex items-center justify-between ${
                                            isActive
                                                ? 'bg-primary/10 text-primary font-bold shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="pt-6 border-t border-border/50 text-xs text-muted-foreground space-y-1">
                            <p>© {new Date().getFullYear()} Comme Platform Inc.</p>
                            <p>All rights reserved.</p>
                        </div>
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
