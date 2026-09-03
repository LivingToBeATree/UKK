import { useState } from 'react';
import { motion } from 'motion/react';
import AppRoutes from './routes';
import { ThemeProvider } from '@/components/theme-provider';
import { ColorThemeProvider } from '@/components/color-theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { SidebarRail } from '@/components/SidebarRail';
import { MobileHeader, MobileBottomNav, MobileDrawer } from '@/components/MobileNav';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { WarningNoticeModal } from '@/components/modals/WarningNoticeModal';
import { useLocation } from 'react-router-dom';

function AppLayout() {
    const { collapsed } = useSidebar();
    const isMobile = useIsMobile();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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
                <WarningNoticeModal />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200 overflow-x-clip">
            {/* Desktop Fixed Left Expandable Rail (Hidden on Mobile) */}
            <div className="hidden md:block">
                <SidebarRail />
            </div>

            {/* Mobile Top Header (Visible on Mobile Only) */}
            <MobileHeader onOpenDrawer={() => setMobileDrawerOpen(true)} />

            {/* Mobile Slide-out Drawer */}
            <MobileDrawer isOpen={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />

            {/* Main Content Area Offset in 100% Sync with Sidebar Width on Desktop, 0 on Mobile */}
            <motion.div
                initial={false}
                animate={{ paddingLeft: isMobile ? 0 : (collapsed ? 68 : 260) }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="flex-1 flex flex-col min-w-0 w-full overflow-x-clip pb-16 md:pb-0"
            >
                <Navbar />
                <main className="flex-1 flex flex-col min-h-screen w-full">
                    <AppRoutes />
                </main>
            </motion.div>

            {/* Mobile Bottom Navigation Bar (Visible on Mobile Only) */}
            <MobileBottomNav />

            <Toaster />
            <WarningNoticeModal />
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