import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X,
    Save,
    Lock,
    Image as ImageIcon,
    ShieldAlert,
    UploadCloud,
    Trash2,
    Video,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { portfolioApi } from '@/services/artistService';
import type { Portfolio } from '@/types';

interface EditPortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
    portfolio: Portfolio;
    onPortfolioUpdated: (updatedPortfolio: Portfolio) => void;
    onOpenAppeal?: () => void;
}

interface ExistingMediaItem {
    id: number;
    url: string;
    file_name?: string;
    media_type?: string;
    mime_type?: string;
    is_thumbnail?: boolean;
}

interface NewMediaItem {
    id: string;
    file: File;
    url: string;
    isVideo: boolean;
    name: string;
    size: string;
}

export const EditPortfolioModal: React.FC<EditPortfolioModalProps> = ({
    isOpen,
    onClose,
    portfolio,
    onPortfolioUpdated,
    onOpenAppeal,
}) => {
    const [title, setTitle] = useState(portfolio.title || '');
    const [description, setDescription] = useState(portfolio.description || '');
    const [visibility, setVisibility] = useState<string>(portfolio.visibility || 'public');
    const [tagsInput, setTagsInput] = useState<string>(
        portfolio.tags ? portfolio.tags.map((t) => (typeof t === 'string' ? t : t.name)).join(', ') : ''
    );

    // Existing media from backend
    const [existingMedias, setExistingMedias] = useState<ExistingMediaItem[]>([]);
    const [deleteMediaIds, setDeleteMediaIds] = useState<number[]>([]);

    // New media files to upload
    const [newMediaList, setNewMediaList] = useState<NewMediaItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(portfolio.title || '');
            setDescription(portfolio.description || '');
            setVisibility(portfolio.visibility || 'public');
            setTagsInput(
                portfolio.tags ? portfolio.tags.map((t) => (typeof t === 'string' ? t : t.name)).join(', ') : ''
            );

            // Populate existing media
            const medias: ExistingMediaItem[] = [];
            if (portfolio.media && portfolio.media.length > 0) {
                medias.push(...portfolio.media);
            } else if (portfolio.thumbnail_media) {
                medias.push(portfolio.thumbnail_media);
            }
            setExistingMedias(medias);
            setDeleteMediaIds([]);
            setNewMediaList([]);
        }
    }, [isOpen, portfolio]);

    if (!isOpen) return null;

    const isTakenDown = Boolean(portfolio.is_taken_down);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFilesAdded = (files: FileList | File[]) => {
        const fileArr = Array.from(files);
        const validItems: NewMediaItem[] = [];

        for (const file of fileArr) {
            if (file.size > 25 * 1024 * 1024) {
                toast.error(`File "${file.name}" exceeds 25MB limit.`);
                continue;
            }
            const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
            validItems.push({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                file,
                url: URL.createObjectURL(file),
                isVideo,
                name: file.name,
                size: formatFileSize(file.size),
            });
        }

        if (validItems.length > 0) {
            setNewMediaList((prev) => [...prev, ...validItems]);
        }
    };

    const handleRemoveExisting = (mediaId: number) => {
        setExistingMedias((prev) => prev.filter((m) => m.id !== mediaId));
        setDeleteMediaIds((prev) => [...prev, mediaId]);
    };

    const handleRemoveNew = (id: string) => {
        setNewMediaList((prev) => {
            const item = prev.find((m) => m.id === id);
            if (item) URL.revokeObjectURL(item.url);
            return prev.filter((m) => m.id !== id);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Artwork title cannot be empty.');
            return;
        }

        if (existingMedias.length === 0 && newMediaList.length === 0) {
            toast.error('Artwork must contain at least one image or video media.');
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('visibility', isTakenDown ? 'private' : visibility);
            formData.append('tags', tagsInput.trim());

            // Queue deleted media IDs
            deleteMediaIds.forEach((id, idx) => {
                formData.append(`delete_media_ids[${idx}]`, String(id));
            });

            // Append new media files
            newMediaList.forEach((item) => {
                formData.append('media[]', item.file);
            });

            const updated = await portfolioApi.update(portfolio.id, formData);
            onPortfolioUpdated(updated);

            if (isTakenDown) {
                toast.success('Artwork revisions saved! Moderation desk notified.');
                if (onOpenAppeal) {
                    toast('Would you like to submit an official appeal now?', {
                        action: {
                            label: 'Open Appeal',
                            onClick: () => onOpenAppeal(),
                        },
                    });
                }
            } else {
                toast.success('Artwork updated successfully.');
            }

            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl z-10 max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <ImageIcon className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-foreground">Edit &amp; Revise Artwork</h3>
                                <p className="text-xs text-muted-foreground">Modify title, description, tags, and media attachments</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Moderation Warning Callout if taken down */}
                    {isTakenDown && (
                        <div className="mx-6 mt-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
                            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                            <div>
                                <span className="font-bold text-rose-400">Moderation Take-Down In Effect</span>
                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                    Reason: <span className="text-rose-200">"{portfolio.taken_down_reason || 'Policy Violation'}"</span>.
                                    Revise your artwork details or media to comply with Community Guidelines. Once saved, you can submit an appeal for moderation review.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Artwork Title</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Artwork title..."
                                className="rounded-xl text-xs h-9"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Description / Background Story</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Describe your artwork, tools used, background story..."
                                className="rounded-2xl resize-none text-xs leading-relaxed"
                            />
                        </div>

                        {/* ── Media Gallery & Upload Section ── */}
                        <div className="space-y-3 pt-1 border-t border-border/50">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                                    Artwork Media &amp; Files ({existingMedias.length + newMediaList.length})
                                </label>
                                <span className="text-[11px] text-muted-foreground">PNG, JPG, WEBP, GIF, MP4</span>
                            </div>

                            {/* Existing Media Showcase */}
                            {existingMedias.length > 0 && (
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-semibold text-muted-foreground block">Current Media</span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {existingMedias.map((m, idx) => {
                                            const isVid = m.media_type === 'video' || /\.(mp4|webm|mov)$/i.test(m.url);
                                            const isCover = (m as any).is_thumbnail || idx === 0;

                                            return (
                                                <div
                                                    key={m.id || idx}
                                                    className="relative rounded-2xl overflow-hidden bg-black/60 border border-border/80 group aspect-4/3 flex items-center justify-center shadow-xs"
                                                >
                                                    {isVid ? (
                                                        <video src={m.url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={m.url} alt={m.file_name} className="w-full h-full object-cover" />
                                                    )}

                                                    {/* Badges */}
                                                    <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                                                        {isCover && (
                                                            <span className="bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                                Cover
                                                            </span>
                                                        )}
                                                        {isVid && (
                                                            <span className="bg-rose-600/90 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                                                <Video className="h-2.5 w-2.5" /> Video
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExisting(m.id)}
                                                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-md cursor-pointer z-20"
                                                        title="Remove this media"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Newly Added Media Previews */}
                            {newMediaList.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                    <span className="text-[11px] font-semibold text-emerald-400 block">New Uploads (Will be added)</span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {newMediaList.map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative rounded-2xl overflow-hidden bg-black/60 border border-emerald-500/50 group aspect-4/3 flex items-center justify-center shadow-xs"
                                            >
                                                {item.isVideo ? (
                                                    <video src={item.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                                )}

                                                <div className="absolute top-2 left-2 z-10">
                                                    <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                        New • {item.size}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNew(item.id)}
                                                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center hover:bg-rose-700 transition-colors shadow-md cursor-pointer z-20"
                                                    title="Remove from upload queue"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Drag & Drop Upload Zone */}
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    if (e.dataTransfer.files) {
                                        handleFilesAdded(e.dataTransfer.files);
                                    }
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                                    isDragging
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-border/80 hover:border-purple-500/50 bg-secondary/20 hover:bg-secondary/40'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,video/mp4,video/webm"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            handleFilesAdded(e.target.files);
                                            e.target.value = '';
                                        }
                                    }}
                                    className="hidden"
                                />
                                <div className="h-8 w-8 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                                    <UploadCloud className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-semibold text-foreground">
                                    Click or Drag &amp; Drop to add more images, timelapses or videos
                                </p>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-1.5 pt-1">
                            <label className="text-xs font-semibold text-foreground">Tags (comma separated)</label>
                            <Input
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                placeholder="digital art, character design, fantasy"
                                className="rounded-xl text-xs h-9"
                            />
                        </div>

                        {/* Visibility */}
                        <div className="space-y-1.5 pt-1">
                            <label className="text-xs font-semibold text-foreground">Visibility</label>
                            {isTakenDown ? (
                                <div className="p-2.5 rounded-xl bg-black/40 border border-border/80 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                                    <span>Locked to Private (Under Moderation)</span>
                                </div>
                            ) : (
                                <select
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                    className="w-full h-9 rounded-xl bg-background border border-border px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
                                >
                                    <option value="public">Public (Showcase &amp; Explore)</option>
                                    <option value="followers">Followers Only</option>
                                    <option value="private">Private (Only Me)</option>
                                </select>
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSaving}
                                className="rounded-xl text-xs h-9 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="rounded-xl text-xs h-9 font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 cursor-pointer shadow-md"
                            >
                                <Save className="h-3.5 w-3.5" />
                                <span>{isSaving ? 'Saving Changes...' : 'Save Revisions'}</span>
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
