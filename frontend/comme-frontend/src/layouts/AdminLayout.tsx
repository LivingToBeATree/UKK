import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileCheck,
    Flag,
    MessageSquare,
    Shield,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { id: 'users', label: 'Users', path: '/admin/users', icon: Users },
    { id: 'applications', label: 'Applications', path: '/admin/applications', icon: FileCheck },
    { id: 'reports', label: 'Reports', path: '/admin/reports', icon: Flag },
    { id: 'tickets', label: 'Tickets', path: '/admin/tickets', icon: MessageSquare },
    { id: 'moderation', label: 'Moderation Log', path: '/admin/moderation-log', icon: Shield },
];

export const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <div className="flex min-h-screen w-full relative items-start">
            {/* Sidebar */}
            <aside
                className={cn(
                    'hidden md:flex sticky top-0 h-screen min-h-screen border-r border-border bg-card flex-col transition-all duration-200 z-30 overflow-y-auto shrink-0',
                    collapsed ? 'w-16' : 'w-60'
                )}
            >
                <div className="p-3 border-b border-border">
                    {!collapsed && (
                        <div className="flex items-center gap-2 px-2">
                            <Shield className="h-5 w-5 text-amber-400" />
                            <span className="font-bold text-sm">Admin Panel</span>
                        </div>
                    )}
                    {collapsed && <Shield className="h-5 w-5 text-amber-400 mx-auto" />}
                </div>

                <nav className="flex-1 p-2 space-y-1">
                    {adminNavItems.map((item) => {
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
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-2 border-t border-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};
