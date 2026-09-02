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
} from 'lucide-react';
import { artistApplicationApi } from '@/services/artistService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateSafe } from '@/utils/format';
import type { ArtistApplication } from '@/types';

const statusConfig = {
    pending: {
        icon: Clock,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        badgeVariant: 'gold' as const,
        label: 'Under Review',
        desc: 'Our curation team is inspecting your portfolio and verification links. We typically respond within 24 to 48 hours.',
    },
    approved: {
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        badgeVariant: 'teal' as const,
        label: 'Approved & Verified',
        desc: 'Congratulations! Your artist application has been approved. You can now create commission services and manage orders in your Artist Studio.',
    },
    rejected: {
        icon: XCircle,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        badgeVariant: 'rose' as const,
        label: 'Application Declined',
        desc: 'Thank you for your interest. Unfortunately your application was not approved at this time. You are welcome to submit a new application with updated artwork.',
    },
};

export const ApplicationStatusPage: React.FC = () => {
    const [application, setApplication] = useState<ArtistApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetch = async () => {
            try {
                const data = await artistApplicationApi.myApplication();
                if (isMounted) setApplication(data);
            } catch {
                if (isMounted) setNotFound(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetch();
        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (notFound || !application) {
        return (
            <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 text-muted-foreground flex items-center justify-center mx-auto">
                    <FileSearch className="h-8 w-8" />
                </div>
                <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-foreground">No Artist Application Found</h2>
                    <p className="text-sm text-muted-foreground">You haven't submitted an artist application yet.</p>
                </div>
                <Link to="/apply-artist">
                    <Button className="rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white gap-2">
                        <Sparkles className="h-4 w-4" /> Apply as Artist
                    </Button>
                </Link>
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

    return (
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
            <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Explore
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="border border-border/80 bg-card/80 backdrop-blur-xl shadow-xl overflow-hidden rounded-3xl">
                    {/* Header Banner */}
                    <CardHeader className="p-6 border-b border-border/50 bg-gradient-to-r from-muted/30 via-transparent to-muted/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className={`h-12 w-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0`}>
                                    <StatusIcon className={`h-6 w-6 ${config.color}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg font-bold text-foreground">
                                            Creator Application
                                        </CardTitle>
                                        <Badge variant={config.badgeVariant} className="text-[10px] uppercase font-mono">
                                            {config.label}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs mt-0.5">
                                        Submitted on {formatDateSafe(application.submitted_at || application.created_at)}
                                    </CardDescription>
                                </div>
                            </div>

                            {application.status === 'approved' && (
                                <Link to="/dashboard">
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5" /> Open Studio
                                    </Button>
                                </Link>
                            )}

                            {application.status === 'rejected' && (
                                <Link to="/apply-artist">
                                    <Button size="sm" variant="outline" className="rounded-xl font-bold gap-1.5">
                                        <RefreshCw className="h-3.5 w-3.5 text-primary" /> Reapply
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-5 text-xs sm:text-sm">
                        {/* Status Description Banner */}
                        <div className={`p-4 rounded-2xl border ${application.status === 'rejected' ? 'border-rose-500/30 bg-rose-500/10' : application.status === 'approved' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'} space-y-1.5`}>
                            <p className="font-bold text-foreground flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-primary" /> Review Status Note
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {config.desc}
                            </p>
                            {application.rejection_reason && (
                                <div className="mt-2 pt-2 border-t border-rose-500/20 text-rose-300 text-xs">
                                    <strong>Curator Feedback:</strong> {application.rejection_reason}
                                </div>
                            )}
                        </div>

                        {/* Bio Section */}
                        {application.bio && (
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase font-mono">
                                    Artist Bio &amp; Introduction
                                </span>
                                <p className="p-4 rounded-2xl bg-muted/30 border border-border/60 text-foreground whitespace-pre-wrap leading-relaxed text-xs">
                                    {application.bio}
                                </p>
                            </div>
                        )}

                        {/* Portfolio Links */}
                        {portfolioList.length > 0 && (
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase font-mono">
                                    Submitted Portfolios ({portfolioList.length})
                                </span>
                                <div className="space-y-2">
                                    {portfolioList.map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/70 hover:border-primary/50 text-foreground transition-all group"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Globe className="h-4 w-4 text-primary shrink-0" />
                                                <span className="font-mono text-xs truncate">{link}</span>
                                            </div>
                                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Website & Social Links */}
                        {(application.website || (application.social_links && application.social_links.length > 0)) && (
                            <div className="space-y-1.5 pt-2 border-t border-border/50">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase font-mono">
                                    Website &amp; Social Links
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {application.website && (
                                        <a
                                            href={application.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-xl border border-border bg-muted/20 hover:bg-muted text-xs font-semibold flex items-center gap-1.5 text-foreground transition-colors"
                                        >
                                            <Globe className="h-3.5 w-3.5 text-purple-400" /> Website
                                        </a>
                                    )}
                                    {application.social_links?.map((link, i) => (
                                        <a
                                            key={i}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-xl border border-border bg-muted/20 hover:bg-muted text-xs font-semibold flex items-center gap-1.5 text-foreground transition-colors"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5 text-pink-400" /> Link #{i + 1}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
