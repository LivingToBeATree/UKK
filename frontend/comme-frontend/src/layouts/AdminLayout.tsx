import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileCheck,
    Flag,
    MessageSquare,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuth } from '@/hooks/useAuth';

/** All possible navigation items in the staff panel. */
const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard, adminOnly: true },
    { id: 'users', label: 'Users', path: '/admin/users', icon: Users, adminOnly: true },
    { id: 'applications', label: 'Applications', path: '/admin/applications', icon: FileCheck, adminOnly: false },
    { id: 'reports', label: 'Reports', path: '/admin/reports', icon: Flag, adminOnly: false },
    { id: 'tickets', label: 'Tickets', path: '/admin/tickets', icon: MessageSquare, adminOnly: false },
    { id: 'moderation', label: 'Moderation Log', path: '/admin/moderation-log', icon: Shield, adminOnly: true },
];

export const AdminLayout: React.FC = () => {
    const { collapsed: railCollapsed } = useSidebar();
    const { user } = useAuth();
    const location = useLocation();

    const isAdmin = user?.role === 'admin';
    const panelTitle = isAdmin ? 'Admin Panel' : 'Moderator Panel';
    const iconColor = isAdmin ? 'text-amber-400' : 'text-indigo-400';

    // Filter nav items based on role
    const navItems = isAdmin
        ? allNavItems
        : allNavItems.filter((item) => !item.adminOnly);

    const railOffset = railCollapsed ? 68 : 260;
    const adminWidth = 240; // Always expanded — no collapse

    return (
        <div className="flex min-h-screen w-full relative">
            {/* Fixed Sidebar (Permanently on screen, cannot scroll away) */}
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
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Flow Spacer */}
            <div
                className="hidden md:block shrink-0 transition-all duration-300"
                style={{ width: `${adminWidth}px` }}
                aria-hidden="true"
            />

            {/* Main Content */}
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};
