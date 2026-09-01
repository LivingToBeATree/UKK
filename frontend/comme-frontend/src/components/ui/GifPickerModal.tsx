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
    AlertCircle,
    ExternalLink,
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

const QUICK_TAGS = [
    { label: 'Trending', query: '', icon: Flame },
    { label: 'Anime', query: 'anime', icon: Tv },
    { label: 'Art & Draw', query: 'digital art drawing', icon: Palette },
    { label: 'Reactions', query: 'reaction meme', icon: Smile },
    { label: 'Gaming', query: 'gaming gg', icon: Gamepad2 },
];

export const GifPickerModal: React.FC<GifPickerModalProps> = ({
    isOpen,
    onClose,
    onSelectGif,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [customUrlPreviewError, setCustomUrlPreviewError] = useState(false);
    const [activeTab, setActiveTab] = useState<'search' | 'url'>('search');

    // KLIPY State
    const [klipyKey, setKlipyKey] = useState(getActiveKlipyKey());
    const [tempKeyInput, setTempKeyInput] = useState(getActiveKlipyKey());
    const [showKeyConfig, setShowKeyConfig] = useState(false);

    // Results State
    const [gifs, setGifs] = useState<GifResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const searchTimerRef = useRef<number | null>(null);

    // Fetch live GIFs from KLIPY API
    const fetchGifs = async (query: string) => {
        if (!klipyKey) {
            setGifs([]);
            return;
        }

        setLoading(true);
        setErrorMessage(null);

        try {
            const { results } = await gifService.searchGifs(query, 1);
            setGifs(results);
        } catch (err: any) {
            setErrorMessage(err.message || 'Failed to fetch GIFs from KLIPY');
            setGifs([]);
        } finally {
            setLoading(false);
        }
    };

    // Trigger search when query or key changes
    useEffect(() => {
        if (!isOpen) return;

        if (searchTimerRef.current) {
            window.clearTimeout(searchTimerRef.current);
        }

        searchTimerRef.current = window.setTimeout(() => {
            fetchGifs(searchQuery);
        }, 300);

        return () => {
            if (searchTimerRef.current) {
                window.clearTimeout(searchTimerRef.current);
            }
        };
    }, [searchQuery, klipyKey, isOpen]);

    const handleSaveKey = () => {
        setStoredKlipyKey(tempKeyInput);
        setKlipyKey(tempKeyInput.trim());
        setShowKeyConfig(false);
        setErrorMessage(null);
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
                                    KLIPY GIF Search
                                </h2>
                                <span className="text-[10px] font-black text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
                                    KLIPY API
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Search millions of animated GIFs and reactions powered by KLIPY.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setShowKeyConfig((prev) => !prev)}
                            className={`h-8 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                showKeyConfig || !klipyKey
                                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
                            title="Configure KLIPY API Key"
                        >
                            <KeyRound className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                                {klipyKey ? 'KLIPY Key' : 'Connect Key'}
                            </span>
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

                {/* ── KLIPY API Key Configuration Banner / Drawer ── */}
                {(showKeyConfig || !klipyKey) && (
                    <div className="px-5 py-4 bg-purple-950/25 border-b border-purple-500/20 space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                            <span className="font-bold text-purple-200 flex items-center gap-1.5">
                                <KeyRound className="h-3.5 w-3.5 text-purple-400" />
                                {klipyKey ? 'Update KLIPY API Key' : 'Enter your KLIPY API Key to start searching'}
                            </span>
                            <a
                                href="https://partner.klipy.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-400 hover:text-purple-300 underline font-semibold flex items-center gap-1 text-[11px]"
                            >
                                Get free key at partner.klipy.com <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={tempKeyInput}
                                onChange={(e) => setTempKeyInput(e.target.value)}
                                placeholder="e.g. your_klipy_app_key"
                                className="h-9 rounded-xl bg-card border-purple-500/40 text-xs font-mono"
                                autoFocus={!klipyKey}
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveKey}
                                disabled={!tempKeyInput.trim()}
                                className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shrink-0"
                            >
                                Save &amp; Search
                            </Button>
                        </div>
                    </div>
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
                        KLIPY Search
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

                {/* ── Tab 1: KLIPY Search ── */}
                {activeTab === 'search' && (
                    <div className="p-5 space-y-4 overflow-y-auto flex-1">
                        {/* Search Input Bar */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by anime, reaction, meme, mood, gaming, or art..."
                                className="pl-10 h-11 rounded-2xl bg-secondary/40 border-border/80 text-sm font-medium focus-visible:ring-primary"
                                disabled={!klipyKey}
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

                        {/* Quick Filter Tags */}
                        {klipyKey && (
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                                {QUICK_TAGS.map((tag) => {
                                    const Icon = tag.icon;
                                    const isActive = searchQuery === tag.query;
                                    return (
                                        <button
                                            key={tag.label}
                                            type="button"
                                            onClick={() => setSearchQuery(tag.query)}
                                            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                                isActive
                                                    ? 'bg-purple-600 text-white shadow-xs'
                                                    : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                                            }`}
                                        >
                                            <Icon className="h-3 w-3" /> {tag.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Error Notification */}
                        {errorMessage && (
                            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{errorMessage}. Please verify your KLIPY API key.</span>
                            </div>
                        )}

                        {/* Empty Key Notice */}
                        {!klipyKey ? (
                            <div className="py-10 text-center space-y-3 px-4">
                                <div className="mx-auto w-12 h-12 rounded-2xl bg-purple-600/15 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/20 shadow-inner">
                                    <KeyRound className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">
                                    KLIPY API Key Required
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                    To search live GIFs across the web, connect your free API key from{' '}
                                    <a
                                        href="https://partner.klipy.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-purple-400 underline font-semibold"
                                    >
                                        partner.klipy.com
                                    </a>.
                                </p>
                            </div>
                        ) : gifs.length > 0 ? (
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
                                <p className="text-sm font-bold text-foreground">
                                    No GIFs found for "{searchQuery}"
                                </p>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    Try searching for other keywords like <em>anime, cat, dance, wow, gg</em>.
                                </p>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* ── Tab 2: Direct GIF URL ── */}
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
                                    placeholder="https://.../example.gif"
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
                                Supports direct links from Klipy, Tenor, Imgur, Discord, Reddit, and any public URL ending in .gif, .webp, or .png.
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
