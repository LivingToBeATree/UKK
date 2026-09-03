import { api } from './api';
import type { ApiResponse } from '@/types';

export interface TagItem {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    posts_count?: number;
    commission_services_count?: number;
    portfolios_count?: number;
}

export const tagService = {
    list: async (params?: { type?: 'posts' | 'services' | 'portfolios'; search?: string; limit?: number }) => {
        const res = await api.get<ApiResponse<TagItem[]>>('/tags', { params });
        return res.data.data;
    },
};
