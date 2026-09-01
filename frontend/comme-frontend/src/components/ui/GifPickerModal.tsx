import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
    Search,
    X,
    Sparkles,
    Link as LinkIcon,
    Flame,
    Tv,
    Smile,
    Gamepad2,
    Palette,
    Check,
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

export interface GifItem {
    id: string;
    title: string;
    url: string;
    previewUrl: string;
    category: 'anime' | 'art' | 'reaction' | 'gaming' | 'trending';
    tags: string[];
}

// Rich, curated collection of animated GIFs
const CURATED_GIFS: GifItem[] = [
    // --- ANIME & MANGA ---
    {
        id: 'a1',
        title: 'Anya Heh Smug',
        url: 'https://media.giphy.com/media/FWAcpJsFT9mVRv0e7a/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/FWAcpJsFT9mVRv0e7a/giphy.gif',
        category: 'anime',
        tags: ['anime', 'anya', 'smug', 'heh', 'spy x family', 'cute', 'funny'],
    },
    {
        id: 'a2',
        title: 'Cat Vibe Jam',
        url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif',
        category: 'anime',
        tags: ['cat', 'jam', 'vibe', 'headnod', 'music', 'dance', 'cute'],
    },
    {
        id: 'a3',
        title: 'Chika Fujiwara Dance',
        url: 'https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif',
        category: 'anime',
        tags: ['anime', 'chika', 'dance', 'kaguya', 'happy', 'cute', 'excited'],
    },
    {
        id: 'a4',
        title: 'Ghibli Aesthetic Cooking',
        url: 'https://media.giphy.com/media/12zV7u6Bh0vHpu/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/12zV7u6Bh0vHpu/giphy.gif',
        category: 'anime',
        tags: ['ghibli', 'anime', 'cooking', 'aesthetic', 'cozy', 'food', 'relax'],
    },
    {
        id: 'a5',
        title: 'Lofi Girl Studying',
        url: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
        category: 'anime',
        tags: ['lofi', 'study', 'relax', 'chill', 'drawing', 'desk', 'art', 'music'],
    },
    {
        id: 'a6',
        title: 'Sailor Moon Transformation',
        url: 'https://media.giphy.com/media/26gBjmGEsrFQlj8g8/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/26gBjmGEsrFQlj8g8/giphy.gif',
        category: 'anime',
        tags: ['sailor moon', 'magic', 'sparkles', 'transformation', 'retro', '90s'],
    },
    {
        id: 'a7',
        title: 'Pikachu Excited',
        url: 'https://media.giphy.com/media/6nWhy3ulBL7GSCvKw6/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/6nWhy3ulBL7GSCvKw6/giphy.gif',
        category: 'anime',
        tags: ['pikachu', 'pokemon', 'shocked', 'surprised', 'meme', 'face'],
    },
    {
        id: 'a8',
        title: 'Naruto Thumbs Up',
        url: 'https://media.giphy.com/media/Do5GRTYRIhSFy/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/Do5GRTYRIhSFy/giphy.gif',
        category: 'anime',
        tags: ['naruto', 'thumbs up', 'approve', 'yes', 'cool', 'anime'],
    },

    // --- ART & CREATIVE ---
    {
        id: 'art1',
        title: 'Digital Painting Canvas Loop',
        url: 'https://media.giphy.com/media/L1R1tvI9svkIWwpVYr/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/L1R1tvI9svkIWwpVYr/giphy.gif',
        category: 'art',
        tags: ['art', 'digital art', 'painting', 'sketch', 'drawing', 'artist', 'creative'],
    },
    {
        id: 'art2',
        title: 'Pixel Art Cyberpunk City',
        url: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
        category: 'art',
        tags: ['pixel art', 'cyberpunk', 'city', 'neon', 'rain', 'aesthetic', 'retro'],
    },
    {
        id: 'art3',
        title: 'Watercolor Flower Bloom',
        url: 'https://media.giphy.com/media/l0HlFTxWpNs61q8g0/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/l0HlFTxWpNs61q8g0/giphy.gif',
        category: 'art',
        tags: ['watercolor', 'flower', 'bloom', 'paint', 'color', 'nature', 'aesthetic'],
    },
    {
        id: 'art4',
        title: 'Glitch Vaporwave Statue',
        url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
        category: 'art',
        tags: ['glitch', 'vaporwave', 'statue', 'neon', 'art', 'trippy', 'aesthetic'],
    },
    {
        id: 'art5',
        title: 'Animated 3D Abstract Loop',
        url: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
        category: 'art',
        tags: ['3d', 'render', 'abstract', 'loop', 'satisfying', 'motion', 'design'],
    },
    {
        id: 'art6',
        title: 'Pencil Sketch Drawing',
        url: 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif',
        category: 'art',
        tags: ['sketch', 'pencil', 'drawing', 'lines', 'artist', 'doodle'],
    },

    // --- REACTIONS & MEMES ---
    {
        id: 'r1',
        title: 'Mind Blown Galaxy',
        url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
        category: 'reaction',
        tags: ['mind blown', 'shock', 'wow', 'galaxy', 'explosion', 'epic', 'meme'],
    },
    {
        id: 'r2',
        title: 'Leonardo DiCaprio Cheers',
        url: 'https://media.giphy.com/media/GCLlQnV7dXY2KGmpRh/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/GCLlQnV7dXY2KGmpRh/giphy.gif',
        category: 'reaction',
        tags: ['cheers', 'gatsby', 'leonardo', 'toast', 'celebrate', 'congrats', 'champagne'],
    },
    {
        id: 'r3',
        title: 'Popcat Popping',
        url: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif',
        category: 'reaction',
        tags: ['popcat', 'cat', 'meme', 'pop', 'funny', 'cute', 'loop'],
    },
    {
        id: 'r4',
        title: 'Denzel Washington Relief',
        url: 'https://media.giphy.com/media/3oFzm7MaLnMdD1T6tG/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/3oFzm7MaLnMdD1T6tG/giphy.gif',
        category: 'reaction',
        tags: ['phew', 'relief', 'thank god', 'denzel', 'satisfied', 'calm'],
    },
    {
        id: 'r5',
        title: 'Fire Elmo Chaos',
        url: 'https://media.giphy.com/media/yr7n0u3qzO9nG/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/yr7n0u3qzO9nG/giphy.gif',
        category: 'reaction',
        tags: ['fire', 'elmo', 'chaos', 'flames', 'crazy', 'burn', 'wild'],
    },
    {
        id: 'r6',
        title: 'Thumbs Up Dog in Fire (This is Fine)',
        url: 'https://media.giphy.com/media/9M5jK4GXmD5o1irGrF/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/9M5jK4GXmD5o1irGrF/giphy.gif',
        category: 'reaction',
        tags: ['this is fine', 'dog', 'fire', 'okay', 'fine', 'stress', 'chill'],
    },
    {
        id: 'r7',
        title: 'Excited Kermit Flail',
        url: 'https://media.giphy.com/media/dpqQNluWFaSpq/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/dpqQNluWFaSpq/giphy.gif',
        category: 'reaction',
        tags: ['kermit', 'excited', 'yay', 'hype', 'flail', 'happy', 'funny'],
    },
    {
        id: 'r8',
        title: 'Confused John Travolta',
        url: 'https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy.gif',
        category: 'reaction',
        tags: ['confused', 'travolta', 'lost', 'where', 'pulp fiction', 'meme'],
    },

    // --- GAMING & FUN ---
    {
        id: 'g1',
        title: 'Minecraft Diamond Rave',
        url: 'https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif',
        category: 'gaming',
        tags: ['minecraft', 'diamond', 'dance', 'gamer', 'gaming', 'disco'],
    },
    {
        id: 'g2',
        title: 'Victory Royale Dance',
        url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
        category: 'gaming',
        tags: ['victory', 'gaming', 'dance', 'win', 'gg', 'gamer'],
    },
    {
        id: 'g3',
        title: 'Retro Arcade Game Over',
        url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
        category: 'gaming',
        tags: ['arcade', 'game over', 'retro', '80s', '8bit', 'pixel'],
    },
    {
        id: 'g4',
        title: 'Zelda Chest Opening',
        url: 'https://media.giphy.com/media/5wFS6a1PE62lKUWXyx/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/5wFS6a1PE62lKUWXyx/giphy.gif',
        category: 'gaming',
        tags: ['zelda', 'link', 'chest', 'item', 'treasure', 'nintendo'],
    },
];

