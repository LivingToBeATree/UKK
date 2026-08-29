import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full border-t border-border/70 bg-card/40 backdrop-blur-sm mt-auto">
            <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-16">
                    {/* Brand column */}
                    <div className="md:col-span-2 space-y-4">
                        <Link to="/" className="inline-block">
                            <img
                                src="/Comme_Wordmark.svg"
                                alt="Comme"
                                className="h-7 sm:h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                            />
                        </Link>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
                            The direct commission platform for digital artists and collectors. Transparent milestones, escrow-protected transactions, and creator-first tooling.
                        </p>
                    </div>

                    {/* Column 1: Explore */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Explore</h4>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                            <li>
                                <Link to="/explore" className="hover:text-foreground transition-colors">
                                    Explore Feed
                                </Link>
                            </li>
                            <li>
                                <Link to="/store" className="hover:text-foreground transition-colors">
                                    Commission Store
                                </Link>
                            </li>
                            <li>
                                <Link to="/artists" className="hover:text-foreground transition-colors">
                                    Artists Directory
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: Creators */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Creators</h4>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                            <li>
                                <Link to="/apply-artist" className="hover:text-foreground transition-colors">
                                    Apply as Artist
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="hover:text-foreground transition-colors">
                                    Artist Studio
                                </Link>
                            </li>
                            <li>
                                <Link to="/settings" className="hover:text-foreground transition-colors">
                                    Creator Settings
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Platform */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Platform</h4>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                            <li>
                                <span className="text-muted-foreground/80 hover:text-foreground cursor-pointer transition-colors">
                                    Escrow Protection
                                </span>
                            </li>
                            <li>
                                <span className="text-muted-foreground/80 hover:text-foreground cursor-pointer transition-colors">
                                    Terms of Service
                                </span>
                            </li>
                            <li>
                                <span className="text-muted-foreground/80 hover:text-foreground cursor-pointer transition-colors">
                                    Privacy Policy
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Comme. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" /> System Online
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
