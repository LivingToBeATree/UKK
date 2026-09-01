import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plus,
    Trash2,
    ImageIcon,
    Palette,
    UploadCloud,
    X,
    Star,
    Sparkles,
    CheckCircle2,
    Layers,
    Video,
} from 'lucide-react';
import { portfolioApi, type Portfolio } from '@/services/artistService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';

interface MediaPreviewItem {
    id: string;
    file: File;
    url: string;
    isVideo: boolean;
    size: string;
}

export const ManagePortfolioPage: React.FC = () => {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isStarred, setIsStarred] = useState(false);
    const [mediaPreviews, setMediaPreviews] = useState<MediaPreviewItem[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPortfolios = async () => {
        try {
            setLoading(true);
            const res = await portfolioApi.list();
            setPortfolios(res.data || []);
        } catch {
            toast.error('Failed to load portfolio items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolios();
    }, []);

    const handleFiles = (files: FileList | File[]) => {
        const validItems: MediaPreviewItem[] = [];

        Array.from(files).forEach((file) => {
            if (mediaPreviews.length + validItems.length >= 8) {
                toast.error('Maximum 8 media files per portfolio piece');
                return;
            }

            const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
            const maxAllowedSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;

            if (file.size > maxAllowedSize) {
                toast.error(`File ${file.name} is too large (max ${isVideo ? '50MB' : '15MB'})`);
                return;
            }

            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                toast.error(`File ${file.name} is not a supported image or video format`);
                return;
            }

            const url = URL.createObjectURL(file);
            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

            validItems.push({
                id: Math.random().toString(36).substring(2, 9),
                file,
                url,
                isVideo,
                size: `${sizeMb} MB`,
            });
        });

        if (validItems.length > 0) {
            setMediaPreviews((prev) => [...prev, ...validItems]);
        }
    };

    const handleRemoveMedia = (index: number) => {
        URL.revokeObjectURL(mediaPreviews[index].url);
        setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setIsStarred(false);
        mediaPreviews.forEach((m) => URL.revokeObjectURL(m.url));
        setMediaPreviews([]);
        setShowForm(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Please enter an artwork title');
            return;
        }

        if (mediaPreviews.length === 0) {
            toast.error('Please attach at least one artwork image or video');
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading('Uploading artwork to portfolio...');

        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            if (description.trim()) {
                formData.append('description', description.trim());
            }
            if (isStarred) {
                formData.append('starred', '1');
            }

            mediaPreviews.forEach((item) => {
                formData.append('media[]', item.file);
            });

            const newItem = await portfolioApi.create(formData);
            setPortfolios((prev) => [newItem, ...prev]);
            resetForm();
            toast.dismiss(toastId);
            toast.success('Artwork added to your portfolio!');
        } catch {
            toast.dismiss(toastId);
            toast.error('Failed to create portfolio item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this artwork?')) return;
        try {
            await portfolioApi.destroy(id);
            setPortfolios((prev) => prev.filter((p) => p.id !== id));
            toast.success('Artwork removed from portfolio');
        } catch {
            toast.error('Failed to delete artwork');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2.5 text-foreground">
                        <Palette className="h-6 w-6 text-purple-400" />
                        Portfolio Works
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Showcase your original artwork illustrations, character designs, and creative projects.
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="h-10 px-5 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md gap-2 shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    {showForm ? 'Close Uploader' : 'Upload Artwork'}
                </Button>
            </div>

            {/* Upload Artwork Form Drawer / Card */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="rounded-3xl border-purple-500/30 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden mb-6">
                            <CardContent className="p-6">
                                <form onSubmit={handleCreate} className="space-y-5">
                                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-purple-400" />
                                            <h2 className="text-base font-bold text-foreground">
                                                Add New Artwork
                                            </h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* 1. Drag & Drop Media Upload Area */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Artwork Images / Videos (Up to 8 files)
                                        </Label>

                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                                                isDragging
                                                    ? 'border-purple-500 bg-purple-500/10 scale-[0.99]'
                                                    : 'border-border/80 hover:border-purple-500/50 bg-secondary/20 hover:bg-secondary/40'
                                            }`}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                                                onChange={handleFileInputChange}
                                                className="hidden"
                                            />
                                            <div className="h-12 w-12 rounded-2xl bg-purple-600/15 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-inner">
                                                <UploadCloud className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">
                                                    Click to upload or drag & drop artwork
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    PNG, JPG, WEBP, GIF, or MP4 (Up to 15MB per image, 50MB per video)
                                                </p>
                                            </div>
                                        </div>

                                        {/* Attached Media Thumbnails Strip */}
                                        {mediaPreviews.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                                {mediaPreviews.map((item, idx) => (
                                                    <div
                                                        key={item.id}
                                                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-black/60 border border-border/80 group shrink-0 shadow-xs"
                                                    >
                                                        {item.isVideo ? (
                                                            <video src={item.url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <img src={item.url} alt="preview" className="w-full h-full object-cover" />
                                                        )}

                                                        <div className="absolute top-1.5 left-1.5">
                                                            {item.isVideo ? (
                                                                <span className="bg-blue-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                                                    <Video className="h-2 w-2" /> VID
                                                                </span>
                                                            ) : (
                                                                <span className="bg-black/70 backdrop-blur-md text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                                    {idx === 0 ? 'COVER' : 'IMG'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveMedia(idx);
                                                            }}
                                                            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. Artwork Title */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Artwork Title <span className="text-rose-400">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Cyberpunk Samurai - Character Concept"
                                            required
                                            className="h-11 rounded-2xl bg-secondary/40 border-border/80 text-sm font-medium"
                                        />
                                    </div>

                                    {/* 3. Description */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="desc" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Description & Process Notes (Optional)
                                        </Label>
                                        <Textarea
                                            id="desc"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Mention tools used, background story, design inspiration, or client context..."
                                            className="min-h-[90px] rounded-2xl bg-secondary/40 border-border/80 text-xs"
                                        />
                                    </div>

                                    {/* 4. Starred / Featured Toggle */}
                                    <div className="flex items-center gap-3 pt-1">
                                        <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isStarred}
                                                onChange={(e) => setIsStarred(e.target.checked)}
                                                className="rounded border-border text-purple-600 focus:ring-purple-500 h-4 w-4"
                                            />
                                            <span className="flex items-center gap-1">
                                                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                                Highlight as Featured Artwork
                                            </span>
                                        </label>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={resetForm}
                                            className="h-10 px-4 rounded-xl text-xs font-semibold cursor-pointer"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={submitting || !title.trim() || mediaPreviews.length === 0}
                                            className="h-10 px-6 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md gap-2"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            {submitting ? 'Publishing...' : 'Publish to Portfolio'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Artwork Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="rounded-3xl overflow-hidden border-border/80 p-0">
                            <Skeleton className="h-56 w-full rounded-none" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-56" />
                            </div>
                        </Card>
                    ))
                ) : portfolios.length === 0 ? (
                    <Card className="col-span-full rounded-3xl border-dashed border-border/80 p-16 text-center bg-card/40">
                        <div className="h-16 w-16 rounded-3xl bg-purple-500/15 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                            <ImageIcon className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No portfolio artworks yet</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
                            Upload your original artwork illustrations and designs so prospective clients can explore your talent.
                        </p>
                        <Button
                            onClick={() => setShowForm(true)}
                            className="h-10 px-5 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md gap-2"
                        >
                            <Plus className="h-4 w-4" /> Upload Your First Artwork
                        </Button>
                    </Card>
                ) : (
                    portfolios.map((item) => {
                        const coverUrl =
                            (item as any).thumbnail_media?.url ||
                            (item.media && item.media[0]?.url) ||
                            null;

                        const isCoverVideo = coverUrl && /\.(mp4|webm|mov|mkv)$/i.test(coverUrl);

                        return (
                            <Card
                                key={item.id}
                                className="group rounded-3xl overflow-hidden border border-border/80 hover:border-purple-500/60 bg-card transition-all duration-300 hover:shadow-xl flex flex-col"
                            >
                                {/* Media Container */}
                                <div className="h-60 bg-secondary/40 relative overflow-hidden flex items-center justify-center">
                                    {coverUrl ? (
                                        isCoverVideo ? (
                                            <video
                                                src={coverUrl}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                muted
                                                loop
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={coverUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground gap-1 text-xs">
                                            <ImageIcon className="h-8 w-8 opacity-40" />
                                            <span>No preview media</span>
                                        </div>
                                    )}

                                    {/* Starred / Featured Badge */}
                                    {(item as any).starred && (
                                        <div className="absolute top-3 left-3 bg-amber-500/90 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-black" /> FEATURED
                                        </div>
                                    )}

                                    {/* Media Count Badge */}
                                    {item.media && item.media.length > 1 && (
                                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                                            <Layers className="h-3 w-3" /> {item.media.length} Files
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full shadow-lg cursor-pointer"
                                        onClick={() => handleDelete(item.id)}
                                        title="Delete artwork"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                {/* Content */}
                                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-2">
                                    <div>
                                        <h3 className="font-bold text-sm text-foreground truncate group-hover:text-purple-300 transition-colors">
                                            {item.title}
                                        </h3>
                                        {item.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};
