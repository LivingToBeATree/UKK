import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileCheck, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { artistApplicationApi } from '@/services/artistService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { ArtistApplication } from '@/types';

export const ArtistApplicationsPage: React.FC = () => {
    const [applications, setApplications] = useState<ArtistApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await artistApplicationApi.list();
                setApplications(res.data);
            } catch {
                toast.error('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await artistApplicationApi.approve(id);
            setApplications(applications.map((a) => a.id === id ? { ...a, status: 'approved' as const } : a));
            toast.success('Application approved!');
        } catch {
            toast.error('Failed to approve');
        }
    };

    const handleReject = async (id: number) => {
        const reason = prompt('Rejection reason:');
        if (!reason) return;
        try {
            await artistApplicationApi.reject(id, reason);
            setApplications(applications.map((a) => a.id === id ? { ...a, status: 'rejected' as const, rejection_reason: reason } : a));
            toast.success('Application rejected');
        } catch {
            toast.error('Failed to reject');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileCheck className="h-6 w-6" /> Artist Applications
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Review and manage artist applications</p>
            </div>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
                    ))
                ) : applications.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">No applications</p>
                        </CardContent>
                    </Card>
                ) : (
                    applications.map((app) => (
                        <Card key={app.id} className="hover:border-primary/30 transition-colors">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar size="sm" fallback={app.user?.display_name || app.user?.username || '?'} src={app.user?.avatar_url} />
                                        <div>
                                            <p className="font-bold text-sm">{app.user?.display_name || app.user?.username}</p>
                                            <p className="text-[11px] text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Badge variant={app.status === 'pending' ? 'secondary' : app.status === 'approved' ? 'teal' : 'rose'}>
                                        {app.status}
                                    </Badge>
                                </div>

                                <div className="text-sm space-y-1">
                                    <a href={app.portfolio_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                                        <ExternalLink className="h-3 w-3" /> {app.portfolio_url}
                                    </a>
                                    {app.note && <p className="text-xs text-muted-foreground">{app.note}</p>}
                                </div>

                                {app.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleApprove(app.id)}>
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}>
                                            <XCircle className="h-3 w-3 mr-1" /> Reject
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </motion.div>
    );
};
