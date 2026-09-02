import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Star,
    Calendar,
    Eye,
    Maximize2,
    ChevronLeft,
    ChevronRight,
    Video,
    Tag,
    Palette,
    Film,
} from 'lucide-react';
import { portfolioApi } from '@/services/artistService';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import { MediaLightboxModal } from '@/components/ui/MediaLightboxModal';
import { MarkdownContent } from '@/components/ui/markdown-content';
import type { Portfolio } from '@/types/artist';

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateStr;
    }
};

const isVideoMedia = (m: any) =>
    m?.media_type === 'video' ||
    m?.mime_type?.includes('video') ||
    (typeof m?.url === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(m.url));

const isGifMedia = (m: any) =>
    m?.mime_type?.includes('gif') ||
    (typeof m?.url === 'string' && /\.gif$/i.test(m.url));

// ── Horizontal Scrollable Process Media Gallery (Exact Post Media Format) ──
interface ProcessGalleryProps {
    mediaList: any[];
    onOpenLightbox: (index: number) => void;
}

const ProcessMediaGallery: React.FC<ProcessGalleryProps> = ({ mediaList, onOpenLightbox }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(mediaList.length > 1);
    const [activeIndex, setActiveIndex] = useState(0);

    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

        const itemWidth = scrollContainerRef.current.firstElementChild?.clientWidth || clientWidth;
        const current = Math.round(scrollLeft / (itemWidth + 12));
        setActiveIndex(Math.min(Math.max(0, current), mediaList.length - 1));
    };

    useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll, { passive: true });
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (container) container.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [mediaList.length]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollAmount = container.clientWidth * 0.8;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    const scrollToItem = (index: number) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const children = container.children;
        if (children[index]) {
            (children[index] as HTMLElement).scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    };

    if (mediaList.length === 1) {
        const m = mediaList[0];
        const isVid = isVideoMedia(m);
        const isGif = isGifMedia(m);

        return (
            <div className="relative rounded-2xl overflow-hidden bg-black/90 border border-border/80 my-2 max-w-2xl group">
                {isVid ? (
                    <CustomVideoPlayer
                        src={m.url}
                        autoPlay={false}
                        loop
                        className="w-full h-auto max-h-[420px] rounded-2xl"
                    />
                ) : (
                    <img
                        src={m.url}
                        alt={m.file_name || 'Process media'}
                        className="w-full h-auto max-h-[420px] object-contain rounded-2xl cursor-zoom-in hover:brightness-105 transition-all bg-black/50"
                        onClick={() => onOpenLightbox(0)}
                    />
                )}

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none z-10">
                    {isVid ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-black flex items-center gap-1 shadow-md backdrop-blur-md">
                            <Video className="h-3 w-3" /> TIMELAPSE / VIDEO
                        </span>
                    ) : isGif ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-600/90 text-white text-[10px] font-black shadow-md backdrop-blur-md">
                            GIF
                        </span>
                    ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-black shadow-md backdrop-blur-md">
                            PROCESS / WIP
                        </span>
                    )}
                </div>

                {!isVid && (
                    <button
                        type="button"
                        onClick={() => onOpenLightbox(0)}
                        className="absolute top-2.5 right-2.5 h-7 px-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white text-[11px] font-semibold flex items-center gap-1 shadow-md backdrop-blur-md border border-white/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-10"
                    >
                        <Maximize2 className="h-3 w-3" /> Expand
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="relative rounded-2xl overflow-hidden bg-black/90 border border-border/80 my-2 group/gallery select-none">
            {/* Horizontal Scroll Track */}
            <div
                ref={scrollContainerRef}
                className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory p-3.5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
            >
                {mediaList.map((m, idx) => {
                    const isVid = isVideoMedia(m);
                    const isGif = isGifMedia(m);

                    return (
                        <div
                            key={m.id || idx}
                            className="relative snap-center shrink-0 w-[300px] sm:w-[380px] md:w-[440px] h-[210px] sm:h-[250px] md:h-[275px] rounded-xl overflow-hidden bg-black/80 border border-white/10 flex items-center justify-center group/card"
                        >
                            {isVid ? (
                                <CustomVideoPlayer
                                    src={m.url}
                                    autoPlay={false}
                                    loop
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <img
                                    src={m.url}
                                    alt={m.file_name || `Process ${idx + 1}`}
                                    className="w-full h-full object-contain cursor-zoom-in group-hover/card:scale-102 transition-transform duration-300"
                                    onClick={() => onOpenLightbox(idx)}
                                    loading="lazy"
                                />
                            )}

                            {/* Top Badges */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
                                {isVid ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-black flex items-center gap-1 shadow-md backdrop-blur-md">
                                        <Video className="h-3 w-3" /> TIMELAPSE
                                    </span>
                                ) : isGif ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-purple-600/90 text-white text-[10px] font-black shadow-md backdrop-blur-md">
                                        GIF
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-bold shadow-md backdrop-blur-md">
                                        WIP {idx + 1}
                                    </span>
                                )}
                            </div>

                            {/* Top Right Counter & Expand Button */}
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                                <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 shadow-xs">
                                    {idx + 1}/{mediaList.length}
                                </span>
                                {!isVid && (
                                    <button
                                        type="button"
                                        onClick={() => onOpenLightbox(idx)}
                                        className="h-7 w-7 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xs transition-all cursor-pointer opacity-0 group-hover/card:opacity-100"
                                        title="Expand"
                                    >
                                        <Maximize2 className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Left / Right Nav Arrows */}
            {canScrollLeft && (
                <button
                    type="button"
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/75 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer z-20"
                    title="Scroll left"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            )}
            {canScrollRight && (
                <button
                    type="button"
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/75 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer z-20"
                    title="Scroll right"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            )}

            {/* Bottom Navigation Dots */}
            {mediaList.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 py-2 bg-black/70 backdrop-blur-xs border-t border-white/5">
                    {mediaList.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => scrollToItem(idx)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                idx === activeIndex
                                    ? 'w-5 bg-white shadow-xs'
                                    : 'w-1.5 bg-white/30 hover:bg-white/60'
                            }`}
                            aria-label={`Go to media ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const PortfolioDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Lightbox modal state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await portfolioApi.show(Number(id));
                setPortfolio(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, [id]);

    if (loading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-16 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center animate-pulse">
                        <Palette className="h-6 w-6 text-purple-400" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Loading artwork...</p>
                </div>
            </div>
        );
    }

    if (error || !portfolio) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Palette className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Artwork not found</h2>
                <p className="text-sm text-muted-foreground">
                    This portfolio piece may have been removed or is set to private.
                </p>
                <Link to="/explore">
                    <Button variant="outline" className="mt-2 font-semibold">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Explore
                    </Button>
                </Link>
            </div>
        );
    }

    const allMedia = portfolio.media && portfolio.media.length > 0 ? portfolio.media : [];

    // 1. Main Artwork Piece (first media item / thumbnail / cover)
    const mainArtwork =
        allMedia[0] ||
        ((portfolio as any).thumbnail_media
            ? { id: 0, url: (portfolio as any).thumbnail_media.url, media_type: 'image' }
            : portfolio.cover_image_url
            ? { id: 0, url: portfolio.cover_image_url, media_type: 'image' }
            : null);

    // 2. Additional Process Media & Timelapses (all media from index 1 onwards)
    const processMedias = allMedia.length > 1 ? allMedia.slice(1) : [];

    const artist = portfolio.artist_profile;
    const artistUser = artist?.user;

    const handleOpenMainLightbox = () => {
        setLightboxIndex(0);
        setLightboxOpen(true);
    };

    const handleOpenProcessLightbox = (processIdx: number) => {
        // Offset by 1 since mainArtwork is at index 0 in allMedia
        setLightboxIndex(processIdx + 1);
        setLightboxOpen(true);
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
            {/* Navigation */}
            <div>
                <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Explore
                </Link>
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                {/* ── 1. MAIN SHOWCASED ARTWORK (Hero Piece at Full Natural Dimensions) ── */}
                {mainArtwork && (
                    <div className="relative rounded-3xl overflow-hidden bg-black/40 border border-border/60 group mb-6">
                        <div className="w-full flex items-center justify-center">
                            {isVideoMedia(mainArtwork) ? (
                                <CustomVideoPlayer
                                    src={mainArtwork.url}
                                    autoPlay={false}
                                    loop
                                    className="w-full h-auto rounded-3xl"
                                />
                            ) : (
                                <img
                                    src={mainArtwork.url}
                                    alt={mainArtwork.file_name || portfolio.title}
                                    className="w-full h-auto block object-cover cursor-zoom-in select-none group-hover:brightness-105 transition-all"
                                    onClick={handleOpenMainLightbox}
                                />
                            )}
                        </div>

                        {/* Featured badge */}
                        {portfolio.starred && (
                            <div className="absolute top-4 left-4 z-10">
                                <span className="px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-xs font-black flex items-center gap-1.5 shadow-lg border border-amber-400/30">
                                    <Star className="h-3 w-3 fill-white" /> FEATURED
                                </span>
                            </div>
                        )}

                        {/* Expand button */}
                        {!isVideoMedia(mainArtwork) && (
                            <button
                                type="button"
                                onClick={handleOpenMainLightbox}
                                className="absolute top-4 right-4 h-8 px-3 rounded-full bg-black/75 hover:bg-black/95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105 z-20 opacity-0 group-hover:opacity-100"
                                title="Expand"
                            >
                                <Maximize2 className="h-3.5 w-3.5" />
                                <span>Expand</span>
                            </button>
                        )}
                    </div>
                )}

                {/* ── 2. Artwork Info & Process Media Card ── */}
                <Card className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-lg">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                        {/* Title & Meta */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1.5">
                                    <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
                                        {portfolio.title}
                                    </h1>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        {portfolio.created_at && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> {formatDate(portfolio.created_at)}
                                            </span>
                                        )}
                                        {portfolio.visibility && (
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                <span className="capitalize">{portfolio.visibility}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {portfolio.starred && (
                                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-black gap-1.5">
                                        <Star className="h-3 w-3 fill-amber-400" /> Featured
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Artist Info */}
                        {artistUser && (
                            <div className="flex items-center gap-3.5 pb-4 border-b border-border/60">
                                <Link to={`/@${artistUser.username || ''}`} className="cursor-pointer">
                                    <Avatar
                                        size="lg"
                                        fallback={artistUser.display_name || artistUser.username || '?'}
                                        src={artistUser.avatar_url}
                                        className="ring-2 ring-border/80 shadow-sm"
                                    />
                                </Link>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/@${artistUser.username || ''}`}
                                            className="font-bold text-base text-foreground hover:text-primary transition-colors"
                                        >
                                            {artistUser.display_name || artistUser.username}
                                        </Link>
                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                            Artist
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">@{artistUser.username}</span>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {portfolio.description && (
                            <div className="pt-1">
                                <MarkdownContent content={portfolio.description} />
                            </div>
                        )}

                        {/* ── 3. ADDITIONAL PROCESS MEDIA & TIMELAPSES (Formatted exactly like Post Medias) ── */}
                        {processMedias.length > 0 && (
                            <div className="pt-4 border-t border-border/60 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Film className="h-3.5 w-3.5 text-blue-400" />
                                        Process Media, Timelapses & WIPs ({processMedias.length})
                                    </p>
                                </div>

                                <ProcessMediaGallery
                                    mediaList={processMedias}
                                    onOpenLightbox={handleOpenProcessLightbox}
                                />
                            </div>
                        )}

                        {/* Tags */}
                        {portfolio.tags && portfolio.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {portfolio.tags.map((t) => (
                                    <Badge
                                        key={t.id || t.name}
                                        variant="secondary"
                                        className="text-xs font-bold bg-primary/10 text-primary border border-primary/20"
                                    >
                                        <Tag className="h-3 w-3 mr-1" />
                                        {t.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Lightbox for all artwork & process medias */}
            <MediaLightboxModal
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                mediaList={allMedia.length > 0 ? allMedia : mainArtwork ? [mainArtwork] : []}
                initialIndex={lightboxIndex}
            />
        </div>
    );
};
