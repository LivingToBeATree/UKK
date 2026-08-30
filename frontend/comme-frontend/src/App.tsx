import AppRoutes from './routes';
import { ThemeProvider } from '@/components/theme-provider';
import { ColorThemeProvider } from '@/components/color-theme-provider';
import { SidebarRail } from '@/components/SidebarRail';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="comme-ui-theme">
            <ColorThemeProvider>
                <div className="min-h-screen bg-background text-foreground flex font-sans transition-colors duration-200">
                    {/* Fixed Left Slim Icon Rail */}
                    <SidebarRail />

                    {/* Main Content Area Offset by Sidebar Rail */}
                    <div className="flex-1 flex flex-col min-w-0 pl-16">
                        <Navbar />
                        <main className="flex-1">
                            <AppRoutes />
                        </main>
                        <Footer />
                    </div>
                    <Toaster />
                </div>
            </ColorThemeProvider>
        </ThemeProvider>
    );
}

export default App;