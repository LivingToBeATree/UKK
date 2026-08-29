import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flag, CheckCircle2 } from 'lucide-react';
import { reportService } from '@/services/reportService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { Report } from '@/types';

export const ReportsPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await reportService.list();
                setReports(res.data);
            } catch {
                toast.error('Failed to load reports');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleResolve = async (id: number) => {
        try {
            await reportService.update(id, { status: 'resolved' });
            setReports(reports.map((r) => r.id === id ? { ...r, status: 'resolved' as const } : r));
            toast.success('Report resolved');
        } catch {
            toast.error('Failed to resolve');
        }
    };

    const handleDismiss = async (id: number) => {
        try {
            await reportService.update(id, { status: 'dismissed' });
            setReports(reports.map((r) => r.id === id ? { ...r, status: 'dismissed' as const } : r));
            toast.success('Report dismissed');
        } catch {
            toast.error('Failed to dismiss');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Flag className="h-6 w-6" /> Reports
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Review user-submitted reports</p>
            </div>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
                    ))
                ) : reports.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Flag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">No reports</p>
                        </CardContent>
                    </Card>
                ) : (
                    reports.map((report) => (
                        <Card key={report.id} className="hover:border-primary/30 transition-colors">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-sm">
                                            Report #{report.id} — {report.reportable_type}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{report.reason}</p>
                                        <p className="text-[11px] text-muted-foreground mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <Badge variant={report.status === 'pending' ? 'secondary' : 'rose'}>
                                        {report.status}
                                    </Badge>
                                </div>

                                {(report.status === 'pending' || report.status === 'investigating') && (
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleResolve(report.id)}>
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Resolve
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleDismiss(report.id)}>
                                            Dismiss
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
