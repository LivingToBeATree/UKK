import { Palette } from 'lucide-react';
import { useColorTheme } from '@/hooks/useColorTheme';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from './ui/dropdown-menu';

export function ColorThemeToggle() {
    const { colorTheme, setColorTheme } = useColorTheme();

    const themes = [
        {
            key: 'purple' as const,
            label: 'Royal Purple',
            hex: '#A802F5',
            badgeBg: 'bg-[#A802F5]',
        },
        {
            key: 'teal' as const,
            label: 'Neon Teal',
            hex: '#02F5A8',
            badgeBg: 'bg-[#02F5A8]',
        },
        {
            key: 'orange' as const,
            label: 'Solar Orange',
            hex: '#F5AA02',
            badgeBg: 'bg-[#F5AA02]',
        },
    ];

    const activeMeta = themes.find((t) => t.key === colorTheme) || themes[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Select accent color theme">
                    <div className="relative flex items-center justify-center">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span
                            className={`absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full ring-1 ring-background ${activeMeta.badgeBg}`}
                        />
                    </div>
                    <span className="sr-only">Color Theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
                {themes.map((t) => (
                    <DropdownMenuItem
                        key={t.key}
                        onClick={() => setColorTheme(t.key)}
                        className="flex items-center gap-2.5"
                    >
                        <span className={`h-3 w-3 rounded-full ${t.badgeBg} ring-1 ring-border`} />
                        <span className="flex-1">{t.label}</span>
                        {colorTheme === t.key && (
                            <span className="text-xs font-bold text-foreground">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
