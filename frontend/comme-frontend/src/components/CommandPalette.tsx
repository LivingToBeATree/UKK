import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/badge';

interface CommandItem {
    id: string;
    title: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    category: 'Navigation' | 'Admin & Observability' | 'Actions';
    action: () => void;
    shortcut?: string;
    external?: boolean;
}

export const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
};

export const toggleCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('toggle-command-palette'));
};

export const CommandPalette: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();
    const { theme, setTheme } = useTheme();

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

    // Build available commands based on user role and state
    const commands: CommandItem[] = [
        // Navigation
        {
            id: 'explore',
            title: 'Explore Marketplace',
            description: 'Browse all creator services and commission listings',
            icon: Compass,
            category: 'Navigation',
            action: () => { navigate('/explore'); setOpen(false); },
        },
        {
            id: 'artists',
            title: 'Artists Directory',
            description: 'Discover verified illustrators and studio creators',
            icon: Palette,
            category: 'Navigation',
            action: () => { navigate('/artists'); setOpen(false); },
        },
        ...(isAuthenticated ? [
            {
                id: 'commissions',
                title: 'My Commissions',
                description: 'Manage active orders, milestone approvals, and deliverables',
                icon: Briefcase,
                category: 'Navigation' as const,
                action: () => { navigate('/commissions'); setOpen(false); },
            },
            {
                id: 'notifications',
                title: 'Notifications',
                description: 'View unread activity, order alerts, and messages',
                icon: Bell,
                category: 'Navigation' as const,
                action: () => { navigate('/notifications'); setOpen(false); },
            },
            {
                id: 'settings',
                title: 'Account Settings',
                description: 'Profile settings, 2FA security, and active sessions',
                icon: Settings,
                category: 'Navigation' as const,
                action: () => { navigate('/settings'); setOpen(false); },
            },
        ] : []),
        ...(user?.artist_profile ? [
            {
                id: 'dashboard',
                title: 'Artist Studio Workbench',
                description: 'Manage your listings, slots, and artist earnings',
                icon: Sparkles,
                category: 'Navigation' as const,
                action: () => { navigate('/dashboard'); setOpen(false); },
            },
        ] : []),

        // Admin & Telemetry
        ...(user?.role === 'admin' || user?.role === 'moderator' ? [
            {
                id: 'admin-dashboard',
                title: 'Admin Operations Overview',
                description: 'Platform statistics, revenue, and queue metrics',
                icon: Shield,
                category: 'Admin & Observability' as const,
                action: () => { navigate('/admin'); setOpen(false); },
            },
            {
                id: 'admin-users',
                title: 'User Management',
                description: 'View accounts, role assignments, and moderation controls',
                icon: Users,
                category: 'Admin & Observability' as const,
                action: () => { navigate('/admin/users'); setOpen(false); },
            },
            {
                id: 'admin-applications',
                title: 'Artist Applications Queue',
                description: 'Review and approve pending artist portfolios',
                icon: FileCheck,
                category: 'Admin & Observability' as const,
                action: () => { navigate('/admin/applications'); setOpen(false); },
            },
            {
                id: 'pulse',
                title: 'Laravel Pulse (APM Dashboard)',
                description: 'Real-time slow queries, request latencies, and cache monitoring',
                icon: Zap,
                category: 'Admin & Observability' as const,
                action: () => { window.open('http://localhost:8000/pulse', '_blank'); setOpen(false); },
                external: true,
            },
            {
                id: 'log-viewer',
                title: 'Interactive Log Viewer',
                description: 'Diagnostic logs streaming, stack traces, and search',
                icon: Terminal,
                category: 'Admin & Observability' as const,
                action: () => { window.open('http://localhost:8000/log-viewer', '_blank'); setOpen(false); },
                external: true,
            },
        ] : []),

        // Quick Actions
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

    // Filter by user query
    const filteredCommands = query.trim() === ''
        ? commands
        : commands.filter((cmd) =>
            cmd.title.toLowerCase().includes(query.toLowerCase()) ||
            (cmd.description && cmd.description.toLowerCase().includes(query.toLowerCase())) ||
            cmd.category.toLowerCase().includes(query.toLowerCase())
        );

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

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-28 px-4">
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
                        className="relative w-full max-w-xl bg-card border border-border/80 shadow-2xl rounded-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
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
                        <div className="overflow-y-auto p-2 space-y-1">
                            {filteredCommands.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    No commands or pages found matching &ldquo;<span className="text-foreground font-semibold">{query}</span>&rdquo;
                                </div>
                            ) : (
                                filteredCommands.map((cmd, index) => {
                                    const Icon = cmd.icon;
                                    const isSelected = index === selectedIndex;

                                    return (
                                        <div
                                            key={cmd.id}
                                            onClick={() => cmd.action()}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'hover:bg-muted/60 text-foreground'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                    isSelected ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold leading-tight truncate">
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
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[9px] uppercase font-mono px-1.5 py-0 ${
                                                        isSelected ? 'border-primary-foreground/30 text-primary-foreground' : 'border-border/60 text-muted-foreground'
                                                    }`}
                                                >
                                                    {cmd.category}
                                                </Badge>
                                                {cmd.external ? (
                                                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                                                ) : (
                                                    <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? 'translate-x-0.5' : 'opacity-40'}`} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className="p-2.5 px-4 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <span><kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">↓</kbd> to navigate</span>
                                <span><kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">↵</kbd> to select</span>
                            </div>
                            <span className="font-mono text-[10px]">Comme Spotlight</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
