import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search,
    Sparkles,
    Palette,
    Compass,
    Briefcase,
    Settings,
    Bell,
    Users,
    Shield,
    FileCheck,
    Zap,
    Terminal,
    Moon,
    Sun,
    LogOut,
    ArrowRight,
    ExternalLink,
    History,
    RotateCcw,
    Clock,
    ShoppingBag,
    Heart,
    Plus,
    User as UserIcon,
    LifeBuoy,
    X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import {
    getRecentSpotlightItems,
    saveRecentSpotlightItem,
    removeRecentSpotlightItem,
    clearRecentSpotlightItems,
    formatRelativeTime,
} from '@/utils/spotlightHistory';

export interface CommandItem {
    id: string;
    title: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    category: 'Recent' | 'Navigation' | 'Admin & Observability' | 'Actions';
    action: () => void;
    shortcut?: string;
    external?: boolean;
    isRecent?: boolean;
    isJumpBack?: boolean;
    timeAgo?: string;
    onRemove?: () => void;
}

export const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
};

export const toggleCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('toggle-command-palette'));
};

const getRouteMeta = (pathname: string): { title: string; description?: string; iconKey: string } | null => {
    if (pathname === '/' || pathname === '/explore') {
        return { title: 'Explore Marketplace', description: 'Browse artwork and commission services', iconKey: 'Compass' };
    }
    if (pathname === '/store') {
        return { title: 'Commission Store', description: 'Explore artist commission packages', iconKey: 'Store' };
    }
    if (pathname.startsWith('/store/')) {
        return { title: 'Commission Service', description: 'View service details and order form', iconKey: 'Store' };
    }
    if (pathname === '/artists') {
        return { title: 'Artists Directory', description: 'Discover verified artists and studios', iconKey: 'Palette' };
    }
    if (pathname === '/commissions') {
        return { title: 'My Commissions', description: 'Active orders and milestone approvals', iconKey: 'Briefcase' };
    }
    if (pathname.startsWith('/commissions/')) {
        return { title: 'Commission Order Details', description: 'Track milestone progress and deliverables', iconKey: 'Briefcase' };
    }
    if (pathname === '/posts/create') {
        return { title: 'Create Post', description: 'Upload artwork or announce commissions', iconKey: 'Plus' };
    }
    if (pathname.startsWith('/posts/')) {
        return { title: 'Artwork Post', description: 'View artwork, likes, and community comments', iconKey: 'Compass' };
    }
    if (pathname === '/notifications') {
        return { title: 'Notifications', description: 'View recent activity, order alerts, and messages', iconKey: 'Bell' };
    }
    if (pathname === '/settings') {
        return { title: 'Account Settings', description: 'Profile, credentials, and 2FA security', iconKey: 'Settings' };
    }
    if (pathname === '/profile') {
        return { title: 'My Profile', description: 'Manage your portfolio and public showcases', iconKey: 'User' };
    }
    if (pathname === '/support') {
        return { title: 'Help & Support', description: 'Submit or view support tickets', iconKey: 'LifeBuoy' };
    }
    if (pathname === '/apply-artist') {
        return { title: 'Apply as Artist', description: 'Submit creator application and portfolio', iconKey: 'Sparkles' };
    }
    if (pathname.startsWith('/dashboard')) {
        return { title: 'Artist Studio Workbench', description: 'Manage services, slots, and artist earnings', iconKey: 'Sparkles' };
    }
    if (pathname.startsWith('/admin')) {
        return { title: 'Admin Operations', description: 'Platform statistics, user management, and queues', iconKey: 'Shield' };
    }
    return null;
};

const getIconFor = (iconKey?: string): React.ComponentType<{ className?: string }> => {
    switch (iconKey) {
        case 'Compass': return Compass;
        case 'Store': return ShoppingBag;
        case 'Palette': return Palette;
        case 'Briefcase': return Briefcase;
        case 'Bell': return Bell;
        case 'Settings': return Settings;
        case 'User': return UserIcon;
        case 'LifeBuoy': return LifeBuoy;
        case 'Sparkles': return Sparkles;
        case 'Shield': return Shield;
        case 'Users': return Users;
        case 'FileCheck': return FileCheck;
        case 'Zap': return Zap;
        case 'Terminal': return Terminal;
        case 'Sun': return Sun;
        case 'Moon': return Moon;
        case 'Plus': return Plus;
        case 'Heart': return Heart;
        default: return Clock;
    }
};

