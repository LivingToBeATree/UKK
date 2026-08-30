import { useContext } from 'react';
import { ColorThemeContext, type ColorTheme } from '@/contexts/colorThemeContextDef';

export type { ColorTheme };

export const useColorTheme = () => {
    const context = useContext(ColorThemeContext);
    if (!context) {
        throw new Error('useColorTheme must be used within ColorThemeProvider');
    }
    return context;
};
