import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter: React.FC = () => {
    return (
        <footer className="border-t border-border py-8 px-6 sm:px-8 bg-background w-full">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5">
                    <img
                        src="/Comme_Wordmark.svg"
                        alt="Comme"
                        className="h-5 w-auto object-contain opacity-80"
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
    );
};
