import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Image as GalleryIcon,
    PenTool,
    Compass,
    FolderKanban,
    Layers,
    Bookmark,
    User as UserIcon,
    Settings,
    LogOut,
    Shield,
    Sparkles,
    Terminal,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from './mode-toggle';
import { ColorThemeToggle } from './color-theme-toggle';
import { Avatar } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { toast } from './ui/sonner';

interface RailItemProps {
    icon: React.ElementType;
    label: string;
    path?: string;
    isActive?: boolean;
    onClick?: () => void;
}

const RailItem: React.FC<RailItemProps> = ({
    icon: Icon,
    label,
    path,
    isActive,
    onClick,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const buttonElement = (
        <button
            onClick={onClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all duration-150 group cursor-pointer focus:outline-none ${
                isActive
                    ? 'bg-secondary text-foreground font-semibold shadow-xs ring-1 ring-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
            aria-label={label}
        >
            <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
            
            {/* Hover Tooltip */}
            {showTooltip && (
                <div className="absolute left-14 z-50 px-2.5 py-1 text-xs font-semibold text-foreground bg-card border border-border/80 rounded-lg shadow-lg whitespace-nowrap pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                    {label}
                </div>
            )}
        </button>
    );

    if (path) {
        return (
            <Link to={path} className="focus:outline-none">
                {buttonElement}
            </Link>
        );
    }

    return buttonElement;
};

export const SidebarRail: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
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

    return (
        <aside className="fixed left-0 top-0 bottom-0 z-50 w-16 bg-card/85 backdrop-blur-xl border-r border-border/70 flex flex-col items-center justify-between py-3.5 select-none transition-colors duration-200">
            {/* TOP GROUP: Logo & Primary Rail Navigation */}
            <div className="flex flex-col items-center gap-2 w-full">
                {/* 1. App Emblem Logo */}
                <Link to="/" className="mb-2 p-1.5 rounded-xl hover:bg-secondary/60 transition-transform hover:scale-105" title="Comme Home">
                    <img src="/favicon.svg" alt="Comme" className="h-7 w-7 object-contain" />
                </Link>

                {/* 2. Gallery / Feed */}
                <RailItem
                    icon={GalleryIcon}
                    label="Art Feed & Showcase"
                    path="/"
                    isActive={location.pathname === '/'}
                />

                {/* 3. Studio / Creator Hub */}
                <RailItem
                    icon={PenTool}
                    label={user?.artist_profile ? 'Artist Studio' : 'Become an Artist'}
                    path={user?.artist_profile ? '/dashboard' : '/apply-artist'}
                    isActive={location.pathname.startsWith('/dashboard') || location.pathname === '/apply-artist'}
                />

                {/* Divider */}
                <div className="w-6 h-[1px] bg-border/80 my-1" />

                {/* 4. Explore */}
                <RailItem
                    icon={Compass}
                    label="Explore Artwork"
                    path="/explore"
                    isActive={location.pathname === '/explore'}
                />

                {/* 5. Store / Commission Services */}
                <RailItem
                    icon={FolderKanban}
                    label="Commission Store"
                    path="/store"
                    isActive={location.pathname === '/store'}
                />

                {/* 6. Artists Directory */}
                <RailItem
                    icon={Layers}
                    label="Artists Directory"
                    path="/artists"
                    isActive={location.pathname === '/artists'}
                />

                {/* Divider */}
                <div className="w-6 h-[1px] bg-border/80 my-1" />

                {/* 7. My Commissions / Orders */}
                <RailItem
                    icon={Bookmark}
                    label="My Commissions"
                    path="/commissions"
                    isActive={location.pathname.startsWith('/commissions')}
                />
            </div>

            {/* BOTTOM GROUP: User Avatar, Themes & Settings */}
            <div className="flex flex-col items-center gap-2 w-full">
                {/* 1. Accent Color Theme Toggle */}
                <ColorThemeToggle />

                {/* 2. Dark/Light Mode Toggle */}
                <ModeToggle />

                {/* 3. User Avatar & Menu Dropdown */}
                {isAuthenticated && user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all focus:outline-none cursor-pointer"
                                title={user.display_name || user.username}
                            >
                                <Avatar
                                    size="sm"
                                    fallback={user.display_name || user.username}
                                    src={user.avatar_url}
                                    isOnline={true}
                                />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-card border border-border shadow-xl rounded-xl ml-2">
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
                                    <PenTool className="h-4 w-4 mr-2 text-emerald-400" />
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
                                <Bookmark className="h-4 w-4 mr-2 text-blue-400" />
                                <span>My Commissions</span>
                            </DropdownMenuItem>

                            {import.meta.env.DEV && (
                                <DropdownMenuItem onClick={() => navigate('/dev')}>
                                    <Terminal className="h-4 w-4 mr-2 text-purple-400" />
                                    <span>Developer Console</span>
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
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="flex items-center justify-center h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all cursor-pointer focus:outline-none"
                                title="Account & Sign In"
                            >
                                <UserIcon className="h-5 w-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 bg-card border border-border shadow-xl rounded-xl ml-2">
                            <div className="px-3 py-1.5 text-xs font-bold text-muted-foreground border-b border-border/80">
                                Guest Visitor
                            </div>
                            <DropdownMenuItem onClick={() => navigate('/login')}>
                                Sign In
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/register')}>
                                Create Account
                            </DropdownMenuItem>
                            {import.meta.env.DEV && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/dev')}>
                                        <Terminal className="h-3.5 w-3.5 mr-2 text-purple-400" />
                                        <span>Dev Console</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </aside>
    );
};
