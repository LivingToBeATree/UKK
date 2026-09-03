import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Compass,
    FolderKanban,
    Plus,
    ShoppingBag,
    User as UserIcon,
    Menu,
    X,
    Bell,
    Layers,
    PenTool,
    Shield,
    LifeBuoy,
    Settings,
    LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { notificationService } from '@/services/notificationService';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

export const MobileHeader: React.FC<{ onOpenDrawer: () => void }> = ({ onOpenDrawer }) => {
    const { user, isAuthenticated } = useAuth();
    const { openAuthModal } = useAuthModal();
    const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            setUnreadCount(undefined);
            return;
        }

        let isMounted = true;
        const fetchUnread = async () => {
            try {
                const res = await notificationService.unreadCount();
                if (isMounted && res && res.unread_count > 0) {
                    setUnreadCount(res.unread_count);
                } else if (isMounted) {
                    setUnreadCount(undefined);
                }
            } catch {
                // Ignore
            }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 20000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [isAuthenticated, location.pathname]);

    return (
        <header className="sticky top-0 z-40 w-full md:hidden bg-card/90 backdrop-blur-xl border-b border-border/80 px-4 h-14 flex items-center justify-between transition-colors">
            {/* Left: Drawer Trigger + Brand Logo */}
            <div className="flex items-center gap-2.5">
                <button
                    type="button"
                    onClick={onOpenDrawer}
                    className="p-2 -ml-1.5 rounded-xl hover:bg-secondary text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Open Navigation Menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <Link to="/" className="flex items-center gap-2">
                    <img src="/Comme_Emblem.svg" alt="Comme" className="h-6 w-6 object-contain" />
                    <span className="font-extrabold text-sm tracking-tight text-foreground">
                        COMME
                    </span>
                </Link>
            </div>

            {/* Right: Notifications & Avatar / Sign In */}
            <div className="flex items-center gap-1.5">
                {isAuthenticated ? (
                    <>
                        <Link
                            to="/notifications"
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary relative transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                            {typeof unreadCount === 'number' && unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-card animate-pulse" />
                            )}
                        </Link>
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="p-0.5 rounded-full hover:ring-2 hover:ring-purple-500/50 transition-all cursor-pointer"
                            aria-label="My Profile"
                        >
                            <Avatar
                                size="sm"
                                src={user?.avatar_url}
                                fallback={user?.display_name || user?.username || '?'}
                                className="h-7 w-7"
                            />
                        </button>
                    </>
                ) : (
                    <Button
                        size="xs"
                        onClick={() => openAuthModal('generic')}
                        className="rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 px-3 shadow-xs"
                    >
                        Sign In
                    </Button>
                )}
            </div>
        </header>
    );
};

export const MobileBottomNav: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const { requireAuth } = useAuthModal();
    const location = useLocation();

    const isExplore = location.pathname === '/explore' || location.pathname.startsWith('/posts') && location.pathname !== '/posts/create';
    const isStore = location.pathname.startsWith('/store');
    const isCreate = location.pathname === '/posts/create';
    const isOrders = location.pathname.startsWith('/commissions') || location.pathname.startsWith('/orders');
    const isProfile = location.pathname === '/profile' || (user?.username && location.pathname === `/u/${user.username}`);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-2xl border-t border-border/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom select-none">
            {/* 1. Explore */}
            <Link
                to="/explore"
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                    isExplore ? 'text-purple-400 font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                <Compass className={`h-5 w-5 ${isExplore ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span className="text-[10px] mt-0.5">Explore</span>
            </Link>

            {/* 2. Store */}
            <Link
                to="/store"
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                    isStore ? 'text-purple-400 font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                <FolderKanban className={`h-5 w-5 ${isStore ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span className="text-[10px] mt-0.5">Store</span>
            </Link>

            {/* 3. Center Create Button (Glowing & Highlighted) */}
            <Link
                to="/posts/create"
                onClick={(e) => {
                    if (!isAuthenticated) {
                        e.preventDefault();
                        requireAuth('generic');
                    }
                }}
                className="flex flex-col items-center justify-center -mt-4"
                aria-label="Create Post"
            >
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isCreate
                        ? 'bg-purple-600 text-white ring-4 ring-purple-500/20'
                        : 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white hover:opacity-90'
                }`}>
                    <Plus className="h-6 w-6 stroke-[2.5px]" />
                </div>
                <span className="text-[10px] font-bold text-foreground mt-0.5">Create</span>
            </Link>

            {/* 4. Orders */}
            <Link
                to="/commissions"
                onClick={(e) => {
                    if (!isAuthenticated) {
                        e.preventDefault();
                        requireAuth('commission');
                    }
                }}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                    isOrders ? 'text-purple-400 font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                <ShoppingBag className={`h-5 w-5 ${isOrders ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span className="text-[10px] mt-0.5">Orders</span>
            </Link>

            {/* 5. Profile / Studio */}
            <Link
                to={isAuthenticated ? "/profile" : "/login"}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                    isProfile ? 'text-purple-400 font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                <UserIcon className={`h-5 w-5 ${isProfile ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span className="text-[10px] mt-0.5">{isAuthenticated ? 'Profile' : 'Sign In'}</span>
            </Link>
        </nav>
    );
};

