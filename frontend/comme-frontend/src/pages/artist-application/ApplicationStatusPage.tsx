import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Clock,
    CheckCircle2,
    XCircle,
    FileSearch,
    Globe,
    ExternalLink,
    Sparkles,
    ArrowLeft,
    RefreshCw,
    ShieldCheck,
    ImageIcon,
    Maximize2,
    Shield,
    HelpCircle,
    Copy,
    Check,
    Lock,
    Zap,
    BadgeCheck,
} from 'lucide-react';
import { artistApplicationApi } from '@/services/artistService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaLightboxModal } from '@/components/ui/MediaLightboxModal';
import { formatDateSafe } from '@/utils/format';
import { toast } from 'sonner';
import type { ArtistApplication } from '@/types';

const statusConfig = {
    pending: {
        icon: Clock,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        badgeVariant: 'gold' as const,
        label: 'Under Review',
        desc: 'Our Moderator Panel is actively reviewing your portfolio and verification links. Applications are typically processed within 24 to 48 hours.',
    },
    approved: {
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        badgeVariant: 'teal' as const,
        label: 'Approved & Verified',
        desc: 'Congratulations! Your artist application has been officially approved. You can now create commission packages, set your availability, and accept orders in your Creator Studio.',
    },
    rejected: {
        icon: XCircle,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        badgeVariant: 'rose' as const,
        label: 'Application Declined',
        desc: 'Thank you for your interest. Unfortunately your application did not pass verification at this time. You are welcome to submit updated portfolio links and artwork samples.',
    },
};

