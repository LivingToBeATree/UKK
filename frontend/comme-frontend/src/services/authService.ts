import { api } from './api';
import type { ApiResponse, User } from '@/types';

export const authService = {
    // Initial Register (Sends 6-digit OTP code to email)
    register: async (payload: {
        email: string;
        username: string;
        password: string;
        password_confirmation: string;
    }) => {
        const res = await api.post<ApiResponse<null>>('/register', payload);
        return res.data;
    },

    // Confirm Registration OTP (Logs in via session cookie and returns User)
    confirmRegistration: async (payload: { email: string; code: string }) => {
        const res = await api.post<ApiResponse<User>>('/register/confirm', payload);
        return res.data.data;
    },

    // Login (Logs in via session cookie and returns User)
    login: async (payload: { email: string; password: string }) => {
        const res = await api.post<ApiResponse<User>>('/login', payload);
        return res.data.data;
    },

    // Get Current User (/api/me)
    getMe: async () => {
        const res = await api.get<ApiResponse<User>>('/me');
        return res.data.data;
    },

    // Logout (Destroys session cookie)
    logout: async () => {
        const res = await api.post<ApiResponse<{ message: string }>>('/logout');
        return res.data;
    },

    // Forgot Password
    forgotPassword: async (email: string) => {
        const res = await api.post<ApiResponse<{ message: string }>>('/forgot-password', { email });
        return res.data;
    },

    // Reset Password
    resetPassword: async (payload: {
        token: string;
        email: string;
        password: string;
        password_confirmation: string;
    }) => {
        const res = await api.post<ApiResponse<{ message: string }>>('/reset-password', payload);
        return res.data;
    },
};