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

            {/* Main Content Area Offset Dynamically */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out ${
                    collapsed ? 'pl-16' : 'pl-64'
                }`}
            >
                <Navbar />
                <main className="flex-1">
                    <AppRoutes />
                </main>
                <Footer />
            </div>
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