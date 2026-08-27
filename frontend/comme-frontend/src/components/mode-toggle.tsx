import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from './ui/dropdown-menu';

export function ModeToggle() {
    const { theme, setTheme } = useTheme();

    const renderActiveIcon = () => {
        if (theme === 'light') {
            return (
                <motion.div
                    key="light"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                >
                    <Sun className="h-4 w-4 text-amber-500" />
                </motion.div>
            );
        }
        if (theme === 'dark') {
            return (
                <motion.div
                    key="dark"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                >
                    <Moon className="h-4 w-4 text-primary" />
                </motion.div>
            );
        }
        return (
            <motion.div
                key="system"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
            >
                <Monitor className="h-4 w-4 text-primary" />
            </motion.div>
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Toggle theme">
                    <AnimatePresence mode="wait" initial={false}>
                        {renderActiveIcon()}
                    </AnimatePresence>
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Light</span>
                    {theme === 'light' && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="h-4 w-4 mr-2 text-primary" />
                    <span>Dark</span>
                    {theme === 'dark' && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>System</span>
                    {theme === 'system' && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
