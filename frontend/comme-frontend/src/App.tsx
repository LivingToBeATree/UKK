import { motion } from 'motion/react';
import AppRoutes from './routes';
import { ThemeProvider } from '@/components/theme-provider';
import { ColorThemeProvider } from '@/components/color-theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { SidebarRail } from '@/components/SidebarRail';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

import { useLocation } from 'react-router-dom';

function AppLayout() {
    const { collapsed } = useSidebar();
    const location = useLocation();

    // Full-screen layout for landing page and dedicated authentication flows
    const isFullScreenRoute = [
        '/',
        '/login',
        '/register',
        '/register/verify',
        '/forgot-password',
    ].includes(location.pathname) || location.pathname.startsWith('/reset-password');

    if (isFullScreenRoute) {
        return (
            <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-200">
                <AppRoutes />
                <Toaster />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans transition-colors duration-200 overflow-x-hidden">
            {/* Fixed Left Expandable Rail */}
            <SidebarRail />

            {/* Main Content Area Offset in 100% Sync with Sidebar Width */}
            <motion.div
                initial={false}
                animate={{ paddingLeft: collapsed ? 68 : 260 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="flex-1 flex flex-col min-w-0 overflow-x-hidden"
            >
                <Navbar />
                <main className="flex-1">
                    <AppRoutes />
                </main>
            </motion.div>
            <Toaster />
        </div>
    );
}

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="comme-ui-theme">
            <ColorThemeProvider>
                <SidebarProvider defaultCollapsed={true} storageKey="comme-sidebar-collapsed">
                    <AppLayout />
                </SidebarProvider>
            </ColorThemeProvider>
        </ThemeProvider>
    );
}

export default App;