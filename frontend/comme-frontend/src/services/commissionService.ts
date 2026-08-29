import { api } from './api';
import type {
    ApiResponse,
    CommissionService,
    CommissionOrder,
    CommissionMessage,
    CommissionReview,
    CommissionPayment,
} from '@/types';

export type { CommissionReview };

// Commission services
export const commissionServiceApi = {
    list: async (page = 1, params?: Record<string, string | number>) => {
        const res = await api.get<ApiResponse<CommissionService[]>>('/commission-services', { params: { page, ...params } });
        return res.data;
    },

    show: async (id: number) => {
        const res = await api.get<ApiResponse<CommissionService>>(`/commission-services/${id}`);
        return res.data.data;
    },

    create: async (payload: FormData | Record<string, unknown>) => {
        const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        const res = await api.post<ApiResponse<CommissionService>>('/commission-services', payload, { headers });
        return res.data.data;
    },

    update: async (id: number, payload: FormData | Record<string, unknown>) => {
        if (payload instanceof FormData) {
            payload.append('_method', 'PUT');
            const res = await api.post<ApiResponse<CommissionService>>(`/commission-services/${id}`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data.data;
        }
        const res = await api.put<ApiResponse<CommissionService>>(`/commission-services/${id}`, payload);
        return res.data.data;
    },

    destroy: async (id: number) => {
        await api.delete(`/commission-services/${id}`);
    },
};

// Commission orders
export const commissionOrderApi = {
    list: async (page = 1, params?: Record<string, string | number>) => {
        const res = await api.get<ApiResponse<CommissionOrder[]>>('/commissions', { params: { page, ...params } });
        return res.data;
    },

    show: async (id: number) => {
        const res = await api.get<ApiResponse<CommissionOrder>>(`/commissions/${id}`);
        return res.data.data;
    },

    create: async (payload: {
        commission_service_id: number;
        commission_option_id?: number | null;
        description: string;
        deadline?: string | null;
    }) => {
        const res = await api.post<ApiResponse<CommissionOrder>>('/commissions', payload);
        return res.data.data;
    },

    update: async (id: number, payload: { status?: string; description?: string }) => {
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

    sendMessage: async (commissionId: number, payload: FormData | { message: string }) => {
        const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        const res = await api.post<ApiResponse<CommissionMessage>>(`/commissions/${commissionId}/messages`, payload, {
            headers,
        });
        return res.data.data;
    },

    // Payment initiation with Midtrans Snap
    initiatePayment: async (commissionId: number) => {
        const res = await api.post<ApiResponse<CommissionPayment>>(`/commissions/${commissionId}/payment`);
        return res.data.data;
    },
};

// Commission reviews
export const commissionReviewApi = {
    listForArtist: async (artistProfileId: number, page = 1) => {
        const res = await api.get<ApiResponse<CommissionReview[]>>(`/artist-profiles/${artistProfileId}/reviews`, { params: { page } });
        return res.data;
    },

    create: async (
        commissionId: number,
        payload: { rating: number; title?: string; comment: string; recommended?: boolean }
    ) => {
        const res = await api.post<ApiResponse<CommissionReview>>(`/commissions/${commissionId}/reviews`, {
            rating: payload.rating,
            title: payload.title || undefined,
            comment: payload.comment,
            recommended: payload.recommended ?? true,
        });
        return res.data.data;
    },

    update: async (
        reviewId: number,
        payload: { rating?: number; title?: string; comment?: string; recommended?: boolean }
    ) => {
        const res = await api.patch<ApiResponse<CommissionReview>>(`/reviews/${reviewId}`, payload);
        return res.data.data;
    },

    destroy: async (reviewId: number) => {
        await api.delete(`/reviews/${reviewId}`);
    },

    reply: async (reviewId: number, artist_reply: string) => {
        const res = await api.patch<ApiResponse<CommissionReview>>(`/reviews/${reviewId}/reply`, { artist_reply });
        return res.data.data;
    },
};