export const MobileDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const { openAuthModal } = useAuthModal();
    const location = useLocation();
    const navigate = useNavigate();

    // Close on route change
    useEffect(() => {
        onClose();
    }, [location.pathname]);

    const handleLogout = async () => {
        onClose();
        try {
            await logout();
            toast.success('Signed out successfully');
            navigate('/login');
        } catch {
            toast.error('Failed to sign out');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-card border-r border-border p-5 flex flex-col justify-between md:hidden shadow-2xl overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-border/80">
                                <div className="flex items-center gap-2.5">
                                    <img src="/Comme_Emblem.svg" alt="Comme" className="h-7 w-7 object-contain" />
                                    <div>
                                        <span className="font-extrabold text-sm tracking-tight text-foreground block leading-tight">
                                            COMME
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-medium block">
                                            Art &amp; Commissions
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground"
                                    aria-label="Close Drawer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="space-y-1.5">
                                <Link
                                    to="/explore"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                                        location.pathname === '/explore' ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                                >
                                    <Compass className="h-4 w-4" /> Explore Feed
                                </Link>

                                <Link
                                    to="/store"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                                        location.pathname.startsWith('/store') ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                                >
                                    <FolderKanban className="h-4 w-4" /> Commission Store
                                </Link>

                                <Link
                                    to="/artists"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                                        location.pathname.startsWith('/artists') ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                                >
                                    <Layers className="h-4 w-4" /> Artists Directory
                                </Link>

                                <div className="my-2 border-t border-border/60" />

                                {user?.role === 'admin' ? (
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
                                    >
                                        <Shield className="h-4 w-4" /> Admin Panel
                                    </Link>
                                ) : user?.role === 'moderator' ? (
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
                                    >
                                        <Shield className="h-4 w-4" /> Moderator Panel
                                    </Link>
                                ) : (
                                    <Link
                                        to={user?.artist_profile ? "/dashboard" : "/apply-artist"}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors"
                                    >
                                        <PenTool className="h-4 w-4" /> {user?.artist_profile ? "Artist Studio" : "Become an Artist"}
                                    </Link>
                                )}

                                <Link
                                    to="/commissions"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                                        location.pathname.startsWith('/commissions') ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                                >
                                    <ShoppingBag className="h-4 w-4" /> My Orders
                                </Link>

                                {user?.role !== 'admin' && user?.role !== 'moderator' && (
                                    <Link
                                        to="/support"
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                    >
                                        <LifeBuoy className="h-4 w-4" /> Support &amp; Tickets
                                    </Link>
                                )}

                                <Link
                                    to="/settings"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                >
                                    <Settings className="h-4 w-4" /> Settings &amp; Security
                                </Link>
                            </nav>
                        </div>

                        {/* Footer: User profile info or Login button */}
                        <div className="pt-4 border-t border-border/80">
                            {isAuthenticated && user ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar size="sm" src={user.avatar_url} fallback={user.display_name || user.username} />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-xs text-foreground truncate">{user.display_name || user.username}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">@{user.username}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="xs"
                                        onClick={handleLogout}
                                        className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/20 text-xs py-2 rounded-xl"
                                    >
                                        <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => {
                                        onClose();
                                        openAuthModal('generic');
                                    }}
                                    className="w-full font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs h-9"
                                >
                                    Sign In / Register
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
