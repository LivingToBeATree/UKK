import { useContext } from 'react';
import { ColorThemeContext } from '@/contexts/colorThemeContextDef';

export const useColorTheme = () => {
    const context = useContext(ColorThemeContext);
    if (!context) {
        throw new Error('useColorTheme must be used within ColorThemeProvider');
    }
    return context;
};
