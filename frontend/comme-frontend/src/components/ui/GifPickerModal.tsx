import React, { useState, useEffect, useRef } from 'react';
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
    Loader2,
    KeyRound,
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import {
    gifService,
    type GifResult,
    getActiveKlipyKey,
    setStoredKlipyKey,
} from '@/services/gifService';

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

    // Live Search States
    const [gifs, setGifs] = useState<GifResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState<'klipy' | 'curated'>('curated');

    // KLIPY Settings
    const [showKeyConfig, setShowKeyConfig] = useState(false);
    const [klipyKeyInput, setKlipyKeyInput] = useState(getActiveKlipyKey());

    const searchTimerRef = useRef<number | null>(null);

    // Fetch GIFs whenever search query or category changes (with 250ms debounce)
    useEffect(() => {
        if (!isOpen) return;

        if (searchTimerRef.current) {
            window.clearTimeout(searchTimerRef.current);
        }

        searchTimerRef.current = window.setTimeout(async () => {
            setLoading(true);
            try {
                const res = await gifService.searchGifs(searchQuery, activeCategory);
                setGifs(res.results);
                setProvider(res.provider);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => {
            if (searchTimerRef.current) {
                window.clearTimeout(searchTimerRef.current);
            }
        };
    }, [searchQuery, activeCategory, isOpen, klipyKeyInput]);

    const handleSaveKey = () => {
        setStoredKlipyKey(klipyKeyInput);
        setShowKeyConfig(false);
    };

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
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-extrabold text-foreground">
                                    Search GIFs &amp; Reactions
                                </h2>
                                {provider === 'klipy' ? (
                                    <span className="text-[10px] font-black text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
                                        KLIPY LIVE
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border/60">
                                        FAST CURATED
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Find the perfect animated GIF to express your thoughts.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setShowKeyConfig((prev) => !prev)}
                            className={`h-8 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                showKeyConfig
                                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
                            title="Configure KLIPY API Key"
                        >
                            <KeyRound className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">KLIPY Key</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-8 w-8 rounded-xl hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* ── Optional KLIPY API Key Configuration Panel ── */}
                {showKeyConfig && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 py-3.5 bg-purple-950/20 border-b border-purple-500/20 space-y-2"
                    >
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-purple-300 flex items-center gap-1.5">
                                <KeyRound className="h-3.5 w-3.5" /> Connect Live KLIPY API
                            </span>
                            <a
                                href="https://klipy.com/developers"
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-400 hover:underline text-[11px]"
                            >
                                Get free key from klipy.com →
                            </a>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={klipyKeyInput}
                                onChange={(e) => setKlipyKeyInput(e.target.value)}
                                placeholder="Paste your KLIPY API Key here..."
                                className="h-9 rounded-xl bg-card border-purple-500/30 text-xs font-mono"
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveKey}
                                className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shrink-0"
                            >
                                Save Key
                            </Button>
                        </div>
                    </motion.div>
                )}

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
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
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
                        {gifs.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                                {gifs.map((gif) => (
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
                        ) : !loading ? (
                            <div className="py-12 text-center space-y-2">
                                <p className="text-sm font-bold text-foreground">No GIFs found for "{searchQuery}"</p>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    Try searching for other keywords like <em>cat, anime, dance, wow, art</em>, or use the Direct GIF URL tab.
                                </p>
                            </div>
                        ) : null}
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
                                Supports direct links from Giphy, Tenor, Klipy, Imgur, Reddit, Discord, and any public URL ending in .gif, .webp, or .png.
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
                    <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        Click any GIF to instantly insert into post
                    </span>
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
