import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react';
import { commissionServiceApi } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { CommissionService } from '@/types';

export const ManageServicesPage: React.FC = () => {
    const [services, setServices] = useState<CommissionService[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await commissionServiceApi.list();
                setServices(res.data);
            } catch {
                toast.error('Failed to load services');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this service?')) return;
        try {
            await commissionServiceApi.destroy(id);
            setServices(services.filter((s) => s.id !== id));
            toast.success('Service deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="h-6 w-6" /> My Services
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage your commission service offerings</p>
                </div>
                <Link to="/dashboard/services/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" /> New Service
                    </Button>
                </Link>
            </div>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
                    ))
                ) : services.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground mb-4">No services yet</p>
                            <Link to="/dashboard/services/new">
                                <Button>Create Your First Service</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    services.map((svc) => (
                        <Card key={svc.id} className="hover:border-primary/30 transition-colors">
                            <CardContent className="p-5 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-sm truncate">{svc.name}</h3>
                                        <Badge variant="secondary" className="text-[10px]">{svc.status}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{svc.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {svc.options?.length || 0} options
                                    </p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Link to={`/dashboard/services/${svc.id}/edit`}>
                                        <Button variant="outline" size="icon">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button variant="outline" size="icon" onClick={() => handleDelete(svc.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </motion.div>
    );
};
