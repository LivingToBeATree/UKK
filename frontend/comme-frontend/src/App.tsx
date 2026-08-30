import { motion } from 'motion/react';
import AppRoutes from './routes';
import { ThemeProvider } from '@/components/theme-provider';
import { ColorThemeProvider } from '@/components/color-theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { SidebarRail } from '@/components/SidebarRail';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';

function AppLayout() {
    const { collapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans transition-colors duration-200">
            {/* Fixed Left Expandable Rail */}
            <SidebarRail />

            {/* Main Content Area Offset in 100% Sync with Sidebar Width */}
            <motion.div
                initial={false}
                animate={{ paddingLeft: collapsed ? 72 : 240 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="flex-1 flex flex-col min-w-0"
            >
                <Navbar />
                <main className="flex-1">
                    <AppRoutes />
                </main>
                <Footer />
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