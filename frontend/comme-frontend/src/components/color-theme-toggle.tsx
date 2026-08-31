import { Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useColorTheme } from '@/hooks/useColorTheme';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from './ui/dropdown-menu';

export function ColorThemeToggle() {
    const { colorTheme, setColorTheme, customColor } = useColorTheme();
    const navigate = useNavigate();

    const themes = [
        { key: 'purple' as const, label: 'Royal Purple', bg: 'bg-[#A802F5]' },
        { key: 'teal' as const, label: 'Neon Teal', bg: 'bg-[#02F5A8]' },
        { key: 'orange' as const, label: 'Solar Orange', bg: 'bg-[#F5AA02]' },
        { key: 'blue' as const, label: 'Electric Blue', bg: 'bg-[#0284F5]' },
        { key: 'rose' as const, label: 'Crimson Rose', bg: 'bg-[#F5025A]' },
        { key: 'emerald' as const, label: 'Emerald Jade', bg: 'bg-[#10B981]' },
        { key: 'magenta' as const, label: 'Sunset Magenta', bg: 'bg-[#EC4899]' },
        { key: 'gold' as const, label: 'Cyber Gold', bg: 'bg-[#EAB308]' },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Select accent color theme" className="cursor-pointer">
                    <div className="relative flex items-center justify-center">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span
                            className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full ring-1 ring-background bg-primary"
                        />
                    </div>
                    <span className="sr-only">Color Theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
                <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Brand Accent
                </div>
                {themes.map((t) => (
                    <DropdownMenuItem
                        key={t.key}
                        onClick={() => setColorTheme(t.key)}
                        className="flex items-center gap-2.5 cursor-pointer text-xs"
                    >
                        <span className={`h-3 w-3 rounded-full ${t.bg} ring-1 ring-border`} />
                        <span className="flex-1">{t.label}</span>
                        {colorTheme === t.key && (
                            <span className="text-xs font-bold text-primary">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold"
                >
                    <span
                        className="h-3 w-3 rounded-full ring-1 ring-border"
                        style={{ backgroundColor: colorTheme === 'custom' ? customColor : '#a802f5' }}
                    />
                    <span>{colorTheme === 'custom' ? 'Custom Accent' : 'Custom Color Picker...'}</span>
                    {colorTheme === 'custom' && <span className="text-xs font-bold text-primary ml-auto">✓</span>}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
