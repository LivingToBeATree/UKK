import { api } from './api';
import type { ApiResponse, ArtistProfile, ArtistApplication, ArtistPayoutAccount, CommissionReview, Portfolio } from '@/types';
export type { Portfolio };

// Artist Payout Account (Iris / Bank)
export const artistPayoutApi = {
    get: async () => {
        const res = await api.get<ApiResponse<ArtistPayoutAccount | null>>('/me/payout-account');
        return res.data.data;
    },

    update: async (payload: { bank_name: string; bank_account_name: string; bank_account_number: string }) => {
        const res = await api.put<ApiResponse<ArtistPayoutAccount>>('/me/payout-account', payload);
        return res.data.data;
    },

    destroy: async () => {
        await api.delete('/me/payout-account');
    },
};

// Artist Reviews
export const artistReviewApi = {
    listByArtist: async (artistProfileId: number, page = 1) => {
        const res = await api.get<ApiResponse<CommissionReview[]>>(`/artist-profiles/${artistProfileId}/reviews`, {
            params: { page },
        });
        return res.data;
    },

    reply: async (reviewId: number, artist_reply: string) => {
        const res = await api.patch<ApiResponse<CommissionReview>>(`/reviews/${reviewId}/reply`, {
            artist_reply,
        });
        return res.data.data;
    },
};

// Artist profiles
export const artistProfileApi = {
    list: async (page = 1, params?: Record<string, string>) => {
        const res = await api.get<ApiResponse<ArtistProfile[]>>('/artist-profiles', { params: { page, ...params } });
        return res.data;
    },

    show: async (id: number) => {
        const res = await api.get<ApiResponse<ArtistProfile>>(`/artist-profiles/${id}`);
        return res.data.data;
    },

    update: async (id: number, payload: Record<string, unknown>) => {
        const res = await api.put<ApiResponse<ArtistProfile>>(`/artist-profiles/${id}`, payload);
        return res.data.data;
    },
};

// Artist applications
export const artistApplicationApi = {
    list: async (page = 1) => {
        const res = await api.get<ApiResponse<ArtistApplication[]>>('/artist-applications', { params: { page } });
        return res.data;
    },

    show: async (id: number) => {
        const res = await api.get<ApiResponse<ArtistApplication>>(`/artist-applications/${id}`);
        return res.data.data;
    },

    myApplication: async () => {
        const res = await api.get<ApiResponse<ArtistApplication>>('/artist-applications/my-application');
        return res.data.data;
    },

    create: async (payload: {
        bio: string;
        portfolio_links: string[];
        website?: string;
        social_links?: string[];
        note?: string;
    }) => {
        const res = await api.post<ApiResponse<ArtistApplication>>('/artist-applications', payload);
        return res.data.data;
    },

    approve: async (id: number) => {
        const res = await api.post<ApiResponse<ArtistApplication>>(`/artist-applications/${id}/approve`);
        return res.data.data;
    },

    reject: async (id: number, rejection_reason: string) => {
        const res = await api.post<ApiResponse<ArtistApplication>>(`/artist-applications/${id}/reject`, { rejection_reason });
        return res.data.data;
    },
};

// Portfolios
export const portfolioApi = {
    list: async (page = 1) => {
        const res = await api.get<ApiResponse<Portfolio[]>>('/portfolios', { params: { page } });
        return res.data;
    },

    show: async (id: number) => {
        const res = await api.get<ApiResponse<Portfolio>>(`/portfolios/${id}`);
        return res.data.data;
    },

    create: async (payload: FormData) => {
        const res = await api.post<ApiResponse<Portfolio>>('/portfolios', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    },

    update: async (id: number, payload: FormData) => {
        payload.append('_method', 'PUT');
        const res = await api.post<ApiResponse<Portfolio>>(`/portfolios/${id}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    },

    destroy: async (id: number) => {
        await api.delete(`/portfolios/${id}`);
    },

    toggleStar: async (id: number, starred: boolean) => {
        const formData = new FormData();
        formData.append('starred', starred ? '1' : '0');
        formData.append('_method', 'PUT');
        const res = await api.post<ApiResponse<Portfolio>>(`/portfolios/${id}`, formData);
        return res.data.data;
    },
};

// Follows
export const followApi = {
    toggle: async (userId: number) => {
        const res = await api.post<ApiResponse<{ following: boolean }>>(`/users/${userId}/follow`);
        return res.data.data;
    },

    getFollowers: async (userId: number, page = 1) => {
        const res = await api.get<ApiResponse<unknown[]>>(`/users/${userId}/followers`, { params: { page } });
        return res.data;
    },

    getFollowing: async (userId: number, page = 1) => {
        const res = await api.get<ApiResponse<unknown[]>>(`/users/${userId}/following`, { params: { page } });
        return res.data;
    },
};
