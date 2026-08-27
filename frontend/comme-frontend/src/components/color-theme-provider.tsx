import React, { useEffect, useState } from 'react';
import { ColorThemeContext, type ColorTheme } from '@/contexts/colorThemeContextDef';

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
    const [colorTheme, setColorTheme] = useState<ColorTheme>(
        () => (localStorage.getItem('comme-color-theme') as ColorTheme) || 'purple'
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-color-theme', colorTheme);
        localStorage.setItem('comme-color-theme', colorTheme);
    }, [colorTheme]);

    return (
        <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
            {children}
        </ColorThemeContext.Provider>
    );
}
