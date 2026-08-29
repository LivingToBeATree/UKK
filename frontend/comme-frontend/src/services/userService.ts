import { api } from './api';
import type { ApiResponse, User } from '@/types';

export const userService = {
    updateProfile: async (payload: FormData) => {
        payload.append('_method', 'PATCH');
        const res = await api.post<ApiResponse<User>>('/profile', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    },

    changePassword: async (payload: {
        current_password: string;
        password: string;
        password_confirmation: string;
    }) => {
        const res = await api.put<ApiResponse<{ message: string }>>('/profile/password', payload);
        return res.data;
    },

    logoutOtherDevices: async (password: string) => {
        const res = await api.post<ApiResponse<{ message: string }>>('/logout-other-devices', { password });
        return res.data;
    },

    getByUsername: async (username: string) => {
        const res = await api.get<ApiResponse<User>>(`/users/${username}`);
        return res.data.data;
    },
};
