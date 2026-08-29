import { api } from './api';
import type { ApiResponse, Report } from '@/types';

export const reportService = {
    list: async (page = 1, params?: Record<string, string>) => {
        const res = await api.get<ApiResponse<Report[]>>('/reports', { params: { page, ...params } });
        return res.data;
    },

    show: async (id: number) => {
        const res = await api.get<ApiResponse<Report>>(`/reports/${id}`);
        return res.data.data;
    },

    create: async (payload: { reportable_type: string; reportable_id: number; reason: string }) => {
        const res = await api.post<ApiResponse<Report>>('/reports', payload);
        return res.data.data;
    },

    update: async (id: number, payload: { status: string }) => {
        const res = await api.patch<ApiResponse<Report>>(`/reports/${id}`, payload);
        return res.data.data;
    },
};
