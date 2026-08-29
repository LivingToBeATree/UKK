import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, ImageIcon, Palette } from 'lucide-react';
import { portfolioApi, type Portfolio } from '@/services/artistService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';

export const ManagePortfolioPage: React.FC = () => {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await portfolioApi.list();
                setPortfolios(res.data);
            } catch {
                toast.error('Failed to load portfolio');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            if (description) formData.append('description', description);
            const item = await portfolioApi.create(formData);
            setPortfolios([item, ...portfolios]);
            setTitle('');
            setDescription('');
            setShowForm(false);
            toast.success('Portfolio item added!');
        } catch {
            toast.error('Failed to create');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this portfolio item?')) return;
        try {
            await portfolioApi.destroy(id);
            setPortfolios(portfolios.filter((p) => p.id !== id));
            toast.success('Deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Palette className="h-6 w-6" /> Portfolio
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Showcase your best work</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Artwork title" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add'}</Button>
                                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)
                ) : portfolios.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">No portfolio items yet</p>
                    </div>
                ) : (
                    portfolios.map((item) => (
                        <Card key={item.id} className="overflow-hidden group">
                            <div className="h-48 bg-muted relative">
                                {item.media && item.media[0] ? (
                                    <img src={item.media[0].url} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No image</div>
                                )}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-bold text-sm">{item.title}</h3>
                                {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </motion.div>
    );
};
