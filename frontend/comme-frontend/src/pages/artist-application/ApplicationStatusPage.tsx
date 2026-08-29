import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, CheckCircle2, XCircle, FileSearch } from 'lucide-react';
import { artistApplicationApi } from '@/services/artistService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ArtistApplication } from '@/types';

const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Under Review' },
    approved: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Approved' },
    rejected: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'Rejected' },
};

export const ApplicationStatusPage: React.FC = () => {
    const [application, setApplication] = useState<ArtistApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await artistApplicationApi.myApplication();
                setApplication(data);
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="max-w-xl mx-auto px-4 py-8">
                <Skeleton className="h-48 w-full rounded-xl" />
            </div>
        );
    }

    if (notFound || !application) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center">
                <FileSearch className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">No application found</p>
                <Link to="/apply-artist">
                    <Button>Apply Now</Button>
                </Link>
            </div>
        );
    }

    const config = statusConfig[application.status];
    const StatusIcon = config.icon;

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold mb-6">Application Status</h1>

                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${config.bg}`}>
                                <StatusIcon className={`h-8 w-8 ${config.color}`} />
                            </div>
                            <div>
                                <Badge variant="secondary">{config.label}</Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Submitted on {new Date(application.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Portfolio URL</p>
                                <a href={application.portfolio_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                    {application.portfolio_url}
                                </a>
                            </div>

                            {application.social_links && application.social_links.length > 0 && (
                                <div>
                                    <p className="text-muted-foreground">Social Links</p>
                                    <ul className="list-disc list-inside">
                                        {application.social_links.map((link, i) => (
                                            <li key={i}>
                                                <a href={link} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">{link}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {application.note && (
                                <div>
                                    <p className="text-muted-foreground">Note</p>
                                    <p>{application.note}</p>
                                </div>
                            )}

                            {application.rejection_reason && (
                                <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-4">
                                    <p className="text-sm font-medium text-rose-400 mb-1">Rejection Reason</p>
                                    <p className="text-sm">{application.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
