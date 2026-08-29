import { api } from './api';
import type { ApiResponse, CommissionService, CommissionOrder, CommissionMessage } from '@/types';

// ── Commission Services (what artists offer) ──
export const commissionServiceApi = {
    list: async (page = 1, params?: Record<string, string>) => {
        const res = await api.get<ApiResponse<CommissionService[]>>('/commission-services', { params: { page, ...params } });
        return res.data;
    },

    show: async (id: number) => {
        const res = await api.get<ApiResponse<CommissionService>>(`/commission-services/${id}`);
        return res.data.data;
    },

    create: async (payload: FormData) => {
        const res = await api.post<ApiResponse<CommissionService>>('/commission-services', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    },

    update: async (id: number, payload: FormData) => {
        payload.append('_method', 'PUT');
        const res = await api.post<ApiResponse<CommissionService>>(`/commission-services/${id}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    },

    destroy: async (id: number) => {
        await api.delete(`/commission-services/${id}`);
    },
};

// ── Commission Orders ──
export const commissionOrderApi = {
    list: async (page = 1, params?: Record<string, string>) => {
        const res = await api.get<ApiResponse<CommissionOrder[]>>('/commissions', { params: { page, ...params } });
        return res.data;
    },

    show: async (id: number) => {
        const res = await api.get<ApiResponse<CommissionOrder>>(`/commissions/${id}`);
        return res.data.data;
    },

    create: async (payload: Record<string, unknown>) => {
        const res = await api.post<ApiResponse<CommissionOrder>>('/commissions', payload);
        return res.data.data;
    },

    update: async (id: number, payload: Record<string, unknown>) => {
        const res = await api.patch<ApiResponse<CommissionOrder>>(`/commissions/${id}`, payload);
        return res.data.data;
    },

    cancel: async (id: number) => {
        const res = await api.patch<ApiResponse<CommissionOrder>>(`/commissions/${id}/cancel`);
        return res.data.data;
    },

    updateDeadline: async (id: number, deadline: string) => {
        const res = await api.patch<ApiResponse<CommissionOrder>>(`/commissions/${id}/deadline`, { deadline });
        return res.data.data;
    },

    // Messages within a commission
    getMessages: async (commissionId: number, page = 1) => {
        const res = await api.get<ApiResponse<CommissionMessage[]>>(`/commissions/${commissionId}/messages`, { params: { page } });
        return res.data;
    },

    sendMessage: async (commissionId: number, payload: FormData) => {
        const res = await api.post<ApiResponse<CommissionMessage>>(`/commissions/${commissionId}/messages`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    },

    // Payment
    initiatePayment: async (commissionId: number) => {
        const res = await api.post<ApiResponse<{ snap_token: string; redirect_url: string }>>(`/commissions/${commissionId}/payment`);
        return res.data.data;
    },
};

// ── Commission Reviews ──
export interface CommissionReview {
    id: number;
    commission_id: number;
    user_id: number;
    rating: number;
    body: string;
    reply?: string | null;
    created_at: string;
}

export const commissionReviewApi = {
    listForArtist: async (artistProfileId: number, page = 1) => {
        const res = await api.get<ApiResponse<CommissionReview[]>>(`/artist-profiles/${artistProfileId}/reviews`, { params: { page } });
        return res.data;
    },

    create: async (commissionId: number, payload: { rating: number; body: string }) => {
        const res = await api.post<ApiResponse<CommissionReview>>(`/commissions/${commissionId}/reviews`, payload);
        return res.data.data;
    },

    update: async (reviewId: number, payload: { rating: number; body: string }) => {
        const res = await api.patch<ApiResponse<CommissionReview>>(`/reviews/${reviewId}`, payload);
        return res.data.data;
    },

    destroy: async (reviewId: number) => {
        await api.delete(`/reviews/${reviewId}`);
    },

    reply: async (reviewId: number, reply: string) => {
        const res = await api.patch<ApiResponse<CommissionReview>>(`/reviews/${reviewId}/reply`, { reply });
        return res.data.data;
    },
};
