import { createContext } from 'react';

export type ColorTheme = 'purple' | 'teal' | 'orange';

export interface ColorThemeContextType {
    colorTheme: ColorTheme;
    setColorTheme: (color: ColorTheme) => void;
}

export const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);
