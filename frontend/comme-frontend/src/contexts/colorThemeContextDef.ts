import { createContext } from 'react';

export type ColorTheme =
    | 'purple'
    | 'teal'
    | 'amber'
    | 'blue'
    | 'crimson'
    | 'lilac'
    | 'pink'
    | 'prism'
    | 'custom';

export interface ColorThemeContextType {
    colorTheme: ColorTheme;
    customColor: string;
    setColorTheme: (color: ColorTheme) => void;
    setCustomColor: (hex: string) => void;
}

export const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);
