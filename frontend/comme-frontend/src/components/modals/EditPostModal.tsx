import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X,
    Save,
    Lock,
    ShieldAlert,
    FileText,
    Palette,
    UploadCloud,
    Trash2,
    Video,
    Sparkles,
    Check,
    Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { postService } from '@/services/postService';
import { portfolioApi } from '@/services/artistService';
import { useAuth } from '@/hooks/useAuth';
import type { Post, Portfolio, MediaItem } from '@/types';

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
    onPostUpdated: (updatedPost: Post) => void;
    onOpenAppeal?: () => void;
}

interface NewMediaItem {
    id: string;
    file: File;
    url: string;
    isVideo: boolean;
    name: string;
    size: string;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
    isOpen,
    onClose,
    post,
    onPostUpdated,
    onOpenAppeal,
}) => {
    const { user } = useAuth();
    const [content, setContent] = useState(post.content || '');
    const [visibility, setVisibility] = useState<string>(post.visibility || 'public');
    const [commentable, setCommentable] = useState<boolean>(post.commentable ?? true);
    const [tagsInput, setTagsInput] = useState<string>(
        post.tags ? post.tags.map((t) => (typeof t === 'string' ? t : t.name)).join(', ') : ''
    );

    // Artwork attachment
    const [attachedPortfolio, setAttachedPortfolio] = useState<Portfolio | null>(post.portfolio || null);
    const [userPortfolios, setUserPortfolios] = useState<Portfolio[]>([]);
    const [loadingPortfolios, setLoadingPortfolios] = useState(false);
    const [showArtworkPicker, setShowArtworkPicker] = useState(false);

    // Existing media from backend
    const [existingMedias, setExistingMedias] = useState<MediaItem[]>([]);
    const [deleteMediaIds, setDeleteMediaIds] = useState<number[]>([]);

    // New media files to upload
    const [newMediaList, setNewMediaList] = useState<NewMediaItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setContent(post.content || '');
            setVisibility(post.visibility || 'public');
            setCommentable(post.commentable ?? true);
            setTagsInput(
                post.tags ? post.tags.map((t) => (typeof t === 'string' ? t : t.name)).join(', ') : ''
            );
            setAttachedPortfolio(post.portfolio || null);
            setShowArtworkPicker(false);

            // Populate existing media
            const medias: MediaItem[] = [];
            if (post.media && post.media.length > 0) {
                medias.push(...post.media);
            }
            setExistingMedias(medias);
            setDeleteMediaIds([]);
            setNewMediaList([]);

            // Fetch user's artworks if artist
            if (user?.artist_profile || post.user?.artist_profile) {
                setLoadingPortfolios(true);
                portfolioApi
                    .list(1)
                    .then((res) => {
                        setUserPortfolios(res.data || []);
                    })
                    .catch(() => {})
                    .finally(() => setLoadingPortfolios(false));
            }
        }
    }, [isOpen, post, user]);

    if (!isOpen) return null;

    const isTakenDown = Boolean(post.is_taken_down);

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
        if (!content.trim()) {
            toast.error('Post caption/content cannot be empty.');
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('content', content.trim());
            formData.append('visibility', isTakenDown ? 'private' : visibility);
            formData.append('commentable', commentable ? '1' : '0');
            formData.append('tags', tagsInput.trim());

            // Portfolio Attachment
            if (attachedPortfolio) {
                formData.append('portfolio_id', String(attachedPortfolio.id));
            } else {
                formData.append('portfolio_id', '');
            }

            // Queue deleted media IDs
            deleteMediaIds.forEach((id, idx) => {
                formData.append(`delete_media_ids[${idx}]`, String(id));
            });

            // Append new media files
            newMediaList.forEach((item) => {
                formData.append('media[]', item.file);
            });

            const updated = await postService.update(post.id, formData);
            onPostUpdated(updated);

            if (isTakenDown) {
                toast.success('Post revisions saved! Moderation desk notified.');
                if (onOpenAppeal) {
                    toast('Would you like to submit an official appeal now?', {
                        action: {
                            label: 'Open Appeal',
                            onClick: () => onOpenAppeal(),
                        },
                    });
                }
            } else {
                toast.success('Post updated successfully.');
            }

            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const getPortfolioThumbnail = (p: Portfolio) => {
        return p.thumbnail_media?.url || p.media?.[0]?.url || '';
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
                            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-foreground">Edit &amp; Revise Post</h3>
                                <p className="text-xs text-muted-foreground">Modify caption, artwork link, media, and settings</p>
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
                                    Reason: <span className="text-rose-200">"{post.taken_down_reason || 'Policy Violation'}"</span>.
                                    Revise your post content or media to comply with Community Guidelines. Once saved, you can submit an appeal for moderation review.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                        {/* Caption / Content */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Caption / Markdown Content</label>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                placeholder="Write your post caption..."
                                className="rounded-2xl resize-none text-xs leading-relaxed"
                                required
                            />
                        </div>

                        {/* ── Artwork Attachment Section ── */}
                        <div className="space-y-2.5 pt-1 border-t border-border/50">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Palette className="h-3.5 w-3.5 text-purple-400" />
                                    Attached Portfolio Artwork
                                </label>
                                {attachedPortfolio && (
                                    <span className="text-[11px] text-purple-400 font-semibold">Artwork Linked</span>
                                )}
                            </div>

                            {attachedPortfolio ? (
                                <div className="p-3 rounded-2xl bg-secondary/40 border border-purple-500/30 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-black/60 border border-border shrink-0">
                                            {getPortfolioThumbnail(attachedPortfolio) ? (
                                                <img
                                                    src={getPortfolioThumbnail(attachedPortfolio)}
                                                    alt={attachedPortfolio.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <Palette className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-foreground truncate">
                                                {attachedPortfolio.title}
                                            </h4>
                                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                                                {attachedPortfolio.description || 'No description'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setShowArtworkPicker(true)}
                                            className="h-7 text-[11px] rounded-lg cursor-pointer"
                                        >
                                            Change
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setAttachedPortfolio(null)}
                                            className="h-7 text-[11px] rounded-lg cursor-pointer bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white"
                                        >
                                            Detach
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowArtworkPicker(true)}
                                        className="h-9 rounded-xl text-xs gap-1.5 border-dashed border-border/80 hover:border-purple-500 text-muted-foreground hover:text-foreground cursor-pointer w-full justify-center"
                                    >
                                        <Plus className="h-3.5 w-3.5 text-purple-400" />
                                        <span>Link an Artwork from Your Portfolio</span>
                                    </Button>
                                </div>
                            )}

                            {/* Inline Artwork Selector Dialog */}
                            {showArtworkPicker && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3.5 rounded-2xl bg-black/60 border border-border/80 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground">Select an Artwork</span>
                                        <button
                                            type="button"
                                            onClick={() => setShowArtworkPicker(false)}
                                            className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {loadingPortfolios ? (
                                        <p className="text-xs text-muted-foreground py-3 text-center">Loading your artworks...</p>
                                    ) : userPortfolios.length === 0 ? (
                                        <p className="text-xs text-muted-foreground py-3 text-center">No portfolio artworks found in your profile.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                                            {userPortfolios.map((p) => {
                                                const isSelected = attachedPortfolio?.id === p.id;
                                                const thumb = getPortfolioThumbnail(p);

                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => {
                                                            setAttachedPortfolio(p);
                                                            setShowArtworkPicker(false);
                                                        }}
                                                        className={`relative rounded-xl overflow-hidden border p-1.5 flex flex-col gap-1.5 cursor-pointer transition-all duration-150 ${
                                                            isSelected
                                                                ? 'border-purple-500 bg-purple-500/15 ring-1 ring-purple-500'
                                                                : 'border-border/60 hover:border-purple-400/50 bg-secondary/30'
                                                        }`}
                                                    >
                                                        <div className="aspect-4/3 rounded-lg overflow-hidden bg-black/40">
                                                            {thumb ? (
                                                                <img src={thumb} alt={p.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                                    <Palette className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] font-bold text-foreground truncate px-1">
                                                            {p.title}
                                                        </span>
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                                                                <Check className="h-2.5 w-2.5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* ── Media Gallery & Upload Section ── */}
                        <div className="space-y-3 pt-1 border-t border-border/50">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                                    Post Attachments &amp; Media ({existingMedias.length + newMediaList.length})
                                </label>
                                <span className="text-[11px] text-muted-foreground">Images, GIFs, MP4</span>
                            </div>

                            {/* Existing Media Showcase */}
                            {existingMedias.length > 0 && (
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-semibold text-muted-foreground block">Current Media</span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {existingMedias.map((m) => {
                                            const isVid = m.media_type === 'video' || /\.(mp4|webm|mov)$/i.test(m.url);

                                            return (
                                                <div
                                                    key={m.id}
                                                    className="relative rounded-2xl overflow-hidden bg-black/60 border border-border/80 group aspect-4/3 flex items-center justify-center shadow-xs"
                                                >
                                                    {isVid ? (
                                                        <video src={m.url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={m.url} alt={m.file_name} className="w-full h-full object-cover" />
                                                    )}

                                                    {isVid && (
                                                        <div className="absolute top-2 left-2 z-10">
                                                            <span className="bg-rose-600/90 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                                                <Video className="h-2.5 w-2.5" /> Video
                                                            </span>
                                                        </div>
                                                    )}

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
                                    Click or Drag &amp; Drop to add images, GIFs, or videos
                                </p>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-1.5 pt-1">
                            <label className="text-xs font-semibold text-foreground">Tags (comma separated)</label>
                            <Input
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                placeholder="illustration, anime, fantasy, art"
                                className="rounded-xl text-xs h-9"
                            />
                        </div>

                        {/* Visibility & Comment Settings */}
                        <div className="grid sm:grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1.5">
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
                                        <option value="public">🌐 Public (Explore Feed)</option>
                                        <option value="followers">👥 Followers Only</option>
                                        <option value="private">🔒 Private (Only Me)</option>
                                    </select>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">Comments</label>
                                <button
                                    type="button"
                                    onClick={() => setCommentable(!commentable)}
                                    className={`w-full h-9 rounded-xl border px-3 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                        commentable
                                            ? 'bg-primary/10 border-primary/30 text-primary'
                                            : 'bg-secondary/60 border-border text-muted-foreground'
                                    }`}
                                >
                                    <span>Allow Comments</span>
                                    <span className="font-bold">{commentable ? 'Enabled' : 'Disabled'}</span>
                                </button>
                            </div>
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
