import { Palette, Sparkles } from 'lucide-react';
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
        { key: 'purple' as const, label: 'Royal Violet', bg: 'bg-[#A802F5]' },
        { key: 'teal' as const, label: 'Neon Teal', bg: 'bg-[#02F5A8]' },
        { key: 'amber' as const, label: 'Solar Amber', bg: 'bg-[#F59E0B]' },
        { key: 'blue' as const, label: 'Electric Cobalt', bg: 'bg-[#2563EB]' },
        { key: 'crimson' as const, label: 'Crimson Ruby', bg: 'bg-[#E11D48]' },
        { key: 'lilac' as const, label: 'Dreamy Lilac', bg: 'bg-[#B899FF]' },
        { key: 'pink' as const, label: 'Cyber Pink', bg: 'bg-[#F43F5E]' },
        { key: 'prism' as const, label: 'Prism Chroma', bg: 'bg-gradient-to-tr from-[#a802f5] via-[#0284f5] to-[#02f5a8]', isSpecial: true },
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
            <DropdownMenuContent align="end" className="min-w-[190px]">
                <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Brand Accent
                </div>
                {themes.map((t) => (
                    <DropdownMenuItem
                        key={t.key}
                        onClick={() => setColorTheme(t.key)}
                        className="flex items-center gap-2.5 cursor-pointer text-xs"
                    >
                        <span className={`h-3.5 w-3.5 rounded-full ${t.bg} ring-1 ring-border shrink-0`} />
                        <span className="flex-1 font-medium">{t.label}</span>
                        {t.isSpecial && <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />}
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
                        className="h-3.5 w-3.5 rounded-full ring-1 ring-border shrink-0"
                        style={{ backgroundColor: colorTheme === 'custom' ? customColor : '#b899ff' }}
                    />
                    <span>{colorTheme === 'custom' ? 'Custom Accent' : 'Custom Color Picker...'}</span>
                    {colorTheme === 'custom' && <span className="text-xs font-bold text-primary ml-auto">✓</span>}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
