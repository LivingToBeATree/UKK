import React, { useEffect, useState, useCallback } from 'react';
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

const DEFAULT_PRIMARY = '#A802F5';

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
    const [customColor, setCustomColorState] = useState<string>(() => {
        try {
            return localStorage.getItem('comme-custom-color') || DEFAULT_PRIMARY;
        } catch {
            return DEFAULT_PRIMARY;
        }
    });

    const applyColor = useCallback((hex: string) => {
        const root = document.documentElement;
        if (!hex || hex.toUpperCase() === DEFAULT_PRIMARY.toUpperCase()) {
            root.style.removeProperty('--primary');
            root.style.removeProperty('--ring');
            root.style.removeProperty('--primary-foreground');
        } else {
            root.style.setProperty('--primary', hex);
            root.style.setProperty('--ring', hex);
            root.style.setProperty('--primary-foreground', getContrastForeground(hex));
        }
    }, []);

    const setCustomColor = useCallback((hex: string) => {
        setCustomColorState(hex);
        try {
            localStorage.setItem('comme-custom-color', hex);
        } catch {
            // Ignore
        }
        applyColor(hex);
    }, [applyColor]);

    useEffect(() => {
        // Clean up legacy multi-theme keys
        try {
            localStorage.removeItem('comme-color-theme');
        } catch {
            // Ignore
        }
        document.documentElement.removeAttribute('data-color-theme');
        applyColor(customColor);
    }, [customColor, applyColor]);

    return (
        <ColorThemeContext.Provider
            value={{
                colorTheme: (customColor.toUpperCase() === DEFAULT_PRIMARY.toUpperCase() ? 'purple' : 'custom') as ColorTheme,
                setColorTheme: () => {},
                customColor,
                setCustomColor,
            }}
        >
            {children}
        </ColorThemeContext.Provider>
    );
}
