import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarContext } from '@/contexts/sidebarContextDef';
import { useSidebar } from '@/hooks/useSidebar';
import { AppSidebar } from '@/components/AppSidebar';

export const DashboardLayout: React.FC = () => {
    // 1. Global rail collapsed state (outer SidebarProvider in App.tsx)
    const { collapsed: railCollapsed } = useSidebar();

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
            <div className="flex min-h-screen w-full relative">
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

                {/* ── Mobile Studio Sidebar Drawer ── */}
                <div className="md:hidden">
                    <AppSidebar />
                </div>

                {/* ── Main Scrollable Content ── */}
                <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </SidebarContext.Provider>
    );
};
