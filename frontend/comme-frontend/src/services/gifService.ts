export interface GifResult {
    id: string;
    title: string;
    url: string;
    previewUrl: string;
    width?: number;
    height?: number;
    category?: string;
    source: 'klipy' | 'giphy' | 'curated';
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

// Curated library as instant fallback
export const FALLBACK_CURATED_GIFS: GifResult[] = [
    // --- ANIME ---
    {
        id: 'a1',
        title: 'Anya Heh Smug',
        url: 'https://media.giphy.com/media/FWAcpJsFT9mVRv0e7a/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/FWAcpJsFT9mVRv0e7a/giphy.gif',
        category: 'anime',
        source: 'curated',
    },
    {
        id: 'a2',
        title: 'Cat Vibe Jam',
        url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif',
        category: 'anime',
        source: 'curated',
    },
    {
        id: 'a3',
        title: 'Chika Fujiwara Dance',
        url: 'https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif',
        category: 'anime',
        source: 'curated',
    },
    {
        id: 'a4',
        title: 'Ghibli Aesthetic Cooking',
        url: 'https://media.giphy.com/media/12zV7u6Bh0vHpu/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/12zV7u6Bh0vHpu/giphy.gif',
        category: 'anime',
        source: 'curated',
    },
    {
        id: 'a5',
        title: 'Lofi Girl Studying',
        url: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
        category: 'anime',
        source: 'curated',
    },
    {
        id: 'a6',
        title: 'Sailor Moon Transformation',
        url: 'https://media.giphy.com/media/26gBjmGEsrFQlj8g8/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/26gBjmGEsrFQlj8g8/giphy.gif',
        category: 'anime',
        source: 'curated',
    },
    {
        id: 'a7',
        title: 'Pikachu Excited',
        url: 'https://media.giphy.com/media/6nWhy3ulBL7GSCvKw6/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/6nWhy3ulBL7GSCvKw6/giphy.gif',
        category: 'anime',
        source: 'curated',
    },
    {
        id: 'a8',
        title: 'Naruto Thumbs Up',
        url: 'https://media.giphy.com/media/Do5GRTYRIhSFy/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/Do5GRTYRIhSFy/giphy.gif',
        category: 'anime',
        source: 'curated',
    },

    // --- ART & CREATIVE ---
    {
        id: 'art1',
        title: 'Digital Painting Canvas Loop',
        url: 'https://media.giphy.com/media/L1R1tvI9svkIWwpVYr/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/L1R1tvI9svkIWwpVYr/giphy.gif',
        category: 'art',
        source: 'curated',
    },
    {
        id: 'art2',
        title: 'Pixel Art Cyberpunk City',
        url: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
        category: 'art',
        source: 'curated',
    },
    {
        id: 'art3',
        title: 'Watercolor Flower Bloom',
        url: 'https://media.giphy.com/media/l0HlFTxWpNs61q8g0/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/l0HlFTxWpNs61q8g0/giphy.gif',
        category: 'art',
        source: 'curated',
    },
    {
        id: 'art4',
        title: 'Glitch Vaporwave Statue',
        url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
        category: 'art',
        source: 'curated',
    },
    {
        id: 'art5',
        title: 'Animated 3D Abstract Loop',
        url: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
        category: 'art',
        source: 'curated',
    },

    // --- REACTIONS ---
    {
        id: 'r1',
        title: 'Mind Blown Galaxy',
        url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
        category: 'reaction',
        source: 'curated',
    },
    {
        id: 'r2',
        title: 'Leonardo DiCaprio Cheers',
        url: 'https://media.giphy.com/media/GCLlQnV7dXY2KGmpRh/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/GCLlQnV7dXY2KGmpRh/giphy.gif',
        category: 'reaction',
        source: 'curated',
    },
    {
        id: 'r3',
        title: 'Popcat Popping',
        url: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif',
        category: 'reaction',
        source: 'curated',
    },
    {
        id: 'r4',
        title: 'Fire Elmo Chaos',
        url: 'https://media.giphy.com/media/yr7n0u3qzO9nG/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/yr7n0u3qzO9nG/giphy.gif',
        category: 'reaction',
        source: 'curated',
    },
    {
        id: 'r5',
        title: 'Excited Kermit Flail',
        url: 'https://media.giphy.com/media/dpqQNluWFaSpq/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/dpqQNluWFaSpq/giphy.gif',
        category: 'reaction',
        source: 'curated',
    },
    {
        id: 'r6',
        title: 'Confused John Travolta',
        url: 'https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy.gif',
        category: 'reaction',
        source: 'curated',
    },

    // --- GAMING ---
    {
        id: 'g1',
        title: 'Minecraft Diamond Rave',
        url: 'https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif',
        category: 'gaming',
        source: 'curated',
    },
    {
        id: 'g2',
        title: 'Victory Royale Dance',
        url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
        category: 'gaming',
        source: 'curated',
    },
    {
        id: 'g3',
        title: 'Zelda Chest Opening',
        url: 'https://media.giphy.com/media/5wFS6a1PE62lKUWXyx/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/5wFS6a1PE62lKUWXyx/giphy.gif',
        category: 'gaming',
        source: 'curated',
    },
];

export const gifService = {
    /**
     * Search GIFs using KLIPY API with fallback to Curated Collection
     */
    searchGifs: async (
        query: string,
        category: string = 'all',
        page: number = 1
    ): Promise<{ results: GifResult[]; provider: 'klipy' | 'curated' }> => {
        const klipyKey = getActiveKlipyKey();

        // 1. Try Live KLIPY API if key is available
        if (klipyKey) {
            try {
                const endpoint = query.trim()
                    ? `https://api.klipy.com/api/v1/${klipyKey}/gifs/search?q=${encodeURIComponent(query)}&page=${page}&per_page=24`
                    : `https://api.klipy.com/api/v1/${klipyKey}/gifs/trending?page=${page}&per_page=24`;

                const res = await fetch(endpoint);
                if (res.ok) {
                    const data = await res.json();
                    const items = data.data || data.results || [];
                    if (Array.isArray(items) && items.length > 0) {
                        const parsed: GifResult[] = items.map((item: any) => {
                            const original = item.images?.original?.url || item.url || item.media?.gif?.url || '';
                            const preview = item.images?.fixed_width?.url || item.images?.preview_gif?.url || original;
                            return {
                                id: String(item.id || Math.random()),
                                title: item.title || item.name || query || 'GIF',
                                url: original,
                                previewUrl: preview,
                                source: 'klipy',
                            };
                        });
                        return { results: parsed, provider: 'klipy' };
                    }
                }
            } catch {
                // Fallback to local curated
            }
        }

        // 2. Curated Library Fallback
        const cleanQuery = query.toLowerCase().trim();
        const filtered = FALLBACK_CURATED_GIFS.filter((gif) => {
            const matchesCategory = category === 'all' || gif.category === category;
            const matchesQuery = !cleanQuery || gif.title.toLowerCase().includes(cleanQuery);
            return matchesCategory && matchesQuery;
        });

        return { results: filtered, provider: 'curated' };
    },
};
