import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarContext } from '@/contexts/sidebarContextDef';
import { AppSidebar } from '@/components/AppSidebar';

export const DashboardLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleSidebar = () => setCollapsed((c) => !c);
    const toggleMobile = () => setMobileOpen((o) => !o);

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleSidebar, mobileOpen, setMobileOpen, toggleMobile }}>
            <div className="flex min-h-screen w-full relative items-start">
                <AppSidebar />
                <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </SidebarContext.Provider>
    );
};
