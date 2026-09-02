import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft,
    Star,
    Calendar,
    Sparkles,
    Eye,
    Maximize2,
    ChevronLeft,
    ChevronRight,
    Video,
    Tag,
    Palette,
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

export const PortfolioDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
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

    const mediaList = portfolio.media && portfolio.media.length > 0 ? portfolio.media : [];
    const currentMedia = mediaList[currentIndex] || mediaList[0];
    const artist = portfolio.artist_profile;
    const artistUser = artist?.user;

    const isVideo = (m: any) =>
        m?.media_type === 'video' ||
        m?.mime_type?.includes('video') ||
        (typeof m?.url === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(m.url));

    const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    const handleNext = () => setCurrentIndex((prev) => (prev + 1) % mediaList.length);

    const handleOpenLightbox = (index: number) => {
        setLightboxIndex(index);
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
                {/* ── Hero Artwork Display ── */}
                {mediaList.length > 0 && (
                    <div className="relative rounded-3xl overflow-hidden bg-black/40 border border-border/60 group mb-6">
                        {/* Main Artwork */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentMedia?.url + currentIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-full flex items-center justify-center"
                            >
                                {isVideo(currentMedia) ? (
                                    <CustomVideoPlayer
                                        src={currentMedia.url}
                                        autoPlay={false}
                                        loop
                                        className="w-full h-auto rounded-3xl"
                                    />
                                ) : (
                                    <img
                                        src={currentMedia.url}
                                        alt={currentMedia.file_name || portfolio.title}
                                        className="w-full h-auto block object-cover cursor-zoom-in select-none group-hover:brightness-105 transition-all"
                                        onClick={() => handleOpenLightbox(currentIndex)}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Featured badge */}
                        {portfolio.starred && (
                            <div className="absolute top-4 left-4 z-10">
                                <span className="px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-xs font-black flex items-center gap-1.5 shadow-lg border border-amber-400/30">
                                    <Star className="h-3 w-3 fill-white" /> FEATURED
                                </span>
                            </div>
                        )}

                        {/* Expand button */}
                        {!isVideo(currentMedia) && (
                            <button
                                type="button"
                                onClick={() => handleOpenLightbox(currentIndex)}
                                className="absolute top-4 right-4 h-8 px-3 rounded-full bg-black/75 hover:bg-black/95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105 z-20 opacity-0 group-hover:opacity-100"
                                title="Expand"
                            >
                                <Maximize2 className="h-3.5 w-3.5" />
                                <span>Expand</span>
                            </button>
                        )}

                        {/* Navigation for multiple images */}
                        {mediaList.length > 1 && (
                            <>
                                <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 shadow-md z-10">
                                    {currentIndex + 1}/{mediaList.length}
                                </div>
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-lg"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-lg"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>

                                {/* Dot indicators */}
                                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-10">
                                    {mediaList.map((_: any, idx: number) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`h-2 rounded-full transition-all cursor-pointer ${
                                                idx === currentIndex
                                                    ? 'w-6 bg-white shadow-md'
                                                    : 'w-2 bg-white/40 hover:bg-white/60'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── Artwork Info Card ── */}
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

                        {/* Media Thumbnail Strip (Quick Jump) */}
                        {mediaList.length > 1 && (
                            <div className="pt-4 border-t border-border/60">
                                <p className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-purple-400" /> All Media ({mediaList.length})
                                </p>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border/40">
                                    {mediaList.map((m: any, idx: number) => (
                                        <button
                                            key={m.id || idx}
                                            type="button"
                                            onClick={() => {
                                                setCurrentIndex(idx);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                                idx === currentIndex
                                                    ? 'border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                                                    : 'border-border/60 hover:border-purple-500/40 opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            {isVideo(m) ? (
                                                <div className="w-full h-full bg-black/80 flex items-center justify-center">
                                                    <Video className="h-5 w-5 text-blue-400" />
                                                </div>
                                            ) : (
                                                <img
                                                    src={m.url}
                                                    alt={m.file_name || `Media ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            )}
                                            {idx === currentIndex && (
                                                <div className="absolute inset-0 bg-purple-500/20" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Lightbox */}
            <MediaLightboxModal
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                mediaList={mediaList}
                initialIndex={lightboxIndex}
            />
        </div>
    );
};
