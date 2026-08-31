import React, { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { twoFactorService } from '@/services/twoFactorService';
import { AuthContext } from './authContextDef';
import type { User } from '@/types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('comme_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Check active session on app boot
    useEffect(() => {
        const initAuth = async () => {
            try {
                const freshUser = await authService.getMe();
                setUser(freshUser);
                localStorage.setItem('comme_user', JSON.stringify(freshUser));
            } catch {
                setUser(null);
                localStorage.removeItem('comme_user');
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // Login
    const login = async (email: string, password: string) => {
        const res = await authService.login({ email, password });
        if ('requires_2fa' in res && res.requires_2fa) {
            return res;
        }
        const loggedInUser = res as User;
        setUser(loggedInUser);
        localStorage.setItem('comme_user', JSON.stringify(loggedInUser));
        return loggedInUser;
    };

    // Login with 2FA
    const loginWith2FA = async (token: string, code: string) => {
        const loggedInUser = await twoFactorService.loginWithTwoFactor({
            two_factor_token: token,
            code,
        });
        setUser(loggedInUser);
        localStorage.setItem('comme_user', JSON.stringify(loggedInUser));
        return loggedInUser;
    };

    // Confirm Registration OTP
    const confirmRegistration = async (email: string, code: string) => {
        const newUser = await authService.confirmRegistration({ email, code });
        setUser(newUser);
        localStorage.setItem('comme_user', JSON.stringify(newUser));
    };

    // Logout
    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
            localStorage.removeItem('comme_user');
        }
    };

    // Refresh User Profile
    const refreshUser = async () => {
        try {
            const freshUser = await authService.getMe();
            setUser(freshUser);
            localStorage.setItem('comme_user', JSON.stringify(freshUser));
        } catch {
            setUser(null);
            localStorage.removeItem('comme_user');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                loginWith2FA,
                confirmRegistration,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
