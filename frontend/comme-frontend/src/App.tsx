import AppRoutes from './routes';
import { ThemeProvider } from '@/components/theme-provider';
import { ColorThemeProvider } from '@/components/color-theme-provider';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="comme-ui-theme">
            <ColorThemeProvider>
                <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
                    <Navbar />
                    <main className="flex-1">
                        <AppRoutes />
                    </main>
                    <Toaster />
                </div>
            </ColorThemeProvider>
        </ThemeProvider>
    );
}

export default App;