import { api } from './api';
import type {
    ApiResponse,
    AuthResponse,
    PendingRegistrationResponse,
    User
} from '@/types';

export const authService = {
    // Initial Register (Sends 6-digit OTP to email)
    register: async (payload: {
        email: string;
        username: string;
        password: string;
        password_confirmation: string;
    }) => {
        const res = await api.post<ApiResponse<PendingRegistrationResponse>>('/register', payload);
        return res.data;
    },

    // Confirm OTP (Creates verified user & returns token)
    confirmRegistration: async (payload: {
        email: string;
        code: string;
    }) => {
        const res = await api.post<ApiResponse<AuthResponse>>('/register/confirm', payload)
        return res.data
    },

    // Login
    login: async (payload: {
        email: string;
        password: string;
    }) => {
        const res = await api.post<ApiResponse<AuthResponse>>('/login', payload)
        return res.data
    },

    // Get Current User Profile (/api/me)
    getMe: async () => {
        const res = await api.get<ApiResponse<User>>('/me')
        return res.data.data
    },

    // logout
    logout: async () => {
        const res = await api.post<ApiResponse<{ message: string }>>('/logout')
        return res.data
    },

    // Forgot Password (OTP link)
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