import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    PenTool,
    Compass,
    FolderKanban,
    Layers,
    ShoppingBag,
    Bell,
    User as UserIcon,
    Settings,
    LogOut,
    LifeBuoy,
    Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useSidebar } from '@/hooks/useSidebar';
import { notificationService } from '@/services/notificationService';
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

/* ─── Reusable Sidebar Navigation Item ─── */
interface NavItemProps {
    icon: React.ElementType;
    label: string;
    path: string;
    isActive: boolean;
    collapsed: boolean;
    badge?: number;
    onClick?: (e: React.MouseEvent) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, path, isActive, collapsed, badge, onClick }) => {
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
                <div className="w-6 h-6 flex items-center justify-center shrink-0 relative">
                    <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                    {/* Collapsed dot badge */}
                    {collapsed && typeof badge === 'number' && badge > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card animate-pulse" />
                    )}
                </div>

                {/* Animated Label + Badge */}
                <AnimatePresence initial={false}>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center justify-between flex-1 min-w-0 pr-1"
                        >
                            <span className="text-xs font-semibold truncate whitespace-nowrap text-left">
                                {label}
                            </span>
                            {typeof badge === 'number' && badge > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/30 shrink-0">
                                    {badge > 99 ? '99+' : badge}
                                </span>
                            )}
                        </motion.div>
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
                        className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none select-none flex items-center gap-1.5"
                    >
                        <span>{label}</span>
                        {typeof badge === 'number' && badge > 0 && (
                            <span className="px-1 py-0.2 rounded-full text-[10px] font-mono font-bold bg-primary text-primary-foreground">
                                {badge}
                            </span>
                        )}
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
    const [unreadNotifications, setUnreadNotifications] = useState<number | undefined>(undefined);
    const location = useLocation();
    const navigate = useNavigate();

    // Fetch unread notification count
    useEffect(() => {
        if (!isAuthenticated) {
            setUnreadNotifications(undefined);
            return;
        }

        let isMounted = true;
        const fetchUnread = async () => {
            try {
                const res = await notificationService.unreadCount();
                if (isMounted) {
                    if (res && res.unread_count > 0) {
                        setUnreadNotifications(res.unread_count);
                    } else {
                        setUnreadNotifications(undefined);
                    }
                }
            } catch {
                // Ignore silent errors
            }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 20000); // Check every 20s
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [isAuthenticated, location.pathname]);

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

                {/* 1. Explore */}
                <NavItem
                    icon={Compass}
                    label="Explore"
                    path="/explore"
                    isActive={location.pathname === '/explore' || location.pathname.startsWith('/posts')}
                    collapsed={collapsed}
                />

                {/* 2. Commission Store */}
                <NavItem
                    icon={FolderKanban}
                    label="Commission Store"
                    path="/store"
                    isActive={location.pathname.startsWith('/store')}
                    collapsed={collapsed}
                />

                {/* 3. Artists Directory */}
                <NavItem
                    icon={Layers}
                    label="Artists Directory"
                    path="/artists"
                    isActive={location.pathname.startsWith('/artists')}
                    collapsed={collapsed}
                />

                <SidebarDivider />

                {/* 4. Studio / Admin / Moderator / Creator Hub */}
                {user?.role === 'admin' ? (
                    <NavItem
                        icon={Shield}
                        label="Admin Panel"
                        path="/admin"
                        isActive={location.pathname.startsWith('/admin')}
                        collapsed={collapsed}
                    />
                ) : user?.role === 'moderator' ? (
                    <NavItem
                        icon={Shield}
                        label="Moderator Panel"
                        path="/admin"
                        isActive={location.pathname.startsWith('/admin')}
                        collapsed={collapsed}
                    />
                ) : (
                    <NavItem
                        icon={PenTool}
                        label={user?.artist_profile ? 'Artist Studio' : 'Become an Artist'}
                        path={user?.artist_profile ? '/dashboard' : '/apply-artist'}
                        isActive={location.pathname.startsWith('/dashboard') || location.pathname === '/apply-artist'}
                        collapsed={collapsed}
                        onClick={guardNav('studio')}
                    />
                )}

                {/* 5. My Orders */}
                <NavItem
                    icon={ShoppingBag}
                    label="My Orders"
                    path="/commissions"
                    isActive={location.pathname.startsWith('/commissions') || location.pathname.startsWith('/orders')}
                    collapsed={collapsed}
                    onClick={guardNav('commission')}
                />

                {/* 6. Notifications */}
                <NavItem
                    icon={Bell}
                    label="Notifications"
                    path="/notifications"
                    isActive={location.pathname === '/notifications'}
                    collapsed={collapsed}
                    badge={unreadNotifications}
                    onClick={guardNav('generic')}
                />

                {/* 7. Support & Tickets (Only for regular users & artists; staff have tickets in their workbench) */}
                {user?.role !== 'admin' && user?.role !== 'moderator' && (
                    <NavItem
                        icon={LifeBuoy}
                        label="Support & Tickets"
                        path="/support"
                        isActive={location.pathname === '/support' || location.pathname.startsWith('/tickets')}
                        collapsed={collapsed}
                        onClick={guardNav('generic')}
                    />
                )}
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
                                                className="flex flex-col min-w-0 flex-1 overflow-hidden"
                                            >
                                                <span className="font-bold text-xs truncate text-foreground leading-tight">
                                                    {user.display_name || user.username}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                                                    @{user.username}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent side="right" align="end" className="w-56 ml-2 rounded-2xl p-1.5 shadow-xl border-border/80">
                                <div className="px-3 py-2 border-b border-border/50 mb-1">
                                    <p className="font-bold text-xs text-foreground truncate">{user.display_name || user.username}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl text-xs py-2 cursor-pointer">
                                    <UserIcon className="mr-2 h-4 w-4 text-primary" />
                                    <span>View Public Profile</span>
                                </DropdownMenuItem>
                                {(user.role === 'admin' || user.role === 'moderator') && (
                                    <DropdownMenuItem
                                        onClick={() => navigate('/admin')}
                                        className="rounded-xl text-xs py-2 cursor-pointer text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                    >
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>{user.role === 'admin' ? 'Admin Workbench' : 'Moderator Workbench'}</span>
                                    </DropdownMenuItem>
                                )}
                                {user.artist_profile && (
                                    <DropdownMenuItem
                                        onClick={() => navigate('/dashboard')}
                                        className="rounded-xl text-xs py-2 cursor-pointer text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                    >
                                        <PenTool className="mr-2 h-4 w-4" />
                                        <span>Artist Studio</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => navigate('/notifications')} className="rounded-xl text-xs py-2 cursor-pointer">
                                    <Bell className="mr-2 h-4 w-4 text-primary" />
                                    <span>Notifications</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-xl text-xs py-2 cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Account Settings</span>
                                </DropdownMenuItem>
                                {user.role !== 'admin' && user.role !== 'moderator' && (
                                    <DropdownMenuItem onClick={() => navigate('/support')} className="rounded-xl text-xs py-2 cursor-pointer">
                                        <LifeBuoy className="mr-2 h-4 w-4 text-purple-400" />
                                        <span>Support & Tickets</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="rounded-xl text-xs py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Animated User Tooltip */}
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
                    </div>
                ) : (
                    <div className="w-full relative">
                        <button
                            onClick={() => openAuthModal('generic')}
                            className="w-full h-11 flex items-center rounded-xl pl-2 pr-2.5 gap-3 hover:bg-primary/10 text-primary transition-colors cursor-pointer focus:outline-none overflow-hidden"
                            aria-label="Sign In"
                        >
                            <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <AnimatePresence initial={false}>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="text-xs font-bold truncate whitespace-nowrap text-left"
                                    >
                                        Sign In
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                )}
            </div>
        </motion.aside>
    );
};
