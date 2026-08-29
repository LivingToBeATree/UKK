import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Sparkles,
    Bell,
    Palette,
    Compass,
    Layers,
    User as UserIcon,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from './mode-toggle';
import { ColorThemeToggle } from './color-theme-toggle';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { toast } from './ui/sonner';

export const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Signed out successfully');
            navigate('/login');
        } catch {
            toast.error('Failed to sign out');
        }
    };

    const navLinks = [
        { label: 'Explore', path: '/', icon: Compass },
        { label: 'Artists', path: '/artists', icon: Palette },
        { label: 'Commissions', path: '/commissions', icon: Layers },
        ...(import.meta.env.DEV ? [{ label: 'Sandbox', path: '/dev/sandbox', icon: Sparkles }] : []),
    ];

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                {/* 1. Official Comme Wordmark Logo */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 group py-1">
                        <img
                            src="/Comme_Wordmark.svg"
                            alt="Comme"
                            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                        isActive
                                            ? 'bg-secondary text-foreground'
                                            : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* 2. Actions (Color Theme Toggle + Mode Toggle + Auth Profile / Bell) */}
                <div className="flex items-center gap-2">
                    {/* Color Theme Selector (Purple, Teal, Orange) */}
                    <ColorThemeToggle />

                    {/* Dark/Light/System Mode Toggle */}
                    <ModeToggle />

                    {isAuthenticated && user && (
                        <>
                            {/* Notification Bell */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="relative"
                                onClick={() => navigate('/notifications')}
                                aria-label="Notifications"
                            >
                                <Bell className="h-4 w-4 text-muted-foreground" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            </Button>

                            {/* User Avatar Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all focus:outline-none cursor-pointer">
                                        <Avatar
                                            size="sm"
                                            fallback={user.display_name || user.username}
                                            src={user.avatar_url}
                                            isOnline={true}
                                        />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="px-3 py-2 border-b border-border mb-1">
                                        <p className="font-bold text-xs truncate text-foreground">
                                            {user.display_name || user.username}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                            @{user.username}
                                        </p>
                                    </div>

                                    <DropdownMenuItem onClick={() => navigate(`/@${user.username}`)}>
                                        <UserIcon className="h-4 w-4 mr-2 text-primary" />
                                        <span>My Profile</span>
                                    </DropdownMenuItem>

                                    {user.artist_profile ? (
                                        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                                            <Palette className="h-4 w-4 mr-2 text-emerald-400" />
                                            <span>Artist Studio</span>
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem onClick={() => navigate('/apply-artist')}>
                                            <Sparkles className="h-4 w-4 mr-2 text-amber-400" />
                                            <span>Become an Artist</span>
                                        </DropdownMenuItem>
                                    )}

                                    {(user.role === 'admin' || user.role === 'moderator') && (
                                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                                            <Shield className="h-4 w-4 mr-2 text-amber-400" />
                                            <span>Staff Admin Panel</span>
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuItem onClick={() => navigate('/commissions')}>
                                        <Layers className="h-4 w-4 mr-2 text-blue-400" />
                                        <span>My Commission Orders</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                                        <Settings className="h-4 w-4 mr-2" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem destructive onClick={handleLogout}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        <span>Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}

                    {/* Mobile Menu Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Nav Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3"
                    >
                        <nav className="flex flex-col space-y-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                                            isActive
                                                ? 'bg-secondary text-foreground'
                                                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
