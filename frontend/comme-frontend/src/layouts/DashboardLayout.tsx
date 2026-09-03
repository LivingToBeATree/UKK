import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Palette, Sparkles, Layers, Settings, PenTool } from 'lucide-react';
import { SidebarContext } from '@/contexts/sidebarContextDef';
import { useSidebar } from '@/hooks/useSidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { cn } from '@/lib/utils';

const studioTabs = [
    { id: 'overview', label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', path: '/dashboard/portfolio', icon: Palette },
    { id: 'services', label: 'Services', path: '/dashboard/services', icon: Sparkles },
    { id: 'orders', label: 'Orders', path: '/dashboard/commissions', icon: Layers },
    { id: 'settings', label: 'Studio Settings', path: '/dashboard/settings', icon: Settings },
];

export const DashboardLayout: React.FC = () => {
    // 1. Global rail collapsed state (outer SidebarProvider in App.tsx)
    const { collapsed: railCollapsed } = useSidebar();
    const location = useLocation();

    // 2. Studio sidebar inner collapsed state
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleSidebar = () => setCollapsed((c) => !c);
    const toggleMobile = () => setMobileOpen((o) => !o);

    // Dynamic width calculation matching SidebarRail & Studio Sidebar
    const railOffset = railCollapsed ? 68 : 260;
    const studioWidth = collapsed ? 72 : 256;

    return (
        <SidebarContext.Provider
            value={{
                collapsed,
                setCollapsed,
                toggleSidebar,
                mobileOpen,
                setMobileOpen,
                toggleMobile,
            }}
        >
            <div className="flex flex-col md:flex-row min-h-screen w-full relative">
                {/* ── Mobile Studio Subnav Bar ── */}
                <div className="md:hidden sticky top-14 z-30 bg-card/95 backdrop-blur-xl border-b border-border px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-xs">
                    <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-border/80 mr-1">
                        <PenTool className="h-4 w-4 text-purple-400" />
                        <span className="font-bold text-xs">Studio</span>
                    </div>
                    {studioTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = tab.path === '/dashboard'
                            ? location.pathname === '/dashboard'
                            : location.pathname.startsWith(tab.path);
                        return (
                            <Link
                                key={tab.id}
                                to={tab.path}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors',
                                    isActive
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{tab.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* ── Fixed Desktop Studio Sidebar (Permanently Locked on Screen, Cannot Scroll Away) ── */}
                <div
                    className="hidden md:flex fixed top-0 bottom-0 h-screen z-30 flex-col transition-all duration-300 ease-out"
                    style={{
                        left: `${railOffset}px`,
                        width: `${studioWidth}px`,
                    }}
                >
                    <AppSidebar />
                </div>

                {/* ── Flow Spacer (Ensures page content is cleanly aligned without hiding behind fixed sidebar) ── */}
                <div
                    className="hidden md:block shrink-0 transition-all duration-300 ease-out"
                    style={{ width: `${studioWidth}px` }}
                    aria-hidden="true"
                />

                {/* ── Main Scrollable Content ── */}
                <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </SidebarContext.Provider>
    );
};
