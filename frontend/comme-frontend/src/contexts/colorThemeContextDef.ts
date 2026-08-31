import { createContext } from 'react';

export type ColorTheme =
    | 'purple'
    | 'teal'
    | 'orange'
    | 'blue'
    | 'rose'
    | 'emerald'
    | 'magenta'
    | 'gold'
    | 'custom';

export interface ColorThemeContextType {
    colorTheme: ColorTheme;
    customColor: string;
    setColorTheme: (color: ColorTheme) => void;
    setCustomColor: (hex: string) => void;
}

export const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);
