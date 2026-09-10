import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileCheck,
    Flag,
    MessageSquare,
    Shield,
    Activity,
    ExternalLink,
    Zap,
    Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuth } from '@/hooks/useAuth';
import { getApiBaseUrl } from '@/services/api';

/** All possible navigation items in the staff panel. */
const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard, adminOnly: true },
    { id: 'users', label: 'Users', path: '/admin/users', icon: Users, adminOnly: true },
    { id: 'applications', label: 'Applications', path: '/admin/applications', icon: FileCheck, adminOnly: false },
    { id: 'reports', label: 'Reports', path: '/admin/reports', icon: Flag, adminOnly: false },
    { id: 'tickets', label: 'Tickets', path: '/admin/tickets', icon: MessageSquare, adminOnly: false },
    { id: 'moderation', label: 'Moderation Log', path: '/admin/moderation-log', icon: Shield, adminOnly: true },
    { id: 'observability', label: 'System Health & APM', path: '/admin#observability', icon: Activity, adminOnly: true },
];

export const AdminLayout: React.FC = () => {
    const { collapsed: railCollapsed } = useSidebar();
    const { user } = useAuth();
    const location = useLocation();

    const isAdmin = user?.role === 'admin';
    const panelTitle = isAdmin ? 'Admin Panel' : 'Moderator Panel';
    const iconColor = isAdmin ? 'text-amber-400' : 'text-indigo-400';
    const apiBase = getApiBaseUrl().replace(/\/api\/?$/, '');

    // Filter nav items based on role
    const navItems = isAdmin
        ? allNavItems
        : allNavItems.filter((item) => !item.adminOnly);

    const isItemActive = (itemPath: string) => {
        if (itemPath.includes('#')) {
            return location.pathname === '/admin' && location.hash === '#observability';
        }
        return location.pathname === itemPath && location.hash !== '#observability';
    };

    const railOffset = railCollapsed ? 68 : 260;
    const adminWidth = 240; // Always expanded — no collapse

    return (
        <div className="flex flex-col md:flex-row min-h-screen w-full relative">
            {/* Mobile Sub-Navigation Bar (Horizontal scrollable tabs) */}
            <div className="md:hidden sticky top-14 z-30 bg-card/95 backdrop-blur-xl border-b border-border px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-xs">
                <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-border/80 mr-1">
                    <Shield className={cn('h-4 w-4', iconColor)} />
                    <span className="font-bold text-xs">{isAdmin ? 'Admin' : 'Mod'}</span>
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item.path);
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Desktop Fixed Sidebar (Permanently on screen, cannot scroll away) */}
            <aside
                className="hidden md:flex fixed top-0 bottom-0 z-30 border-r border-border bg-card flex-col transition-all duration-300 overflow-y-auto shrink-0"
                style={{
                    left: `${railOffset}px`,
                    width: `${adminWidth}px`,
                }}
            >
                <div className="p-3 border-b border-border shrink-0">
                    <div className="flex items-center gap-2 px-2">
                        <Shield className={cn('h-5 w-5', iconColor)} />
                        <span className="font-bold text-sm">{panelTitle}</span>
                    </div>
                </div>

                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isItemActive(item.path);
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Observability & Diagnostic Tools Quick Access */}
                {isAdmin && (
                    <div className="p-3 border-t border-border mt-auto shrink-0 bg-muted/20 space-y-1">
                        <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold px-2 mb-1.5">
                            Live Telemetry & APM
                        </p>
                        <a
                            href={`${apiBase}/pulse`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors group"
                            title="Open Laravel Pulse in a new tab"
                        >
                            <span className="flex items-center gap-2">
                                <Zap className="h-3.5 w-3.5 text-amber-400" />
                                <span>Laravel Pulse</span>
                            </span>
                            <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                        </a>
                        <a
                            href={`${apiBase}/log-viewer`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors group"
                            title="Open Log Viewer in a new tab"
                        >
                            <span className="flex items-center gap-2">
                                <Terminal className="h-3.5 w-3.5 text-blue-400" />
                                <span>Log Viewer</span>
                            </span>
                            <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                        </a>
                        <a
                            href={`${apiBase}/api/health`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors group"
                            title="Open /api/health raw JSON in a new tab"
                        >
                            <span className="flex items-center gap-2">
                                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Health API (JSON)</span>
                            </span>
                            <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                        </a>
                    </div>
                )}
            </aside>

            {/* Flow Spacer */}
            <div
                className="hidden md:block shrink-0 transition-all duration-300"
                style={{ width: `${adminWidth}px` }}
                aria-hidden="true"
            />

            {/* Main Content */}
            <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};