export const CommandPalette: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentsVersion, setRecentsVersion] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();
    const { theme, setTheme } = useTheme();

    // Auto-record routes user navigates to
    useEffect(() => {
        const meta = getRouteMeta(location.pathname);
        if (meta) {
            saveRecentSpotlightItem({
                id: `route:${location.pathname}`,
                title: meta.title,
                description: meta.description,
                path: location.pathname,
                iconKey: meta.iconKey,
            });
        }
    }, [location.pathname]);

    // Listen to updates in recents
    useEffect(() => {
        const handleRecentsUpdate = () => setRecentsVersion((v) => v + 1);
        window.addEventListener('spotlight-recents-updated', handleRecentsUpdate);
        return () => window.removeEventListener('spotlight-recents-updated', handleRecentsUpdate);
    }, []);

    // Toggle on Ctrl+K, Cmd+K, or custom event
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        const handleCustomOpen = () => setOpen(true);
        const handleCustomToggle = () => setOpen((prev) => !prev);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-command-palette', handleCustomOpen);
        window.addEventListener('toggle-command-palette', handleCustomToggle);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-command-palette', handleCustomOpen);
            window.removeEventListener('toggle-command-palette', handleCustomToggle);
        };
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Execute an item and remember it
    const handleExecute = (
        action: () => void,
        itemMeta?: { id: string; title: string; description?: string; path?: string; iconKey?: string }
    ) => {
        if (itemMeta) {
            saveRecentSpotlightItem(itemMeta);
        }
        action();
        setOpen(false);
    };

    // Build Recent Items & prioritize the Last Navigated Destination
    const rawRecents = useMemo(() => {
        // recentsVersion forces re-render whenever localStorage updates
        void recentsVersion;
        return getRecentSpotlightItems();
    }, [recentsVersion, open, location.pathname]);
    const activePath = location.pathname;
    const sortedRecents = [...rawRecents];

    // Promote the last visited page that differs from current page to index 0
    const jumpBackIndex = sortedRecents.findIndex((item) => item.path && item.path !== activePath);
    if (jumpBackIndex > 0) {
        const [jumpBackItem] = sortedRecents.splice(jumpBackIndex, 1);
        sortedRecents.unshift(jumpBackItem);
    }

    const recentCommands: CommandItem[] = sortedRecents.slice(0, 4).map((item, idx) => {
        const isJumpBack = idx === 0 && Boolean(item.path && item.path !== activePath);
        const IconComponent = isJumpBack ? RotateCcw : getIconFor(item.iconKey);

        return {
            id: `recent-${item.id}`,
            title: item.title,
            description: isJumpBack
                ? `Jump back to previous page • ${formatRelativeTime(item.timestamp)}`
                : (item.description ? `${item.description} • ${formatRelativeTime(item.timestamp)}` : formatRelativeTime(item.timestamp)),
            icon: IconComponent,
            category: 'Recent',
            isRecent: true,
            isJumpBack,
            timeAgo: formatRelativeTime(item.timestamp),
            action: () => {
                if (item.path) {
                    navigate(item.path);
                }
                setOpen(false);
            },
            onRemove: () => removeRecentSpotlightItem(item.id),
        };
    });

    // Base Navigation and Actions Commands
    const baseCommands: CommandItem[] = [
        // Navigation
        {
            id: 'explore',
            title: 'Explore Marketplace',
            description: 'Browse all creator services and commission listings',
            icon: Compass,
            category: 'Navigation',
            action: () => handleExecute(() => navigate('/explore'), { id: 'route:/explore', title: 'Explore Marketplace', path: '/explore', iconKey: 'Compass' }),
        },
        {
            id: 'store',
            title: 'Commission Store',
            description: 'Browse commission packages, fixed-price gigs, and open slots',
            icon: ShoppingBag,
            category: 'Navigation',
            action: () => handleExecute(() => navigate('/store'), { id: 'route:/store', title: 'Commission Store', path: '/store', iconKey: 'Store' }),
        },
        {
            id: 'artists',
            title: 'Artists Directory',
            description: 'Discover verified illustrators, concept artists, and studios',
            icon: Palette,
            category: 'Navigation',
            action: () => handleExecute(() => navigate('/artists'), { id: 'route:/artists', title: 'Artists Directory', path: '/artists', iconKey: 'Palette' }),
        },
        ...(isAuthenticated ? [
            {
                id: 'commissions',
                title: 'My Commissions',
                description: 'Manage active orders, milestone approvals, and deliverables',
                icon: Briefcase,
                category: 'Navigation' as const,
                action: () => handleExecute(() => navigate('/commissions'), { id: 'route:/commissions', title: 'My Commissions', path: '/commissions', iconKey: 'Briefcase' }),
            },
            {
                id: 'create-post',
                title: 'Create Artwork Post',
                description: 'Upload new portfolio art, WIP snapshots, or commission showcases',
                icon: Plus,
                category: 'Navigation' as const,
                action: () => handleExecute(() => navigate('/posts/create'), { id: 'route:/posts/create', title: 'Create Artwork Post', path: '/posts/create', iconKey: 'Plus' }),
            },
            {
                id: 'profile',
                title: 'My Profile',
                description: 'View your public showcase, bio, and commission listings',
                icon: UserIcon,
                category: 'Navigation' as const,
                action: () => handleExecute(() => navigate('/profile'), { id: 'route:/profile', title: 'My Profile', path: '/profile', iconKey: 'User' }),
            },
            {
                id: 'notifications',
                title: 'Notifications',
                description: 'View unread activity, order alerts, and messages',
                icon: Bell,
                category: 'Navigation' as const,
                action: () => handleExecute(() => navigate('/notifications'), { id: 'route:/notifications', title: 'Notifications', path: '/notifications', iconKey: 'Bell' }),
            },
            {
                id: 'settings',
                title: 'Account Settings',
                description: 'Profile settings, 2FA security, and active sessions',
                icon: Settings,
                category: 'Navigation' as const,
                action: () => handleExecute(() => navigate('/settings'), { id: 'route:/settings', title: 'Account Settings', path: '/settings', iconKey: 'Settings' }),
            },
            {
                id: 'support',
                title: 'Help & Support',
                description: 'Submit inquiries or view your active support tickets',
                icon: LifeBuoy,
                category: 'Navigation' as const,
                action: () => handleExecute(() => navigate('/support'), { id: 'route:/support', title: 'Help & Support', path: '/support', iconKey: 'LifeBuoy' }),
            },
        ] : []),
        ...(user?.artist_profile ? [
            {
                id: 'dashboard',
                title: 'Artist Studio Workbench',
                description: 'Manage your listings, slots, and artist earnings',
                icon: Sparkles,
                category: 'Navigation' as const,
                action: () => handleExecute(() => navigate('/dashboard'), { id: 'route:/dashboard', title: 'Artist Studio Workbench', path: '/dashboard', iconKey: 'Sparkles' }),
            },
        ] : [
            {
                id: 'apply-artist',
                title: 'Apply as Artist',
                description: 'Submit your creator application to offer commission packages',
                icon: Sparkles,
                category: 'Navigation' as const,
                action: () => handleExecute(() => navigate('/apply-artist'), { id: 'route:/apply-artist', title: 'Apply as Artist', path: '/apply-artist', iconKey: 'Sparkles' }),
            }
        ]),

        // Admin & Telemetry
        ...(user?.role === 'admin' || user?.role === 'moderator' ? [
            {
                id: 'admin-dashboard',
                title: 'Admin Operations Overview',
                description: 'Platform statistics, revenue, and queue metrics',
                icon: Shield,
                category: 'Admin & Observability' as const,
                action: () => handleExecute(() => navigate('/admin'), { id: 'route:/admin', title: 'Admin Operations', path: '/admin', iconKey: 'Shield' }),
            },
            {
                id: 'admin-users',
                title: 'User Management',
                description: 'View accounts, role assignments, and moderation controls',
                icon: Users,
                category: 'Admin & Observability' as const,
                action: () => handleExecute(() => navigate('/admin/users'), { id: 'route:/admin/users', title: 'User Management', path: '/admin/users', iconKey: 'Users' }),
            },
            {
                id: 'admin-applications',
                title: 'Artist Applications Queue',
                description: 'Review and approve pending artist portfolios',
                icon: FileCheck,
                category: 'Admin & Observability' as const,
                action: () => handleExecute(() => navigate('/admin/applications'), { id: 'route:/admin/applications', title: 'Artist Applications Queue', path: '/admin/applications', iconKey: 'FileCheck' }),
            },
            {
                id: 'pulse',
                title: 'Laravel Pulse (APM Dashboard)',
                description: 'Real-time slow queries, request latencies, and cache monitoring',
                icon: Zap,
                category: 'Admin & Observability' as const,
                action: () => handleExecute(() => window.open('/pulse', '_blank'), { id: 'external:pulse', title: 'Laravel Pulse', iconKey: 'Zap' }),
                external: true,
            },
            {
                id: 'log-viewer',
                title: 'Interactive Log Viewer',
                description: 'Diagnostic logs streaming, stack traces, and search',
                icon: Terminal,
                category: 'Admin & Observability' as const,
                action: () => handleExecute(() => window.open('/log-viewer', '_blank'), { id: 'external:log-viewer', title: 'Interactive Log Viewer', iconKey: 'Terminal' }),
                external: true,
            },
        ] : []),

        // Quick Actions
        {
            id: 'tip-jar',
            title: 'Creator Tip Jar (Send Micro-Donation)',
            description: 'Support verified artists with quick tips via Midtrans Snap (Coffee, Art Supplies, Pizza)',
            icon: Heart,
            category: 'Actions',
            action: () => handleExecute(() => {
                navigate('/artists');
                toast.info('Visit any artist profile or artwork post to tip them!');
            }, { id: 'action:tip-jar', title: 'Creator Tip Jar (Send Micro-Donation)', iconKey: 'Heart' }),
        },
        {
            id: 'toggle-theme',
            title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
            description: 'Change interface color theme',
            icon: theme === 'dark' ? Sun : Moon,
            category: 'Actions',
            action: () => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                setOpen(false);
            },
        },
        ...(isAuthenticated ? [
            {
                id: 'logout',
                title: 'Sign Out',
                description: 'Safely log out of your current session',
                icon: LogOut,
                category: 'Actions' as const,
                action: () => { logout(); setOpen(false); },
            },
        ] : []),
    ];

    // Combine recent + base commands (avoid exact duplicate titles in empty search view)
    const combinedCommands = [
        ...recentCommands,
        ...baseCommands.filter(
            base => !recentCommands.some(rec => rec.title.toLowerCase() === base.title.toLowerCase())
        ),
    ];

    // Filter by user query
    const filteredCommands = query.trim() === ''
        ? combinedCommands
        : [...recentCommands, ...baseCommands].filter((cmd) => {
            const q = query.toLowerCase();
            return (
                cmd.title.toLowerCase().includes(q) ||
                (cmd.description && cmd.description.toLowerCase().includes(q)) ||
                cmd.category.toLowerCase().includes(q)
            );
        });

    // Keyboard navigation (Arrow keys + Enter)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
            }
        }
    };

    const selectedCommand = filteredCommands[selectedIndex];

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="relative w-full max-w-xl bg-card border border-border/80 shadow-2xl rounded-2xl overflow-hidden z-10 flex flex-col max-h-[78vh]"
                    >
                        {/* Search Input Bar */}
                        <div className="flex items-center px-4 py-3.5 border-b border-border/70 gap-3 bg-muted/20">
                            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search pages, artists, orders, or admin tools..."
                                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden font-medium"
                            />
                            <div className="flex items-center gap-1.5 shrink-0">
                                <kbd className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-muted text-muted-foreground border border-border/80 rounded-md">
                                    ESC
                                </kbd>
                            </div>
                        </div>

                        {/* Commands List */}
                        <div className="overflow-y-auto p-2 space-y-0.5">
                            {filteredCommands.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    No commands or pages found matching &ldquo;<span className="text-foreground font-semibold">{query}</span>&rdquo;
                                </div>
                            ) : (
                                filteredCommands.map((cmd, index) => {
                                    const Icon = cmd.icon;
                                    const isSelected = index === selectedIndex;
                                    const prevCmd = filteredCommands[index - 1];
                                    const showHeader = query.trim() === '' && (!prevCmd || prevCmd.category !== cmd.category);

                                    return (
                                        <React.Fragment key={cmd.id}>
                                            {showHeader && (
                                                <div className="flex items-center justify-between px-3 pt-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground/70 select-none">
                                                    <span className="flex items-center gap-1.5">
                                                        {cmd.category === 'Recent' && <History className="h-3 w-3 text-primary" />}
                                                        {cmd.category}
                                                    </span>
                                                    {cmd.category === 'Recent' && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                clearRecentSpotlightItems();
                                                            }}
                                                            className="text-[10px] font-mono lowercase hover:text-foreground text-muted-foreground/60 transition-colors cursor-pointer hover:underline"
                                                        >
                                                            clear
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            <div
                                                onClick={() => cmd.action()}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`group flex items-center justify-between p-2.5 px-3 rounded-xl cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                                        : 'hover:bg-muted/60 text-foreground'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                                        isSelected
                                                            ? 'bg-primary-foreground/15 text-primary-foreground'
                                                            : cmd.isJumpBack
                                                            ? 'bg-primary/15 text-primary'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold leading-tight truncate flex items-center gap-1.5">
                                                            {cmd.title}
                                                        </p>
                                                        {cmd.description && (
                                                            <p className={`text-[11px] truncate mt-0.5 ${
                                                                isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                                            }`}>
                                                                {cmd.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                                    {cmd.isJumpBack ? (
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[9px] uppercase font-mono px-1.5 py-0 border-primary/40 ${
                                                                isSelected ? 'bg-white/20 text-white' : 'bg-primary/15 text-primary'
                                                            }`}
                                                        >
                                                            Jump Back
                                                        </Badge>
                                                    ) : cmd.isRecent ? (
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[9px] uppercase font-mono px-1.5 py-0 ${
                                                                isSelected ? 'border-primary-foreground/30 text-primary-foreground' : 'border-border/60 text-muted-foreground'
                                                            }`}
                                                        >
                                                            {cmd.timeAgo || 'Recent'}
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[9px] uppercase font-mono px-1.5 py-0 ${
                                                                isSelected ? 'border-primary-foreground/30 text-primary-foreground' : 'border-border/60 text-muted-foreground'
                                                            }`}
                                                        >
                                                            {cmd.category}
                                                        </Badge>
                                                    )}

                                                    {cmd.isRecent && cmd.onRemove ? (
                                                        <button
                                                            type="button"
                                                            title="Remove from recents"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                cmd.onRemove?.();
                                                            }}
                                                            className={`p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 ${
                                                                isSelected
                                                                    ? 'text-primary-foreground hover:bg-white/20'
                                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                                            }`}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    ) : cmd.external ? (
                                                        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                                                    ) : (
                                                        <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? 'translate-x-0.5' : 'opacity-40'}`} />
                                                    )}
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className="p-2.5 px-4 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <span>
                                    <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">↑</kbd>{' '}
                                    <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">↓</kbd> to navigate
                                </span>
                                <span>
                                    <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">↵</kbd>{' '}
                                    {selectedCommand?.isJumpBack
                                        ? `jump back to ${selectedCommand.title}`
                                        : 'to select'}
                                </span>
                            </div>
                            <span className="font-mono text-[10px]">Comme Spotlight</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
