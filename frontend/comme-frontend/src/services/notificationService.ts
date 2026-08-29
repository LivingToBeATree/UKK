import { api } from './api';
import type { ApiResponse, AppNotification, UnreadNotificationCount } from '@/types';

export const notificationService = {
    list: async (page = 1) => {
        const res = await api.get<ApiResponse<AppNotification[]>>('/notifications', { params: { page } });
        return res.data;
    },

    unreadCount: async () => {
        const res = await api.get<ApiResponse<UnreadNotificationCount>>('/notifications/unread-count');
        return res.data.data;
    },

    markAsRead: async (id: string | number) => {
        const res = await api.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`);
        return res.data.data;
    },

    markAllAsRead: async () => {
        await api.patch('/notifications/read-all');
    },

    destroy: async (id: string | number) => {
        await api.delete(`/notifications/${id}`);
    },
};
