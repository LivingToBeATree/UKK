import { createContext } from 'react';

export type AuthModalIntent =
    | 'bookmark'
    | 'like'
    | 'comment'
    | 'commission'
    | 'follow'
    | 'message'
    | 'studio'
    | 'generic';

export interface AuthModalConfig {
    intent?: AuthModalIntent;
    title?: string;
    subtitle?: string;
    images?: string[];
    checklist?: string[];
    redirectUrl?: string;
    primaryCtaText?: string;
}

export interface AuthModalContextType {
    isOpen: boolean;
    config: AuthModalConfig;
    openAuthModal: (config?: AuthModalConfig | AuthModalIntent) => void;
    closeAuthModal: () => void;
    requireAuth: (config?: AuthModalConfig | AuthModalIntent, onAuthorized?: () => void) => boolean;
}

export const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);
