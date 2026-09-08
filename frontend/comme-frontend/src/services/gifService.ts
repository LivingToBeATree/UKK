import { api } from './api';

export interface GifResult {
    id: string;
    title: string;
    url: string;
    previewUrl: string;
    width?: number;
    height?: number;
    source: 'klipy';
}

export const gifService = {
    /**
     * Search GIFs securely via backend proxy endpoint.
     * The private API key is kept safely on the server.
     */
    searchGifs: async (
        query: string = '',
        page: number = 1,
        perPage: number = 24
    ): Promise<{ results: GifResult[]; hasNext: boolean; total?: number; message?: string; configured?: boolean }> => {
        try {
            const res = await api.get('/gifs', {
                params: {
                    q: query.trim(),
                    page,
                    per_page: perPage,
                },
            });

            const data = res.data?.data;
            const message = res.data?.message;
            const isConfigured = !message || !message.toLowerCase().includes('not configured');

            return {
                results: data?.results || [],
                hasNext: data?.hasNext ?? false,
                message,
                configured: isConfigured,
            };
        } catch (err: any) {
            return {
                results: [],
                hasNext: false,
                message: err?.response?.data?.message || err?.message || 'Failed to connect to GIF service',
                configured: false,
            };
        }
    },
};
