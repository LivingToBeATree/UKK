import { createContext } from 'react';
import type { User } from '@/types';

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User | { requires_2fa: true; two_factor_token: string }>;
    loginWith2FA: (token: string, code: string) => Promise<User>;
    confirmRegistration: (email: string, code: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
