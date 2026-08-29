import { api } from './api';
import type { ApiResponse, ArtistProfile, ArtistApplication } from '@/types';

// ── Artist Profiles ──
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

// ── Artist Applications ──
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

    create: async (payload: { portfolio_url: string; social_links?: string[]; note?: string }) => {
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

// ── Portfolios ──
export interface Portfolio {
    id: number;
    artist_profile_id: number;
    title: string;
    description?: string | null;
    created_at: string;
    media?: { id: number; url: string; alt_text?: string }[];
}

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
};

// ── Follows ──
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
