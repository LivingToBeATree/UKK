import React, { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
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
        const loggedInUser = await authService.login({ email, password });
        setUser(loggedInUser);
        localStorage.setItem('comme_user', JSON.stringify(loggedInUser));
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
                confirmRegistration,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
