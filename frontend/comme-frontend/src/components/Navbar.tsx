import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Bell,
    Palette,
    User as UserIcon,
    Settings,
    LogOut,
    Shield,
    Layers,
    Terminal,
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

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
            <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-6 sm:px-12">
                {/* 1. Official Comme Wordmark Logo */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 group py-1">
                        <img
                            src="/Comme_Wordmark.svg"
                            alt="Comme"
                            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                    </Link>
                </div>

                {/* 2. Actions (Theme toggles + Auth Profile / Bell / Login) */}
                <div className="flex items-center gap-2.5">
                    {/* Color Theme Selector (Purple, Teal, Orange) */}
                    <ColorThemeToggle />

                    {/* Dark/Light/System Mode Toggle */}
                    <ModeToggle />

                    {isAuthenticated && user ? (
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
                                        <span>My Commissions</span>
                                    </DropdownMenuItem>

                                    {(import.meta.env.DEV || user.role === 'admin') && (
                                        <DropdownMenuItem onClick={() => navigate('/dev/sandbox')}>
                                            <Terminal className="h-4 w-4 mr-2 text-purple-400" />
                                            <span>Dev Sandbox</span>
                                        </DropdownMenuItem>
                                    )}

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
                    ) : (
                        <div className="flex items-center gap-2 pl-1">
                            <Link to="/login">
                                <Button variant="ghost" size="sm" className="text-xs">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm" className="text-xs">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
