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
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useSidebar } from '@/hooks/useSidebar';
import { Avatar } from './ui/avatar';
import { InfoFlyout } from './InfoFlyout';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { toast } from './ui/sonner';
import { cn } from '@/lib/utils';

/* ─── Reusable Sidebar Navigation Item ─── */
interface NavItemProps {
    icon: React.ElementType;
    label: string;
    path: string;
    isActive: boolean;
    collapsed: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, path, isActive, collapsed, onClick }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="w-full relative">
            <Link
                to={path}
                onClick={onClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`w-full h-11 flex items-center rounded-xl pl-2 pr-2.5 gap-3 transition-colors duration-150 cursor-pointer focus:outline-none overflow-hidden ${
                    isActive
                        ? 'bg-secondary text-foreground font-semibold shadow-xs ring-1 ring-border/50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                aria-label={label}
            >
                {/* Icon Container */}
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                </div>

                {/* Animated Label */}
                <AnimatePresence initial={false}>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.15 }}
                            className="text-xs font-semibold truncate whitespace-nowrap text-left"
                        >
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </Link>

            {/* Animated Collapsed Floating Tooltip Pill */}
            <AnimatePresence>
                {collapsed && showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, x: -8, scale: 0.94 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -6, scale: 0.94 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 420 }}
                        className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none select-none"
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── Divider Line ─── */
const SidebarDivider = () => (
    <div className="w-full px-1 my-1">
        <div className="w-full h-px bg-border/60" />
    </div>
);

/* ─── Main Sidebar Rail Component ─── */
export const SidebarRail: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { requireAuth, openAuthModal } = useAuthModal();
    const { collapsed, toggleSidebar } = useSidebar();
    const [showLogoTooltip, setShowLogoTooltip] = useState(false);
    const [showUserTooltip, setShowUserTooltip] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    /** Intercept clicks on auth-gated sidebar links for guests */
    const guardNav = (intent: Parameters<typeof requireAuth>[0]) => (e: React.MouseEvent) => {
        if (!isAuthenticated) {
            e.preventDefault();
            requireAuth(intent);
        }
    };

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
            animate={{ width: collapsed ? 68 : 260 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed left-0 top-0 bottom-0 z-50 bg-card/95 backdrop-blur-xl border-r border-border/70 flex flex-col justify-between py-3 px-2.5 select-none overflow-visible"
        >
            {/* ── TOP GROUP: Logo & Primary Navigation Links ── */}
            <div className="flex flex-col items-center gap-1.5 w-full">
                {/* 1. Official Comme Logo Header (Clicking row toggles expand/collapse) */}
                <div className="w-full relative">
                    <button
                        onClick={toggleSidebar}
                        onMouseEnter={() => setShowLogoTooltip(true)}
                        onMouseLeave={() => setShowLogoTooltip(false)}
                        className="w-full h-11 flex items-center rounded-xl pl-2 pr-2.5 gap-3 hover:bg-secondary/60 transition-colors cursor-pointer focus:outline-none overflow-hidden"
                        aria-label="Toggle Sidebar"
                    >
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                            <img
                                src="/Comme_Emblem.svg"
                                alt="Comme"
                                className="h-6 w-6 object-contain transition-transform group-hover:scale-105"
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
                                        Art &amp; Commissions
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* Animated Logo Tooltip */}
                    <AnimatePresence>
                        {collapsed && showLogoTooltip && (
                            <motion.div
                                initial={{ opacity: 0, x: -8, scale: 0.94 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -6, scale: 0.94 }}
                                transition={{ type: 'spring', damping: 22, stiffness: 420 }}
                                className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none select-none"
                            >
                                Expand Sidebar
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Gallery / Feed */}
                <NavItem
                    icon={GalleryIcon}
                    label="Art Feed & Showcase"
                    path="/"
                    isActive={location.pathname === '/'}
                    collapsed={collapsed}
                />

                {/* 3. Studio / Creator Hub */}
                <NavItem
                    icon={PenTool}
                    label={user?.artist_profile ? 'Artist Studio' : 'Become an Artist'}
                    path={user?.artist_profile ? '/dashboard' : '/apply-artist'}
                    isActive={location.pathname.startsWith('/dashboard') || location.pathname === '/apply-artist'}
                    collapsed={collapsed}
                    onClick={guardNav('studio')}
                />

                <SidebarDivider />

                {/* 4. Explore */}
                <NavItem
                    icon={Compass}
                    label="Explore Artwork"
                    path="/explore"
                    isActive={location.pathname === '/explore'}
                    collapsed={collapsed}
                />

                {/* 5. Commission Store */}
                <NavItem
                    icon={FolderKanban}
                    label="Commission Store"
                    path="/store"
                    isActive={location.pathname === '/store'}
                    collapsed={collapsed}
                />

                {/* 6. Artists Directory */}
                <NavItem
                    icon={Layers}
                    label="Artists Directory"
                    path="/artists"
                    isActive={location.pathname === '/artists'}
                    collapsed={collapsed}
                />

                <SidebarDivider />

                {/* 7. My Commissions */}
                <NavItem
                    icon={Bookmark}
                    label="My Commissions"
                    path="/commissions"
                    isActive={location.pathname.startsWith('/commissions')}
                    collapsed={collapsed}
                    onClick={guardNav('commission')}
                />
            </div>

            {/* ── BOTTOM GROUP: Settings & User Profile ── */}
            <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t border-border/60">
                {/* 1. Settings */}
                <NavItem
                    icon={Settings}
                    label="Settings & Appearance"
                    path="/settings"
                    isActive={location.pathname === '/settings'}
                    collapsed={collapsed}
                    onClick={guardNav('generic')}
                />

                {/* 2. Platform Information & Company Menu (Replaces static footer) */}
                <InfoFlyout collapsed={collapsed} />

                {/* 3. User Profile / Sign In */}
                {isAuthenticated && user ? (
                    <div className="w-full relative block">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    onMouseEnter={() => setShowUserTooltip(true)}
                                    onMouseLeave={() => setShowUserTooltip(false)}
                                    className="w-full h-11 flex items-center rounded-xl pl-2 pr-2.5 gap-3 hover:bg-secondary/60 transition-colors focus:outline-none cursor-pointer overflow-hidden text-left"
                                    aria-label="User Menu"
                                >
                                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
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

                            {/* Animated User Avatar Tooltip */}
                            <AnimatePresence>
                                {collapsed && showUserTooltip && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -8, scale: 0.94 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -6, scale: 0.94 }}
                                        transition={{ type: 'spring', damping: 22, stiffness: 420 }}
                                        className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none select-none"
                                    >
                                        {user.display_name || user.username}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <DropdownMenuContent
                                side={collapsed ? 'right' : 'top'}
                                align={collapsed ? 'end' : 'start'}
                                className={cn(
                                    'w-56 bg-card/98 backdrop-blur-2xl border border-border shadow-2xl rounded-xl z-50',
                                    collapsed ? 'ml-3' : 'mb-2 ml-1'
                                )}
                            >
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
                                    <span>Settings &amp; Appearance</span>
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
                    <NavItem
                        icon={UserIcon}
                        label="Sign In / Register"
                        path="/"
                        isActive={false}
                        collapsed={collapsed}
                        onClick={(e) => {
                            e.preventDefault();
                            openAuthModal('generic');
                        }}
                    />
                )}
            </div>
        </motion.aside>
    );
};
