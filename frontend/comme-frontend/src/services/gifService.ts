export interface GifResult {
    id: string;
    title: string;
    url: string;
    previewUrl: string;
    width?: number;
    height?: number;
    source: 'klipy';
}

const STORAGE_KLIPY_KEY = 'comme_klipy_api_key';

// Check environment variable or localStorage key
export const getActiveKlipyKey = (): string => {
    return (
        import.meta.env.VITE_KLIPY_API_KEY ||
        localStorage.getItem(STORAGE_KLIPY_KEY) ||
        ''
    );
};

export const setStoredKlipyKey = (key: string) => {
    if (key.trim()) {
        localStorage.setItem(STORAGE_KLIPY_KEY, key.trim());
    } else {
        localStorage.removeItem(STORAGE_KLIPY_KEY);
    }
};

export const gifService = {
    /**
     * Search GIFs using live KLIPY API
     */
    searchGifs: async (
        query: string,
        page: number = 1
    ): Promise<{ results: GifResult[]; hasNext: boolean; total?: number }> => {
        const klipyKey = getActiveKlipyKey();

        if (!klipyKey) {
            return { results: [], hasNext: false };
        }

        const isSearch = Boolean(query && query.trim());
        const endpoint = isSearch
            ? `https://api.klipy.com/api/v1/${klipyKey}/gifs/search?q=${encodeURIComponent(query.trim())}&page=${page}&per_page=24`
            : `https://api.klipy.com/api/v1/${klipyKey}/gifs/trending?page=${page}&per_page=24`;

        const res = await fetch(endpoint);
        if (!res.ok) {
            throw new Error(`KLIPY API error: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        const rawItems = json.data?.data || (Array.isArray(json.data) ? json.data : []);

        const parsed: GifResult[] = rawItems
            .map((item: any) => {
                const files = item.files || {};
                const gifFile = files.gif || files.webp || files.mp4 || {};
                const gifUrl = gifFile.url || item.url || '';

                if (!gifUrl) return null;

                return {
                    id: String(item.id || Math.random()),
                    title: item.title || item.slug || query || 'GIF',
                    url: gifUrl,
                    previewUrl: gifUrl,
                    width: gifFile.width,
                    height: gifFile.height,
                    source: 'klipy' as const,
                };
            })
            .filter(Boolean) as GifResult[];

        return {
            results: parsed,
            hasNext: Boolean(json.data?.has_next),
            total: json.data?.total,
        };
    },
};
