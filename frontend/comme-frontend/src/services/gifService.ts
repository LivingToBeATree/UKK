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
    ): Promise<{ results: GifResult[]; hasNext: boolean; total?: number }> => {
        try {
            const res = await api.get('/gifs', {
                params: {
                    q: query.trim(),
                    page,
                    per_page: perPage,
                },
            });

            const data = res.data?.data;
            return {
                results: data?.results || [],
                hasNext: data?.hasNext ?? false,
            };
        } catch {
            return {
                results: [],
                hasNext: false,
            };
        }
    },
};
