import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
    ExternalLink,
    Film,
    Eye,
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
    name: string;
}

export const ManagePortfolioPage: React.FC = () => {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isStarred, setIsStarred] = useState(false);
    const [postAsArtwork, setPostAsArtwork] = useState(true);

    // 1. Primary / Main Artwork Upload State
    const [mainArtwork, setMainArtwork] = useState<MediaPreviewItem | null>(null);
    const [isDraggingMain, setIsDraggingMain] = useState(false);
    const mainFileInputRef = useRef<HTMLInputElement>(null);

    // 2. Additional Process Media & Timelapses State
    const [additionalMedia, setAdditionalMedia] = useState<MediaPreviewItem[]>([]);
    const [isDraggingAdd, setIsDraggingAdd] = useState(false);
    const addFileInputRef = useRef<HTMLInputElement>(null);

    const [submitting, setSubmitting] = useState(false);

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

    // Main artwork handlers
    const handleMainFile = (file: File) => {
        const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
        const maxAllowedSize = isVideo ? 50 * 1024 * 1024 : 20 * 1024 * 1024;

        if (file.size > maxAllowedSize) {
            toast.error(`Main artwork file is too large (max ${isVideo ? '50MB' : '20MB'})`);
            return;
        }

        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            toast.error('Please upload a valid image or video file');
            return;
        }

        if (mainArtwork) {
            URL.revokeObjectURL(mainArtwork.url);
        }

        const url = URL.createObjectURL(file);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setMainArtwork({
            id: Math.random().toString(36).substring(2, 9),
            file,
            url,
            isVideo,
            size: `${sizeMb} MB`,
            name: file.name,
        });
        toast.success(`Main artwork selected: ${file.name}`);
    };

    const handleRemoveMain = () => {
        if (mainArtwork) {
            URL.revokeObjectURL(mainArtwork.url);
            setMainArtwork(null);
        }
    };

    // Additional media handlers (timelapses, WIPs)
    const handleAdditionalFiles = (files: FileList | File[]) => {
        const validItems: MediaPreviewItem[] = [];

        Array.from(files).forEach((file) => {
            if (additionalMedia.length + validItems.length >= 7) {
                toast.error('Maximum 7 additional process files / timelapses');
                return;
            }

            const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
            const maxAllowedSize = isVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024;

            if (file.size > maxAllowedSize) {
                toast.error(`File ${file.name} is too large (max ${isVideo ? '100MB' : '20MB'})`);
                return;
            }

            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                toast.error(`File ${file.name} is not a supported format`);
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
                name: file.name,
            });
        });

        if (validItems.length > 0) {
            setAdditionalMedia((prev) => [...prev, ...validItems]);
            toast.success(`Added ${validItems.length} process attachment(s)`);
        }
    };

    const handleRemoveAdditional = (index: number) => {
        URL.revokeObjectURL(additionalMedia[index].url);
        setAdditionalMedia((prev) => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setIsStarred(false);
        setPostAsArtwork(true);
        if (mainArtwork) URL.revokeObjectURL(mainArtwork.url);
        additionalMedia.forEach((m) => URL.revokeObjectURL(m.url));
        setMainArtwork(null);
        setAdditionalMedia([]);
        setShowForm(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Please enter an artwork title');
            return;
        }

        if (!mainArtwork) {
            toast.error('Please upload your main artwork piece');
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
            formData.append('starred', isStarred ? '1' : '0');
            formData.append('post_as_artwork', postAsArtwork ? '1' : '0');

            // 1. Append Main Artwork FIRST (index 0 / cover)
            formData.append('media[]', mainArtwork.file);

            // 2. Append Additional Process Media / Timelapses sequentially
            additionalMedia.forEach((item) => {
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

    const handleToggleStar = async (item: Portfolio, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const nextStarred = !Boolean(item.starred);
        try {
            await portfolioApi.toggleStar(item.id, nextStarred);
            setPortfolios((prev) =>
                prev.map((p) => (p.id === item.id ? { ...p, starred: nextStarred } : p))
            );
            toast.success(nextStarred ? 'Marked as Featured!' : 'Removed from Featured');
        } catch {
            toast.error('Failed to update featured status');
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
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
                        Showcase your original artwork illustrations, timelapses, character designs, and creative projects.
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
                        <Card className="rounded-3xl border-purple-500/30 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden mb-6">
                            <CardContent className="p-6 sm:p-8">
                                <form onSubmit={handleCreate} className="space-y-6">
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

                                    {/* ── TOP SECTION: Main Artwork Piece (Cover / Hero) ── */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                                1. Main Artwork Piece <span className="text-rose-400">*</span>
                                            </Label>
                                            <span className="text-[11px] text-muted-foreground">Primary piece shown on feed</span>
                                        </div>

                                        {!mainArtwork ? (
                                            <div
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setIsDraggingMain(true);
                                                }}
                                                onDragLeave={() => setIsDraggingMain(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setIsDraggingMain(false);
                                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                        handleMainFile(e.dataTransfer.files[0]);
                                                    }
                                                }}
                                                onClick={() => mainFileInputRef.current?.click()}
                                                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                                                    isDraggingMain
                                                        ? 'border-purple-500 bg-purple-500/10 scale-[0.99]'
                                                        : 'border-purple-500/40 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/10'
                                                }`}
                                            >
                                                <input
                                                    ref={mainFileInputRef}
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,video/mp4,video/webm"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            handleMainFile(e.target.files[0]);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                                <div className="h-12 w-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-inner">
                                                    <UploadCloud className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">
                                                        Upload Main Artwork (Primary Piece)
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        PNG, JPG, WEBP, GIF, or MP4 (Up to 20MB)
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative rounded-2xl overflow-hidden bg-black/60 border-2 border-purple-500/60 p-2 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/80 shrink-0 border border-white/10">
                                                        {mainArtwork.isVideo ? (
                                                            <video src={mainArtwork.url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <img src={mainArtwork.url} alt="Main Artwork" className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                                                MAIN ARTWORK / COVER
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">{mainArtwork.size}</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-foreground truncate">{mainArtwork.name}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pr-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => mainFileInputRef.current?.click()}
                                                        className="rounded-xl text-xs font-semibold cursor-pointer"
                                                    >
                                                        Change
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={handleRemoveMain}
                                                        className="rounded-xl h-8 w-8 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── BOTTOM SECTION: Additional Media, Timelapses & WIPs (Optional) ── */}
                                    <div className="space-y-2 pt-2 border-t border-border/60">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                <Film className="h-3.5 w-3.5 text-blue-400" />
                                                2. Additional Media, Timelapses & Process WIPs (Optional)
                                            </Label>
                                            <span className="text-[11px] text-muted-foreground">Speedpaints, sketches, alternate views ({additionalMedia.length}/7)</span>
                                        </div>

                                        <div
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setIsDraggingAdd(true);
                                            }}
                                            onDragLeave={() => setIsDraggingAdd(false)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setIsDraggingAdd(false);
                                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                    handleAdditionalFiles(e.dataTransfer.files);
                                                }
                                            }}
                                            onClick={() => addFileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                                                isDraggingAdd
                                                    ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                                                    : 'border-border/80 hover:border-blue-500/50 bg-secondary/15 hover:bg-secondary/30'
                                            }`}
                                        >
                                            <input
                                                ref={addFileInputRef}
                                                type="file"
                                                multiple
                                                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,video/mp4,video/webm"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files.length > 0) {
                                                        handleAdditionalFiles(e.target.files);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                            <div className="h-9 w-9 rounded-xl bg-blue-600/15 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                                <Video className="h-4 w-4" />
                                            </div>
                                            <p className="text-xs font-bold text-foreground">
                                                Attach Timelapses (MP4), Process Videos, Sketches & Alternate Colors
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Click or drag up to 7 additional files (Timelapses up to 100MB)
                                            </p>
                                        </div>

                                        {/* Additional Media Thumbnails Grid */}
                                        {additionalMedia.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                                {additionalMedia.map((item, idx) => (
                                                    <div
                                                        key={item.id}
                                                        className="relative w-24 h-24 rounded-2xl overflow-hidden bg-black/60 border border-border/80 group shrink-0 shadow-xs"
                                                    >
                                                        {item.isVideo ? (
                                                            <video src={item.url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <img src={item.url} alt="preview" className="w-full h-full object-cover" />
                                                        )}

                                                        <div className="absolute top-1.5 left-1.5">
                                                            {item.isVideo ? (
                                                                <span className="bg-blue-600/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                                                    <Video className="h-2 w-2" /> TIMELAPSE
                                                                </span>
                                                            ) : (
                                                                <span className="bg-black/75 backdrop-blur-md text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                                    WIP {idx + 1}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveAdditional(idx);
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

                                    {/* ── 3. Artwork Title ── */}
                                    <div className="space-y-1.5 pt-2">
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

                                    {/* ── 4. Description ── */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="desc" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Description & Process Notes (Optional)
                                        </Label>
                                        <Textarea
                                            id="desc"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Mention tools used (Clip Studio, Blender, Photoshop), background lore, design inspiration, or client context..."
                                            className="min-h-[90px] rounded-2xl bg-secondary/40 border-border/80 text-xs"
                                        />
                                    </div>

                                    {/* ── 5. Options: Featured & Post as Artwork ── */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
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

                                        <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={postAsArtwork}
                                                onChange={(e) => setPostAsArtwork(e.target.checked)}
                                                className="rounded border-border text-purple-600 focus:ring-purple-500 h-4 w-4"
                                            />
                                            <span className="flex items-center gap-1.5">
                                                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                                                Post as an artwork
                                                <span className="text-[10px] font-normal text-muted-foreground">(also shares to community feed)</span>
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
                                            disabled={submitting || !title.trim() || !mainArtwork}
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
                            item.cover_image_url ||
                            null;

                        const isCoverVideo = coverUrl && /\.(mp4|webm|mov|mkv)$/i.test(coverUrl);

                        return (
                            <Card
                                key={item.id}
                                className="group relative rounded-3xl overflow-hidden border border-border/80 hover:border-purple-500/60 bg-card transition-all duration-300 hover:shadow-xl flex flex-col"
                            >
                                {/* Media Container */}
                                <Link
                                    to={`/portfolio/${item.id}`}
                                    className="h-60 bg-secondary/40 relative overflow-hidden flex items-center justify-center cursor-pointer block"
                                >
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

                                    {/* Starred / Featured Toggle Badge Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleToggleStar(item, e)}
                                        className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 transition-all cursor-pointer z-10 ${
                                            (item as any).starred
                                                ? 'bg-amber-500 text-black hover:bg-amber-400 scale-100'
                                                : 'bg-black/60 text-white/70 hover:text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/20'
                                        }`}
                                        title={(item as any).starred ? 'Featured Artwork (Click to unfeature)' : 'Click to feature this artwork'}
                                    >
                                        <Star className={`h-3 w-3 ${(item as any).starred ? 'fill-black text-black' : 'text-white'}`} />
                                        {(item as any).starred ? 'FEATURED' : 'Feature'}
                                    </button>

                                    {/* Media Count Badge */}
                                    {item.media && item.media.length > 1 && (
                                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                                            <Layers className="h-3 w-3 text-purple-300" /> {item.media.length} Files
                                        </div>
                                    )}

                                    {/* Hover "View Artwork" pill */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <span className="px-3 py-1.5 rounded-full bg-white/90 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                                            <Eye className="h-3.5 w-3.5" /> View Artwork
                                        </span>
                                    </div>
                                </Link>

                                {/* Delete Button */}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full shadow-lg cursor-pointer z-20"
                                    onClick={(e) => handleDelete(item.id, e)}
                                    title="Delete artwork"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>

                                {/* Content */}
                                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-2">
                                    <Link to={`/portfolio/${item.id}`} className="block group-hover:text-purple-300 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-bold text-sm text-foreground truncate group-hover:text-purple-300 transition-colors">
                                                {item.title}
                                            </h3>
                                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        {item.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                                {item.description}
                                            </p>
                                        )}
                                    </Link>
                                    <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                                        <span>
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleDateString(undefined, {
                                                      month: 'short',
                                                      day: 'numeric',
                                                      year: 'numeric',
                                                  })
                                                : 'Recently added'}
                                        </span>
                                        <Link
                                            to={`/portfolio/${item.id}`}
                                            className="text-purple-400 hover:text-purple-300 font-bold hover:underline"
                                        >
                                            Details →
                                        </Link>
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
