import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    FileCheck,
    CheckCircle2,
    XCircle,
    ExternalLink,
    ImageIcon,
    Maximize2,
    RefreshCw,
    Search,
    Globe,
} from 'lucide-react';
import { artistApplicationApi } from '@/services/artistService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaLightboxModal } from '@/components/ui/MediaLightboxModal';
import { formatDateSafe } from '@/utils/format';
import { toast } from '@/components/ui/sonner';
import type { ArtistApplication } from '@/types';

const statusTabs = [
    { label: 'Pending Review', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'All Applications', value: 'all' },
];

export const ArtistApplicationsPage: React.FC = () => {
    const [applications, setApplications] = useState<ArtistApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [search, setSearch] = useState('');

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxMedia, setLightboxMedia] = useState<{ url: string; file_name?: string; media_type: string }[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const fetchApplications = async () => {
        try {
            const res = await artistApplicationApi.list();
            setApplications(res.data);
        } catch {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchApplications();
    };

    const handleApprove = async (id: number) => {
        try {
            await artistApplicationApi.approve(id);
            setApplications(applications.map((a) => (a.id === id ? { ...a, status: 'approved' as const } : a)));
            toast.success('Artist application approved! Studio unlocked for creator.');
        } catch {
            toast.error('Failed to approve application');
        }
    };

    const handleReject = async (id: number) => {
        const reason = prompt('Please state the rejection feedback / reason:');
        if (!reason || !reason.trim()) return;
        try {
            await artistApplicationApi.reject(id, reason.trim());
            setApplications(
                applications.map((a) =>
                    a.id === id ? { ...a, status: 'rejected' as const, rejection_reason: reason.trim() } : a
                )
            );
            toast.success('Application rejected with feedback');
        } catch {
            toast.error('Failed to reject application');
        }
    };

    // Filter applications
    const filteredApps = applications.filter((app) => {
        const matchesStatus = statusFilter === 'all' ? true : app.status === statusFilter;
        const matchesSearch =
            !search.trim() ||
            app.user?.username.toLowerCase().includes(search.toLowerCase()) ||
            app.user?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
            app.bio?.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const pendingCount = applications.filter((a) => a.status === 'pending').length;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2.5">
                        <FileCheck className="h-6 w-6 text-amber-400" /> Artist Applications
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Inspect creator sample artworks, verify portfolios, and manage onboarding status
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="rounded-xl gap-2 font-medium"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                </Button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {statusTabs.map((tab) => (
                        <Button
                            key={tab.value}
                            variant={statusFilter === tab.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(tab.value)}
                            className="rounded-xl text-xs whitespace-nowrap h-9 font-medium"
                        >
                            {tab.label}
                            {tab.value === 'pending' && pendingCount > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-white font-mono font-bold">
                                    {pendingCount}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search applicants..."
                        className="pl-9 h-9 rounded-xl text-xs"
                    />
                </div>
            </div>

            {/* Application Cards List */}
            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="border border-border/80">
                            <CardContent className="p-6">
                                <Skeleton className="h-24 w-full rounded-xl" />
                            </CardContent>
                        </Card>
                    ))
                ) : filteredApps.length === 0 ? (
                    <Card className="border border-border/80">
                        <CardContent className="p-12 text-center">
                            <FileCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-sm font-bold text-foreground">No applications found</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {statusFilter === 'pending'
                                    ? 'The pending review queue is completely clear!'
                                    : 'No applications match the current filter.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredApps.map((app) => (
                        <Card
                            key={app.id}
                            className="border border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs rounded-2xl overflow-hidden"
                        >
                            <CardContent className="p-6 space-y-4">
                                {/* Header Info */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            size="md"
                                            fallback={app.user?.display_name || app.user?.username || '?'}
                                            src={app.user?.avatar_url}
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-foreground text-sm">
                                                    {app.user?.display_name || app.user?.username}
                                                </p>
                                                <Badge
                                                    variant={
                                                        app.status === 'pending'
                                                            ? 'gold'
                                                            : app.status === 'approved'
                                                            ? 'teal'
                                                            : 'rose'
                                                    }
                                                    className="text-[10px] uppercase font-mono"
                                                >
                                                    {app.status}
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground font-mono">
                                                @{app.user?.username} • Submitted {formatDateSafe(app.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons for Pending */}
                                    {app.status === 'pending' && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(app.id)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-1.5"
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve Creator
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleReject(app.id)}
                                                className="font-bold rounded-xl text-xs gap-1.5"
                                            >
                                                <XCircle className="h-3.5 w-3.5" /> Decline
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Bio */}
                                {app.bio && (
                                    <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {app.bio}
                                    </div>
                                )}

                                {/* Links */}
                                {((app.portfolio_links && app.portfolio_links.length > 0) || app.portfolio_url || app.website) && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {(app.portfolio_links || (app.portfolio_url ? [app.portfolio_url] : [])).map((link, idx) => (
                                            <a
                                                key={idx}
                                                href={link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:border-primary text-xs font-mono text-primary transition-colors"
                                            >
                                                <ExternalLink className="h-3 w-3 shrink-0" /> {link}
                                            </a>
                                        ))}
                                        {app.website && (
                                            <a
                                                href={app.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:border-primary text-xs font-semibold text-foreground transition-colors"
                                            >
                                                <Globe className="h-3 w-3 text-primary shrink-0" /> Website
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Sample Artworks Gallery */}
                                {app.sample_artworks && app.sample_artworks.length > 0 && (
                                    <div className="space-y-2 pt-1">
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase font-mono flex items-center gap-1.5">
                                            <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                                            Uploaded Samples ({app.sample_artworks.length})
                                        </span>
                                        <div className="flex gap-2.5 flex-wrap">
                                            {app.sample_artworks.map((art, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => {
                                                        setLightboxMedia(
                                                            (app.sample_artworks || []).map((a) => ({
                                                                url: a.url,
                                                                file_name: a.file_name,
                                                                media_type: 'image',
                                                            }))
                                                        );
                                                        setLightboxIndex(idx);
                                                        setLightboxOpen(true);
                                                    }}
                                                    className="group relative w-20 h-20 rounded-2xl overflow-hidden border border-border bg-muted/20 cursor-pointer hover:border-emerald-500/60 transition-all shadow-xs"
                                                >
                                                    <img
                                                        src={art.url}
                                                        alt={art.file_name || `Sample ${idx + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Maximize2 className="h-4 w-4 text-white" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rejection Feedback if any */}
                                {app.rejection_reason && (
                                    <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                                        <strong>Curator Rejection Note:</strong> {app.rejection_reason}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Media Lightbox */}
            <MediaLightboxModal
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                mediaList={lightboxMedia}
                initialIndex={lightboxIndex}
            />
        </motion.div>
    );
};