export const ApplicationStatusPage: React.FC = () => {
    const [application, setApplication] = useState<ArtistApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Lightbox Modal state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const fetchApplication = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        try {
            const data = await artistApplicationApi.myApplication();
            setApplication(data);
            setNotFound(false);
            if (isManualRefresh) toast.success('Application status refreshed');
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchApplication();
    }, []);

    const copyToClipboard = async (text: string, idx: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(idx);
            toast.success('Link copied to clipboard');
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    };

    // ── Modern Matching Skeleton Loader ──
    if (loading) {
        return (
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
                {/* Back Link Skeleton */}
                <Skeleton className="h-5 w-32 rounded-lg" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="border border-border/80 bg-card/80 rounded-3xl overflow-hidden shadow-xl">
                            {/* Header Banner Skeleton */}
                            <div className="p-6 sm:p-8 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2.5">
                                            <Skeleton className="h-7 w-52 rounded-xl" />
                                            <Skeleton className="h-5 w-24 rounded-full" />
                                        </div>
                                        <Skeleton className="h-4 w-44 rounded-lg" />
                                    </div>
                                </div>
                                <Skeleton className="h-10 w-32 rounded-xl" />
                            </div>

                            {/* Body Skeleton */}
                            <div className="p-6 sm:p-8 space-y-6">
                                {/* Status Notice Skeleton */}
                                <Skeleton className="h-28 w-full rounded-2xl" />

                                {/* Bio Skeleton */}
                                <div className="space-y-2.5">
                                    <Skeleton className="h-4 w-48 rounded-lg" />
                                    <Skeleton className="h-32 w-full rounded-2xl" />
                                </div>

                                {/* Artworks Grid Skeleton */}
                                <div className="space-y-3 pt-2">
                                    <Skeleton className="h-4 w-56 rounded-lg" />
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
                                        ))}
                                    </div>
                                </div>

                                {/* Portfolios Skeleton */}
                                <div className="space-y-2.5 pt-2">
                                    <Skeleton className="h-4 w-40 rounded-lg" />
                                    <Skeleton className="h-14 w-full rounded-2xl" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border border-border/80 bg-card/80 rounded-3xl p-6 space-y-5 shadow-xs">
                            <Skeleton className="h-5 w-44 rounded-xl" />
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                            </div>
                        </Card>
                        <Card className="border border-border/80 bg-card/80 rounded-3xl p-6 space-y-3 shadow-xs">
                            <Skeleton className="h-5 w-36 rounded-xl" />
                            <Skeleton className="h-20 w-full rounded-2xl" />
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (notFound || !application) {
        return (
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
                <div className="h-20 w-20 rounded-3xl bg-muted/40 text-muted-foreground flex items-center justify-center mx-auto shadow-inner border border-border/80">
                    <FileSearch className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">No Artist Application Found</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        You haven't submitted an artist application yet. Apply today to showcase your portfolio, unlock commission tools, and accept escrow-backed orders.
                    </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                    <Link to="/apply-artist">
                        <Button className="h-11 px-6 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/20 cursor-pointer">
                            <Sparkles className="h-4 w-4" /> Apply as Artist
                        </Button>
                    </Link>
                    <Link to="/explore">
                        <Button variant="outline" className="h-11 px-6 rounded-2xl font-semibold cursor-pointer">
                            Explore Community
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const config = statusConfig[application.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    const portfolioList = application.portfolio_links && application.portfolio_links.length > 0
        ? application.portfolio_links
        : application.portfolio_url
        ? [application.portfolio_url]
        : [];

    const sampleArtworks = application.sample_artworks || [];

    // Parse bio and embedded specialties
    const rawBio = application.bio || '';
    let displayBio = rawBio;
    let specialties: string[] = [];

    if (rawBio.includes('[Specialties]:')) {
        const parts = rawBio.split('[Specialties]:');
        displayBio = parts[0].trim();
        if (parts[1]) {
            specialties = parts[1]
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
        }
    }

    return (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex items-center justify-between gap-4">
                <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>Back to Explore</span>
                </Link>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchApplication(true)}
                    disabled={refreshing}
                    className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
                    <span>Refresh Status</span>
                </Button>
            </div>

            {/* Main 12-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* ── Left Column: Application Details (8 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="lg:col-span-8 space-y-6"
                >
                    <Card className="border border-border/80 bg-card/80 backdrop-blur-xl shadow-xl overflow-hidden rounded-3xl">
                        {/* Header Banner */}
                        <CardHeader className="p-6 sm:p-8 border-b border-border/50 bg-gradient-to-r from-muted/30 via-transparent to-muted/20">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                                <div className="flex items-center gap-4">
                                    <div className={`h-14 w-14 rounded-2xl ${config.bg} ${config.border} border flex items-center justify-center shrink-0 shadow-inner`}>
                                        <StatusIcon className={`h-7 w-7 ${config.color}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <CardTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                                                Creator Application
                                            </CardTitle>
                                            <Badge variant={config.badgeVariant} className="text-[10px] uppercase font-mono px-2.5 py-0.5">
                                                {config.label}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>Submitted on {formatDateSafe(application.submitted_at || application.created_at)}</span>
                                        </CardDescription>
                                    </div>
                                </div>

                                {/* Action Buttons Based on Status */}
                                <div className="flex items-center gap-2.5 shrink-0">
                                    {application.status === 'approved' && (
                                        <Link to="/dashboard">
                                            <Button className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 shadow-md shadow-emerald-600/20 cursor-pointer text-xs">
                                                <Sparkles className="h-4 w-4" /> Open Artist Studio
                                            </Button>
                                        </Link>
                                    )}

                                    {application.status === 'rejected' && (
                                        <Link to="/apply-artist">
                                            <Button variant="outline" className="h-10 px-5 rounded-xl font-bold gap-2 text-primary border-primary/40 hover:bg-primary/10 cursor-pointer text-xs">
                                                <RefreshCw className="h-4 w-4" /> Submit Revised Application
                                            </Button>
                                        </Link>
                                    )}

                                    {application.status === 'pending' && (
                                        <Badge variant="outline" className="h-8 px-3 rounded-xl border-amber-500/30 bg-amber-500/5 text-amber-300 text-xs font-semibold gap-1.5 hidden sm:flex">
                                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                                            Review In Progress
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8 space-y-6 text-sm">
                            {/* Status Notice Card */}
                            <div className={`p-4 sm:p-5 rounded-2xl border ${config.border} ${config.bg} space-y-2 shadow-inner`}>
                                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                                    <ShieldCheck className={`h-4 w-4 ${config.color}`} />
                                    <span>Review Status Note</span>
                                </div>
                                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                                    {config.desc}
                                </p>
                                {application.rejection_reason && (
                                    <div className="mt-3 pt-3 border-t border-rose-500/20 text-rose-300 text-xs space-y-1">
                                        <strong className="block text-rose-400 font-bold uppercase tracking-wider text-[10px] font-mono">
                                            Curator Feedback:
                                        </strong>
                                        <p className="leading-relaxed">{application.rejection_reason}</p>
                                    </div>
                                )}
                            </div>

                            {/* Artist Bio & Creative Specialties */}
                            {displayBio && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">
                                            Artist Bio &amp; Creative Introduction
                                        </span>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-muted/20 border border-border/70 text-foreground whitespace-pre-wrap leading-relaxed text-xs sm:text-sm space-y-4">
                                        <p className="text-foreground/90 leading-relaxed font-normal">{displayBio}</p>

                                        {/* Specialties Pills */}
                                        {specialties.length > 0 && (
                                            <div className="pt-3 border-t border-border/50 flex items-center gap-2 flex-wrap">
                                                <span className="text-[11px] font-bold text-muted-foreground font-mono uppercase mr-1">
                                                    Specialties:
                                                </span>
                                                {specialties.map((spec, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-semibold text-xs"
                                                    >
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Uploaded Artwork Samples Showcase */}
                            {sampleArtworks.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-emerald-400" />
                                            <span>Uploaded Artwork Samples ({sampleArtworks.length})</span>
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            Click any image to expand in full lightbox
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {sampleArtworks.map((art, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setLightboxIndex(idx);
                                                    setLightboxOpen(true);
                                                }}
                                                className="group relative rounded-2xl overflow-hidden border border-border/70 bg-muted/20 aspect-square cursor-pointer hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
                                            >
                                                <img
                                                    src={art.url}
                                                    alt={art.file_name || `Artwork sample ${idx + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                                                    <span className="self-end px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
                                                        #{idx + 1}
                                                    </span>
                                                    <div className="flex items-center justify-between text-white">
                                                        <span className="text-xs font-medium truncate max-w-[120px]">
                                                            {art.file_name || 'Artwork Sample'}
                                                        </span>
                                                        <Maximize2 className="h-4 w-4 shrink-0" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Submitted External Portfolios */}
                            {portfolioList.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">
                                        Submitted Portfolio Links ({portfolioList.length})
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {portfolioList.map((link, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 text-foreground transition-all group"
                                            >
                                                <a
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2.5 min-w-0 flex-1 hover:text-primary transition-colors"
                                                >
                                                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                        <Globe className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-mono text-xs truncate max-w-[240px] sm:max-w-[180px] lg:max-w-[220px]">
                                                        {link}
                                                    </span>
                                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 opacity-70 group-hover:opacity-100" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(link, idx)}
                                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-2 cursor-pointer"
                                                    title="Copy portfolio link"
                                                >
                                                    {copiedIndex === idx ? (
                                                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                    ) : (
                                                        <Copy className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Website & Social Accounts */}
                            {(application.website || (application.social_links && application.social_links.length > 0)) && (
                                <div className="space-y-3 pt-4 border-t border-border/50">
                                    <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">
                                        Website &amp; Connected Creator Profiles
                                    </span>
                                    <div className="flex flex-wrap gap-2.5">
                                        {application.website && (
                                            <a
                                                href={application.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3.5 py-2 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted text-xs font-semibold flex items-center gap-2 text-foreground transition-all hover:border-primary/40 cursor-pointer shadow-2xs"
                                            >
                                                <Globe className="h-3.5 w-3.5 text-primary" />
                                                <span>Personal Website</span>
                                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                            </a>
                                        )}
                                        {application.social_links?.map((link, i) => (
                                            <a
                                                key={i}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3.5 py-2 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted text-xs font-semibold flex items-center gap-2 text-foreground transition-all hover:border-primary/40 cursor-pointer shadow-2xs"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                                                <span className="truncate max-w-[160px]">{link.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* ── Right Column: Verification Roadmap & Creator Benefits (4 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.05 }}
                    className="lg:col-span-4 space-y-6 lg:sticky lg:top-8"
                >
                    {/* Live Verification Roadmap Card */}
                    <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-xs overflow-hidden rounded-3xl">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span>Verification Roadmap</span>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Live milestone tracker for your application
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4 text-xs">
                            {/* Step 1: Submission */}
                            <div className="flex items-start gap-3">
                                <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-foreground">Portfolio &amp; Art Samples Submitted</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Received on {formatDateSafe(application.submitted_at || application.created_at)}
                                    </p>
                                </div>
                            </div>

                            {/* Step 2: Moderator Review */}
                            <div className="flex items-start gap-3">
                                <div className={`h-7 w-7 rounded-xl ${
                                    application.status === 'approved'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : application.status === 'rejected'
                                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 ring-2 ring-amber-500/20'
                                } flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}>
                                    {application.status === 'approved' ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : application.status === 'rejected' ? (
                                        <XCircle className="h-4 w-4" />
                                    ) : (
                                        <Clock className="h-4 w-4 animate-pulse" />
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-bold text-foreground">Curator &amp; Panel Review</p>
                                        {application.status === 'pending' && (
                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Evaluating originality, drawing style integrity, and community guidelines.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3: Studio Unlock */}
                            <div className="flex items-start gap-3">
                                <div className={`h-7 w-7 rounded-xl ${
                                    application.status === 'approved'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-muted/50 text-muted-foreground border border-border'
                                } flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}>
                                    {application.status === 'approved' ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <Lock className="h-3.5 w-3.5" />
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <p className={`font-bold ${application.status === 'approved' ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                                        Creator Studio &amp; Store Activation
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Unlocks commission service listings, milestone chat, and Midtrans payout ledgers.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Creator Platform Pillars */}
                    <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-xs rounded-3xl p-5 space-y-3.5">
                        <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                            <Shield className="h-4 w-4 text-primary" />
                            <span>Verified Creator Guarantee</span>
                        </div>
                        <div className="space-y-2.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 text-foreground/90">
                                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>100% Upfront Escrow Deposit Protection</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground/90">
                                <Zap className="h-4 w-4 text-blue-400 shrink-0" />
                                <span>Zero Chargeback Risk via Midtrans Integration</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground/90">
                                <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                                <span>Verified Badge on Profile &amp; Commission Listings</span>
                            </div>
                        </div>
                    </Card>

                    {/* Support & Assistance Card */}
                    <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-xs rounded-3xl p-5 space-y-2.5">
                        <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            <span>Need Help or Have Questions?</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Have questions about your verification status or need to update your portfolio links? Reach out to our team anytime.
                        </p>
                        <Link to="/support/tickets/create" className="block pt-1">
                            <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold cursor-pointer">
                                Open Support Ticket
                            </Button>
                        </Link>
                    </Card>
                </motion.div>
            </div>

            {/* Lightbox Modal for Fullscreen Artwork Previews */}
            <MediaLightboxModal
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                mediaList={sampleArtworks.map((a) => ({
                    url: a.url,
                    file_name: a.file_name,
                    media_type: 'image',
                }))}
                initialIndex={lightboxIndex}
            />
        </div>
    );
};
