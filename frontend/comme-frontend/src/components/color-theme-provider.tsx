import React, { useEffect, useState } from 'react';
import { ColorThemeContext, type ColorTheme } from '@/contexts/colorThemeContextDef';

function getContrastForeground(hex: string): string {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return '#ffffff';
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? '#09090b' : '#ffffff';
}

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
    const [colorTheme, setColorTheme] = useState<ColorTheme>(
        () => (localStorage.getItem('comme-color-theme') as ColorTheme) || 'purple'
    );
    const [customColor, setCustomColorState] = useState<string>(
        () => localStorage.getItem('comme-custom-color') || '#8b5cf6'
    );

    const setCustomColor = (hex: string) => {
        setCustomColorState(hex);
        localStorage.setItem('comme-custom-color', hex);
        if (colorTheme === 'custom') {
            applyCustomColor(hex);
        }
    };

    const applyCustomColor = (hex: string) => {
        const root = document.documentElement;
        root.style.setProperty('--primary', hex);
        root.style.setProperty('--ring', hex);
        root.style.setProperty('--primary-foreground', getContrastForeground(hex));
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-color-theme', colorTheme);
        localStorage.setItem('comme-color-theme', colorTheme);

        if (colorTheme === 'custom') {
            applyCustomColor(customColor);
        } else {
            const root = document.documentElement;
            root.style.removeProperty('--primary');
            root.style.removeProperty('--ring');
            root.style.removeProperty('--primary-foreground');
        }
    }, [colorTheme, customColor]);

    return (
        <ColorThemeContext.Provider value={{ colorTheme, setColorTheme, customColor, setCustomColor }}>
            {children}
        </ColorThemeContext.Provider>
    );
}