interface GifPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectGif: (gif: { url: string; title: string }) => void;
}

export const GifPickerModal: React.FC<GifPickerModalProps> = ({
    isOpen,
    onClose,
    onSelectGif,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<'all' | 'anime' | 'art' | 'reaction' | 'gaming'>('all');
    const [customUrl, setCustomUrl] = useState('');
    const [customUrlPreviewError, setCustomUrlPreviewError] = useState(false);
    const [activeTab, setActiveTab] = useState<'search' | 'url'>('search');

    // Filter GIFs based on search and category
    const filteredGifs = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return CURATED_GIFS.filter((gif) => {
            const matchesCategory = activeCategory === 'all' || gif.category === activeCategory;
            const matchesQuery =
                !query ||
                gif.title.toLowerCase().includes(query) ||
                gif.tags.some((tag) => tag.toLowerCase().includes(query));

            return matchesCategory && matchesQuery;
        });
    }, [searchQuery, activeCategory]);

    const handleSelect = (gif: { url: string; title: string }) => {
        onSelectGif(gif);
        onClose();
    };

    const handleApplyCustomUrl = () => {
        if (!customUrl.trim()) return;
        onSelectGif({
            url: customUrl.trim(),
            title: 'Custom GIF',
        });
        setCustomUrl('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
                {/* ── Modal Header ── */}
                <div className="p-5 border-b border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-2xl bg-purple-600/15 text-purple-400 flex items-center justify-center font-black text-xs border border-purple-500/20 shadow-inner">
                            GIF
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                                Search Online GIFs
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Find the perfect reaction or animated loop to bring your post to life.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="h-8 w-8 rounded-xl hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* ── Tab Switcher: Search vs Direct Link ── */}
                <div className="px-5 pt-3 flex items-center gap-2 border-b border-border/60 pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('search')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'search'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Browse &amp; Search
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('url')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'url'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <LinkIcon className="h-3.5 w-3.5" />
                        Direct GIF URL
                    </button>
                </div>

                {/* ── Tab 1: Browse & Search ── */}
                {activeTab === 'search' && (
                    <div className="p-5 space-y-4 overflow-y-auto flex-1">
                        {/* Search Input Bar */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by mood, anime, art, dance, gaming, or reactions..."
                                className="pl-10 h-11 rounded-2xl bg-secondary/40 border-border/80 text-sm font-medium focus-visible:ring-primary"
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Category Chips */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                            <button
                                type="button"
                                onClick={() => setActiveCategory('all')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                    activeCategory === 'all'
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                            >
                                <Flame className="h-3 w-3" /> All
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCategory('anime')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                    activeCategory === 'anime'
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                            >
                                <Tv className="h-3 w-3" /> Anime
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCategory('art')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                    activeCategory === 'art'
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                            >
                                <Palette className="h-3 w-3" /> Art &amp; Creative
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCategory('reaction')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                    activeCategory === 'reaction'
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                            >
                                <Smile className="h-3 w-3" /> Reactions
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCategory('gaming')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                    activeCategory === 'gaming'
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                            >
                                <Gamepad2 className="h-3 w-3" /> Gaming
                            </button>
                        </div>

                        {/* GIFs Grid */}
                        {filteredGifs.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                                {filteredGifs.map((gif) => (
                                    <div
                                        key={gif.id}
                                        onClick={() => handleSelect(gif)}
                                        className="group relative rounded-2xl overflow-hidden bg-secondary/40 border border-border/80 hover:border-purple-500/80 aspect-video cursor-pointer transition-all duration-200 hover:shadow-lg flex items-center justify-center"
                                    >
                                        <img
                                            src={gif.previewUrl}
                                            alt={gif.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                                            <p className="text-[11px] font-bold text-white truncate drop-shadow-md">
                                                {gif.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center space-y-2">
                                <p className="text-sm font-bold text-foreground">No GIFs found for "{searchQuery}"</p>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    Try searching for other keywords like <em>cat, anime, dance, wow, art</em>, or use the Direct GIF URL tab.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab 2: Paste Direct GIF URL ── */}
                {activeTab === 'url' && (
                    <div className="p-5 space-y-5 overflow-y-auto flex-1">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Paste Online GIF or Image Link
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    value={customUrl}
                                    onChange={(e) => {
                                        setCustomUrl(e.target.value);
                                        setCustomUrlPreviewError(false);
                                    }}
                                    placeholder="https://media.giphy.com/.../giphy.gif"
                                    className="h-11 rounded-2xl bg-secondary/40 border-border/80 text-sm font-medium"
                                />
                                <Button
                                    type="button"
                                    onClick={handleApplyCustomUrl}
                                    disabled={!customUrl.trim() || customUrlPreviewError}
                                    className="h-11 px-5 rounded-2xl font-bold text-xs gap-1.5 cursor-pointer shrink-0 bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    <Check className="h-4 w-4" /> Insert GIF
                                </Button>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Supports direct links from Giphy, Tenor, Imgur, Reddit, Discord, and any public URL ending in .gif, .webp, or .png.
                            </p>
                        </div>

                        {/* Live URL Preview */}
                        {customUrl.trim() && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-foreground">Live GIF Preview:</p>
                                <div className="rounded-2xl overflow-hidden border border-border/80 bg-secondary/30 max-h-64 flex items-center justify-center p-2">
                                    <img
                                        src={customUrl}
                                        alt="Custom GIF Preview"
                                        onError={() => setCustomUrlPreviewError(true)}
                                        className="max-h-56 w-auto object-contain rounded-xl"
                                    />
                                </div>
                                {customUrlPreviewError && (
                                    <p className="text-xs text-rose-400 font-semibold">
                                        Unable to load image from this URL. Please verify the link is accessible.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Modal Footer ── */}
                <div className="p-4 border-t border-border/80 bg-secondary/20 flex items-center justify-between text-xs text-muted-foreground">
                    <span>💡 Click any GIF to instantly insert into your post</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 font-semibold cursor-pointer"
                    >
                        Cancel
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
