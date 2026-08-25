import React, { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { AuthContext } from './authContextDef';
import type { User } from '@/types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('comme_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('comme_token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Sync user profile on mount if token exists
    useEffect(() => {
        const initAuth = async () => {
        const storedToken = localStorage.getItem('comme_token');
        if (storedToken) {
            try {
            const freshUser = await authService.getMe();
            setUser(freshUser);
            localStorage.setItem('comme_user', JSON.stringify(freshUser));
            } catch {
            localStorage.removeItem('comme_token');
            localStorage.removeItem('comme_user');
            setToken(null);
            setUser(null);
            }
        }
        setIsLoading(false);
        };

        initAuth();
    }, []);

    // Login
    const login = async (email: string, password: string) => {
        const res = await authService.login({ email, password });
        const { token: newToken, user: loggedInUser } = res.data;

        setToken(newToken);
        setUser(loggedInUser);
        localStorage.setItem('comme_token', newToken);
        localStorage.setItem('comme_user', JSON.stringify(loggedInUser));
    };

    // Confirm Registration OTP
    const confirmRegistration = async (email: string, code: string) => {
        const res = await authService.confirmRegistration({ email, code });
        const { token: newToken, user: newUser } = res.data;

        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('comme_token', newToken);
        localStorage.setItem('comme_user', JSON.stringify(newUser));
    };

    // Logout
    const logout = async () => {
        try {
        await authService.logout();
        } catch {
        // Ignore network errors on logout
        } finally {
        setToken(null);
        setUser(null);
        localStorage.removeItem('comme_token');
        localStorage.removeItem('comme_user');
        }
    };

    // Refresh User Profile
    const refreshUser = async () => {
        if (!token) return;
        const freshUser = await authService.getMe();
        setUser(freshUser);
        localStorage.setItem('comme_user', JSON.stringify(freshUser));
    };

    return (
        <AuthContext.Provider
        value={{
            user,
            token,
            isAuthenticated: !!token && !!user,
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
