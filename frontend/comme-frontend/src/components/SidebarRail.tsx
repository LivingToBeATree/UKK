import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
import { useSidebar } from '@/hooks/useSidebar';
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
    isCollapsed: boolean;
    onClick?: () => void;
}

const RailItem: React.FC<RailItemProps> = ({
    icon: Icon,
    label,
    path,
    isActive,
    isCollapsed,
    onClick,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const buttonNode = (
        <button
            onClick={onClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`w-full h-11 flex items-center rounded-xl px-2 gap-3 transition-colors duration-150 cursor-pointer focus:outline-none overflow-hidden ${
                isActive
                    ? 'bg-secondary text-foreground font-semibold shadow-xs ring-1 ring-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
            aria-label={label}
        >
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <Icon className={`h-5 w-5 transition-transform ${isActive ? 'text-primary' : ''}`} />
            </div>
            
            {/* Animated Label */}
            <AnimatePresence initial={false}>
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs font-semibold truncate tracking-tight text-foreground/90 whitespace-nowrap text-left"
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Hover Tooltip (Only when collapsed) */}
            {isCollapsed && showTooltip && (
                <div className="absolute left-16 z-50 px-2.5 py-1 text-xs font-semibold text-foreground bg-card border border-border/80 rounded-lg shadow-lg whitespace-nowrap pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                    {label}
                </div>
            )}
        </button>
    );

    if (path) {
        return (
            <Link to={path} className="w-full focus:outline-none block">
                {buttonNode}
            </Link>
        );
    }

    return <div className="w-full block">{buttonNode}</div>;
};

export const SidebarRail: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { collapsed, toggleSidebar } = useSidebar();
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
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 64 : 240 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed left-0 top-0 bottom-0 z-50 bg-card/95 backdrop-blur-xl border-r border-border/70 flex flex-col justify-between py-3 px-2.5 select-none overflow-hidden"
        >
            {/* TOP GROUP: Logo & Navigation Links */}
            <div className="flex flex-col items-center gap-1.5 w-full">
                {/* 1. Official Comme Logo Header (Clicking toggles expand/collapse) */}
                <button
                    onClick={toggleSidebar}
                    className="w-full h-11 flex items-center rounded-xl px-2 gap-3 hover:bg-secondary/60 transition-colors cursor-pointer focus:outline-none overflow-hidden"
                    title={collapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
                    aria-label="Toggle Sidebar"
                >
                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                        <img
                            src="/Comme_Emblem.svg"
                            alt="Comme"
                            className="h-7 w-7 object-contain transition-transform group-hover:scale-105"
                        />
                    </div>
                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -6 }}
                                transition={{ duration: 0.15 }}
                                className="flex flex-col text-left whitespace-nowrap overflow-hidden"
                            >
                                <span className="font-extrabold text-sm tracking-tight text-foreground leading-tight">
                                    COMME
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium leading-none">
                                    Art & Commissions
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                {/* 2. Gallery / Feed */}
                <RailItem
                    icon={GalleryIcon}
                    label="Art Feed & Showcase"
                    path="/"
                    isActive={location.pathname === '/'}
                    isCollapsed={collapsed}
                />

                {/* 3. Studio / Creator Hub */}
                <RailItem
                    icon={PenTool}
                    label={user?.artist_profile ? 'Artist Studio' : 'Become an Artist'}
                    path={user?.artist_profile ? '/dashboard' : '/apply-artist'}
                    isActive={location.pathname.startsWith('/dashboard') || location.pathname === '/apply-artist'}
                    isCollapsed={collapsed}
                />

                {/* Divider */}
                <div className="w-full px-1 my-1">
                    <div className="w-full h-[1px] bg-border/80" />
                </div>

                {/* 4. Explore */}
                <RailItem
                    icon={Compass}
                    label="Explore Artwork"
                    path="/explore"
                    isActive={location.pathname === '/explore'}
                    isCollapsed={collapsed}
                />

                {/* 5. Store / Commission Services */}
                <RailItem
                    icon={FolderKanban}
                    label="Commission Store"
                    path="/store"
                    isActive={location.pathname === '/store'}
                    isCollapsed={collapsed}
                />

                {/* 6. Artists Directory */}
                <RailItem
                    icon={Layers}
                    label="Artists Directory"
                    path="/artists"
                    isActive={location.pathname === '/artists'}
                    isCollapsed={collapsed}
                />

                {/* Divider */}
                <div className="w-full px-1 my-1">
                    <div className="w-full h-[1px] bg-border/80" />
                </div>

                {/* 7. My Commissions / Orders */}
                <RailItem
                    icon={Bookmark}
                    label="My Commissions"
                    path="/commissions"
                    isActive={location.pathname.startsWith('/commissions')}
                    isCollapsed={collapsed}
                />
            </div>

            {/* BOTTOM GROUP: Settings & User Profile Avatar (100% Perfectly Aligned) */}
            <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t border-border/60">
                {/* 1. Settings */}
                <RailItem
                    icon={Settings}
                    label="Settings & Appearance"
                    path="/settings"
                    isActive={location.pathname === '/settings'}
                    isCollapsed={collapsed}
                />

                {/* 2. User Avatar & Menu (Full width, matching avatar alignment) */}
                {isAuthenticated && user ? (
                    <div className="w-full block">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="w-full h-11 flex items-center rounded-xl px-2 gap-3 hover:bg-secondary/60 transition-colors focus:outline-none cursor-pointer overflow-hidden text-left"
                                    title={user.display_name || user.username}
                                >
                                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                                        <Avatar
                                            size="sm"
                                            fallback={user.display_name || user.username}
                                            src={user.avatar_url}
                                            isOnline={true}
                                        />
                                    </div>
                                    <AnimatePresence initial={false}>
                                        {!collapsed && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -6 }}
                                                transition={{ duration: 0.15 }}
                                                className="flex flex-col min-w-0 flex-1 text-left overflow-hidden whitespace-nowrap"
                                            >
                                                <p className="font-bold text-xs truncate text-foreground leading-tight">
                                                    {user.display_name || user.username}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                    @{user.username}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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

                                {import.meta.env.DEV && (
                                    <DropdownMenuItem onClick={() => navigate('/dev')}>
                                        <Terminal className="h-4 w-4 mr-2 text-purple-400" />
                                        <span>Developer Console</span>
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={() => navigate('/settings')}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    <span>Settings & Appearance</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem destructive onClick={handleLogout}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ) : (
                    <RailItem
                        icon={UserIcon}
                        label="Sign In / Register"
                        path="/login"
                        isActive={location.pathname === '/login'}
                        isCollapsed={collapsed}
                    />
                )}
            </div>
        </motion.aside>
    );
};
