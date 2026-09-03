import { api } from './api';
import type { ApiResponse, User } from '@/types';

export const userService = {
    uploadMedia: async (file: File, isThumbnail = false) => {
        const formData = new FormData();
        formData.append('file', file);
        if (isThumbnail) formData.append('is_thumbnail', '1');
        const res = await api.post<ApiResponse<{ id: number; url: string; file_name: string }>>('/media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    },

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

    getSessions: async () => {
        const res = await api.get<ApiResponse<Array<{
            id: string;
            ip_address: string | null;
            user_agent: string | null;
            last_activity: string;
            is_current: boolean;
        }>>>('/profile/sessions');
        return res.data.data;
    },

    revokeSession: async (sessionId: string) => {
        const res = await api.delete<ApiResponse<{ message: string }>>(`/profile/sessions/${sessionId}`);
        return res.data;
    },

    deleteAccount: async (password: string) => {
        const res = await api.delete<ApiResponse<{ message: string }>>('/account', {
            data: { password },
        });
        return res.data;
    },

    acknowledgeWarning: async () => {
        const res = await api.post<ApiResponse<User>>('/profile/acknowledge-warning');
        return res.data.data;
    },
};
