import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Star,
    Maximize2,
    ChevronLeft,
    ChevronRight,
    Video,
    Tag,
    Film,
    Flag,
    ExternalLink,
    Paintbrush,
    Clock,
    Globe,
    Lock,
    Users,
    MoreHorizontal,
    Share2,
    Shield,
    ShieldAlert,
    Trash2,
    Pencil,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ReportModal } from '@/components/modals/ReportModal';
import { AppealTicketModal } from '@/components/modals/AppealTicketModal';
import { EditPortfolioModal } from '@/components/modals/EditPortfolioModal';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { portfolioApi } from '@/services/artistService';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import { MediaLightboxModal } from '@/components/ui/MediaLightboxModal';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { toast } from '@/components/ui/sonner';
import { copyToClipboard } from '@/lib/clipboard';
import { UnavailableContentState } from '@/components/common/UnavailableContentState';
import type { Portfolio } from '@/types/artist';

function formatPostDate(dateStr?: string | null): string {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Recently';

    const now = Date.now();
    const diffSecs = Math.floor((now - date.getTime()) / 1000);
    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
}

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
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const updateScrollButtons = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

        const children = scrollContainerRef.current.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            const childLeft = child.offsetLeft - scrollContainerRef.current.offsetLeft;
            if (Math.abs(childLeft - scrollLeft) < child.offsetWidth / 2) {
                setActiveIndex(i);
                break;
            }
        }
    };

    useEffect(() => {
        updateScrollButtons();
        window.addEventListener('resize', updateScrollButtons);
        return () => window.removeEventListener('resize', updateScrollButtons);
    }, [mediaList]);

    const scrollByStep = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const step = scrollContainerRef.current.clientWidth * 0.75;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -step : step,
            behavior: 'smooth',
        });
    };

    const scrollToItem = (idx: number) => {
        if (!scrollContainerRef.current) return;
        const item = scrollContainerRef.current.children[idx] as HTMLElement | undefined;
        if (item) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    return (
        <div className="relative group/gallery">
            {/* Left arrow */}
            {canScrollLeft && (
                <button
                    type="button"
                    onClick={() => scrollByStep('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center backdrop-blur-md shadow-xl border border-white/20 transition-all opacity-0 group-hover/gallery:opacity-100 cursor-pointer"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
            )}

            {/* Right arrow */}
            {canScrollRight && (
                <button
                    type="button"
                    onClick={() => scrollByStep('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center backdrop-blur-md shadow-xl border border-white/20 transition-all opacity-0 group-hover/gallery:opacity-100 cursor-pointer"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            )}

            {/* Scroll Track */}
            <div
                ref={scrollContainerRef}
                onScroll={updateScrollButtons}
                className="flex items-center gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none py-1 px-0.5"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {mediaList.map((media, idx) => {
                    const isVid = isVideoMedia(media);
                    const isGif = isGifMedia(media);

                    return (
                        <div
                            key={media.id || idx}
                            className="relative snap-center shrink-0 w-[240px] sm:w-[320px] md:w-[380px] aspect-4/3 rounded-2xl overflow-hidden bg-black/60 border border-border/80 group cursor-pointer hover:border-border transition-all shadow-md"
                            onClick={() => onOpenLightbox(idx)}
                        >
                            {isVid ? (
                                <div className="w-full h-full relative">
                                    <CustomVideoPlayer
                                        src={media.url}
                                        autoPlay={false}
                                        loop
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2.5 left-2.5 z-10">
                                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/20">
                                            <Video className="h-3 w-3 text-rose-400" /> VIDEO
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full relative">
                                    <img
                                        src={media.url}
                                        alt={media.file_name || `WIP ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {isGif && (
                                        <div className="absolute top-2.5 left-2.5 z-10">
                                            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-black tracking-wider border border-white/20">
                                                GIF
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Label overlay */}
                            <div className="absolute top-2.5 right-2.5 z-10">
                                <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                                    {idx + 1}/{mediaList.length}
                                </span>
                            </div>

                            {/* Hover info banner */}
                            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[11px] font-medium text-white/90 truncate">
                                    {media.alt_text || media.file_name || `Process Media #${idx + 1}`}
                                </p>
                                <span className="text-[10px] text-white/70 font-semibold bg-white/10 px-1.5 py-0.5 rounded">
                                    Click to view
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Dots */}
            {mediaList.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-3">
                    {mediaList.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => scrollToItem(i)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                activeIndex === i ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const PortfolioDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { requireAuth } = useAuthModal();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<{ status?: number; message?: string } | null>(null);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Report & Appeal & Edit modal state
    const [showReportModal, setShowReportModal] = useState(false);
    const [showAppealModal, setShowAppealModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteArtwork = async () => {
        if (!portfolio) return;
        setIsDeleting(true);
        try {
            await portfolioApi.destroy(portfolio.id);
            toast.success('Artwork deleted successfully');
            navigate('/explore');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to delete artwork');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await portfolioApi.show(Number(id));
                setPortfolio(data);
                setFetchError(null);
            } catch (err: any) {
                const status = err?.response?.status;
                const message = err?.response?.data?.message || err?.message;
                setFetchError({ status, message });
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, [id]);

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: portfolio?.title || 'Comme Artwork',
                    url,
                });
                return;
            } catch {
                // User cancelled or share failed, fallback to copy
            }
        }

        const success = await copyToClipboard(url);
        if (success) {
            toast.success('Artwork link copied to clipboard!');
        } else {
            window.prompt('Copy artwork URL to share:', url);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
                <div className="h-6 w-36 bg-muted/60 rounded-xl animate-pulse" />
                <div className="h-96 w-full rounded-3xl bg-muted/40 animate-pulse" />
                <div className="h-48 w-full rounded-3xl bg-muted/30 animate-pulse" />
            </div>
        );
    }

    const artist = portfolio?.artist_profile;
    const artistUser = artist?.user || (portfolio as any)?.user;
    const isStaff = user?.role === 'admin' || user?.role === 'moderator';
    const isOwner = Boolean(user && (user.id === artistUser?.id || user.id === (portfolio as any)?.user_id));

    // 1. Error state from backend (403 Forbidden or 404 Not Found)
    if (fetchError || !portfolio) {
        if (fetchError?.status === 403) {
            return (
                <UnavailableContentState
                    variant="taken_down"
                    type="artwork"
                    title="Artwork Unavailable"
                    description="This artwork is not publicly accessible. It may have been removed or set to private by moderation."
                />
            );
        }
        return (
            <UnavailableContentState
                variant="not_found"
                type="artwork"
                title="Artwork Not Found"
                description="This artwork could not be found. It may have been deleted by the artist or the link is incorrect."
            />
        );
    }

    // 2. Moderation check for unauthorized regular visitors
    if (portfolio.is_taken_down && !isStaff && !isOwner) {
        return (
            <UnavailableContentState
                variant="taken_down"
                type="artwork"
                title="Artwork Taken Down"
                description="This artwork was taken down by moderation for violating Comme's Community Guidelines and is hidden from public view."
            />
        );
    }

    // 3. Suspended creator check for regular visitors
    if (artistUser?.is_suspended && !isStaff && !isOwner) {
        return (
            <UnavailableContentState
                variant="suspended"
                type="artwork"
                title="Creator Account Suspended"
                description="The artist who published this artwork is currently suspended, and their content is temporarily unavailable."
            />
        );
    }

    const allMediaList = portfolio.media && portfolio.media.length > 0 ? portfolio.media : [];

    // 1. Main Artwork Piece (first media item / thumbnail / cover)
    const mainArtwork =
        allMediaList[0] ||
        ((portfolio as any).thumbnail_media
            ? { id: 0, url: (portfolio as any).thumbnail_media.url, media_type: 'image' }
            : portfolio.cover_image_url
            ? { id: 0, url: portfolio.cover_image_url, media_type: 'image' }
            : null);

    // 2. Additional Process Media & Timelapses (all media from index 1 onwards)
    const processMedias = allMediaList.length > 1 ? allMediaList.slice(1) : [];

    const handleOpenMainLightbox = () => {
        setLightboxIndex(0);
        setLightboxOpen(true);
    };

    const handleOpenProcessLightbox = (processIdx: number) => {
        // Offset by 1 since mainArtwork is at index 0 in allMediaList
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
                <Card className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-lg">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                        {/* Moderation Taken-Down Banner: Staff Control vs Owner Appeal */}
                        {portfolio.is_taken_down && (
                            isStaff ? (
                                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-inner">
                                    <div className="flex items-start sm:items-center gap-3.5 text-purple-200">
                                        <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0 border border-purple-500/30">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-purple-300 text-sm">Staff Moderation Notice: Content Taken Down</span>
                                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-500/30">
                                                    Staff View
                                                </span>
                                            </div>
                                            <div className="text-foreground/90 mt-0.5 font-normal">
                                                Enforcement Reason: <span className="font-semibold text-purple-200">"{portfolio.taken_down_reason || 'Violation of Community Guidelines'}"</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                This item is locked in private visibility and hidden from public feeds. The owner cannot republish it without staff approval.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                                        <Link to="/admin/reports" className="w-full sm:w-auto">
                                            <Button size="sm" className="w-full sm:w-auto rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5 shadow-md">
                                                <Shield className="h-3.5 w-3.5" /> Reports Desk
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : isOwner ? (
                                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-inner">
                                    <div className="flex items-start sm:items-center gap-3.5 text-rose-300">
                                        <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 border border-rose-500/30">
                                            <ShieldAlert className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-rose-400 text-sm">Artwork Taken Down by Moderation</span>
                                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-500/30">
                                                    Official Notice
                                                </span>
                                            </div>
                                            <div className="text-foreground/90 mt-0.5 font-normal">
                                                Reason: <span className="font-semibold text-rose-200">"{portfolio.taken_down_reason || 'Violation of Community Guidelines'}"</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                This artwork is locked in private mode. To request a review or republish, please open a support ticket.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
                                        <Button
                                            size="sm"
                                            onClick={() => setShowEditModal(true)}
                                            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            <span>Edit &amp; Revise Artwork</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowAppealModal(true)}
                                            className="rounded-xl border-rose-500/40 text-rose-300 hover:bg-rose-500/20 text-xs font-bold shadow-md cursor-pointer"
                                        >
                                            <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Open Appeal Ticket
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setShowDeleteModal(true)}
                                            className="rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-medium cursor-pointer"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Artwork
                                        </Button>
                                    </div>
                                </div>
                            ) : null
                        )}

                        {/* ── 1. Standardized Author Header (Exact Post Detail Format) ── */}
                        <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
                            <div className="flex items-center gap-3.5">
                                <Link to={`/users/${artistUser?.username || ''}`} className="cursor-pointer">
                                    <Avatar
                                        size="lg"
                                        fallback={artistUser?.display_name || artistUser?.username || '?'}
                                        src={artistUser?.avatar_url}
                                        className="ring-2 ring-border/80 shadow-sm"
                                    />
                                </Link>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/users/${artistUser?.username || ''}`}
                                            className="font-bold text-base text-foreground hover:text-primary transition-colors"
                                        >
                                            {artistUser?.display_name || artistUser?.username || 'Artist'}
                                        </Link>
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                            Artist
                                        </span>
                                        {artist?.commission_status === 'open' && (
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                Open for Orders
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <span>@{artistUser?.username || 'artist'}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {formatPostDate(portfolio.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Visibility Badge & Artwork Options Menu */}
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs font-semibold gap-1.5 px-3 py-1">
                                    {(!portfolio.visibility || portfolio.visibility === 'public') && (
                                        <Globe className="h-3 w-3 text-emerald-400" />
                                    )}
                                    {portfolio.visibility === 'followers' && <Users className="h-3 w-3 text-primary" />}
                                    {portfolio.visibility === 'private' && <Lock className="h-3 w-3 text-amber-400" />}
                                    <span className="capitalize">{portfolio.visibility || 'Public'}</span>
                                </Badge>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            title="More artwork options"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44 rounded-2xl p-1.5">
                                        <DropdownMenuItem
                                            onClick={handleShare}
                                            className="rounded-xl text-xs py-2 cursor-pointer gap-2"
                                        >
                                            <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>Share Link</span>
                                        </DropdownMenuItem>
                                        {artistUser?.username && (
                                            <DropdownMenuItem
                                                onClick={() => navigate(`/users/${artistUser.username}`)}
                                                className="rounded-xl text-xs py-2 cursor-pointer gap-2"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>View Profile</span>
                                            </DropdownMenuItem>
                                        )}
                                        {artist?.commission_status === 'open' && artistUser?.username && (
                                            <DropdownMenuItem
                                                onClick={() => navigate(`/store?artist=${encodeURIComponent(artistUser.username)}`)}
                                                className="rounded-xl text-xs py-2 cursor-pointer gap-2"
                                            >
                                                <Paintbrush className="h-3.5 w-3.5 text-purple-400" />
                                                <span>Commission Artist</span>
                                            </DropdownMenuItem>
                                        )}

                                        {isOwner && (
                                            <>
                                                <DropdownMenuItem
                                                    onClick={() => setShowEditModal(true)}
                                                    className="rounded-xl text-xs py-2 cursor-pointer gap-2"
                                                >
                                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>Edit Artwork</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setShowDeleteModal(true)}
                                                    className="rounded-xl text-xs py-2 cursor-pointer gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                                                    <span>Delete Artwork</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        {!isOwner && (
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    if (user?.role === 'admin' || user?.role === 'moderator') {
                                                        navigate('/admin/reports');
                                                        toast.info('Fast-travelled to Moderation Workbench');
                                                        return;
                                                    }
                                                    if (!requireAuth('report')) return;
                                                    setShowReportModal(true);
                                                }}
                                                className={`rounded-xl text-xs py-2 cursor-pointer gap-2 ${
                                                    user?.role === 'admin' || user?.role === 'moderator'
                                                        ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                                                        : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                                                }`}
                                            >
                                                {user?.role === 'admin' || user?.role === 'moderator' ? (
                                                    <>
                                                        <Shield className="h-3.5 w-3.5 text-purple-400" />
                                                        <span>Moderate Artwork</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Flag className="h-3.5 w-3.5 text-rose-400" />
                                                        <span>Report Artwork</span>
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* ── 2. Hero Artwork Display ── */}
                        {mainArtwork && (
                            <div className="relative rounded-3xl overflow-hidden bg-black/40 border border-border/60 group">
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

                        {/* ── 3. Artwork Title & Description ── */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                    {portfolio.title}
                                </h1>
                                {portfolio.starred && (
                                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-black gap-1.5">
                                        <Star className="h-3 w-3 fill-amber-400" /> Featured
                                    </Badge>
                                )}
                            </div>

                            {portfolio.description && (
                                <div className="text-sm text-foreground/90 leading-relaxed pt-1">
                                    <MarkdownContent content={portfolio.description} />
                                </div>
                            )}
                        </div>

                        {/* ── 4. Process Media & Timelapses ── */}
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

                        {/* ── 5. Tags ── */}
                        {portfolio.tags && portfolio.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                                {portfolio.tags.map((t) => (
                                    <Link key={t.id || t.name} to={`/explore?tag=${encodeURIComponent(t.name)}`}>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer hover:scale-105"
                                        >
                                            <Tag className="h-3 w-3 mr-1" />
                                            {t.name}
                                        </Badge>
                                    </Link>
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
                mediaList={allMediaList.map((m) => ({
                    id: m.id,
                    url: m.url,
                    file_name: m.file_name,
                    media_type: m.media_type || (isVideoMedia(m) ? 'video' : 'image'),
                    isVideo: isVideoMedia(m),
                    isGif: isGifMedia(m),
                }))}
                initialIndex={lightboxIndex}
            />

            {/* Universal Report Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                reportableType="portfolio"
                reportableId={portfolio.id}
                targetTitle={portfolio.title}
                targetSubtitle={artistUser?.username ? `by @${artistUser.username}` : undefined}
            />

            {/* Moderation Appeal Modal */}
            <AppealTicketModal
                isOpen={showAppealModal}
                onClose={() => setShowAppealModal(false)}
                initialType="portfolio"
                initialId={portfolio.id}
                initialTitle={portfolio.title}
                initialReason={portfolio.taken_down_reason || 'Violation of Community Guidelines'}
            />

            {/* Edit Portfolio Modal */}
            <EditPortfolioModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                portfolio={portfolio}
                onPortfolioUpdated={(updated) => setPortfolio(updated)}
                onOpenAppeal={() => setShowAppealModal(true)}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-foreground">Delete Artwork</h3>
                                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Are you sure you want to permanently delete <strong className="text-foreground">"{portfolio.title}"</strong>? 
                            {portfolio.is_taken_down && (
                                <span className="block mt-1 text-emerald-400">
                                    Deleting this flagged artwork will automatically dismiss pending moderation restrictions.
                                </span>
                            )}
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="rounded-xl text-xs font-semibold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteArtwork}
                                disabled={isDeleting}
                                className="rounded-xl text-xs font-bold gap-1.5 bg-rose-600 hover:bg-rose-700"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Delete Artwork</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
