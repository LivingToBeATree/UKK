import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft,
    Send,
    Sparkles,
    Bold,
    Italic,
    Link2,
    Code,
    Quote,
    List,
    Eye,
    Edit3,
    ImagePlus,
    Trash2,
    Globe,
    Users,
    Lock,
    MessageSquare,
    Check,
    Tag,
    X,
    ImageIcon,
    Smile,
    Plus,
    Video,
    Layers,
} from 'lucide-react';
import EmojiPicker, { Theme as EmojiTheme, type EmojiClickData } from 'emoji-picker-react';
import {
    searchEmojiSuggestions,
    autoReplaceShortcodes,
    type EmojiSuggestion,
} from '@/utils/emojiHelper';
import { postService } from '@/services/postService';
import { portfolioApi, type Portfolio } from '@/services/artistService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { GifPickerModal } from '@/components/ui/GifPickerModal';
import type { PostVisibility } from '@/types/post';

const POPULAR_TAGS = [
    'Illustration',
    'ConceptArt',
    'Anime',
    'CommissionOpen',
    'DigitalArt',
    'CharacterDesign',
    'WorkInProgress',
    '3DModel',
];

const getPortfolioImage = (portfolio: Portfolio | null | undefined): string | undefined => {
    return portfolio?.media?.[0]?.url;
};

export const CreatePostPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Form States
    const [content, setContent] = useState('');
    const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
    const [visibility, setVisibility] = useState<PostVisibility>('public');
    const [commentable, setCommentable] = useState(true);
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Direct Media (Images, GIFs & Videos) Uploads
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<{ id: string; file: File; url: string; isGif: boolean; isVideo: boolean; size: string; name: string }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [showGifModal, setShowGifModal] = useState(false);
    const mediaFileInputRef = useRef<HTMLInputElement>(null);

    // Inline Emoji Autocomplete (e.g. :he -> preview hello / heart)
    const [emojiSuggestions, setEmojiSuggestions] = useState<EmojiSuggestion[]>([]);
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [emojiMatchRange, setEmojiMatchRange] = useState<{ start: number; end: number; query: string } | null>(null);

    // Artist Portfolios for Attachment
    const [artistPortfolios, setArtistPortfolios] = useState<Portfolio[]>([]);
    const [loadingPortfolios, setLoadingPortfolios] = useState(false);
    const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Select online GIF handler: Attach directly into post media attachments
    const handleSelectGif = async (gif: { url: string; title: string }) => {
        if (mediaFiles.length >= 8) {
            toast.error('Maximum 8 media files per post');
            return;
        }

        const toastId = toast.loading('Attaching animated GIF...');
        try {
            const response = await fetch(gif.url);
            const blob = await response.blob();
            const cleanName = (gif.title || 'klipy-gif')
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, '-')
                .replace(/-+/g, '-')
                .slice(0, 32) + '.gif';

            const file = new File([blob], cleanName, { type: 'image/gif' });
            const localUrl = URL.createObjectURL(file);
            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

            setMediaFiles((prev) => [...prev, file]);
            setMediaPreviews((prev) => [
                ...prev,
                {
                    id: Math.random().toString(36).substring(2, 9),
                    file,
                    url: localUrl,
                    isGif: true,
                    isVideo: false,
                    size: `${sizeMb} MB`,
                    name: gif.title || 'KLIPY GIF',
                },
            ]);

            toast.dismiss(toastId);
            toast.success(`Attached "${gif.title || 'GIF'}" to post media!`);
        } catch {
            toast.dismiss(toastId);
            toast.error('Failed to attach GIF from server');
        }
    };

    // Media & Video file handler
    const handleFiles = (files: FileList | File[]) => {
        const validFiles: File[] = [];
        const newPreviews: { id: string; file: File; url: string; isGif: boolean; isVideo: boolean; size: string; name: string }[] = [];

        Array.from(files).forEach((file) => {
            if (mediaFiles.length + validFiles.length >= 8) {
                toast.error('Maximum 8 media files per post');
                return;
            }

            const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
            const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name);
            const maxAllowedSize = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024;

            if (file.size > maxAllowedSize) {
                toast.error(`File ${file.name} is too large (max ${isVideo ? '100MB' : '25MB'})`);
                return;
            }
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                toast.error(`File ${file.name} is not a supported image/GIF/video format`);
                return;
            }

            validFiles.push(file);
            const url = URL.createObjectURL(file);
            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
            newPreviews.push({
                id: Math.random().toString(36).substring(2, 9),
                file,
                url,
                isGif,
                isVideo,
                size: `${sizeMb} MB`,
                name: file.name,
            });
        });

        if (validFiles.length > 0) {
            setMediaFiles((prev) => [...prev, ...validFiles]);
            setMediaPreviews((prev) => [...prev, ...newPreviews]);
            toast.success(`Attached ${validFiles.length} media file(s)`);
        }
    };

    const handleRemoveMedia = (index: number) => {
        URL.revokeObjectURL(mediaPreviews[index].url);
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
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
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    // Check for inline emoji trigger like :he or :sad
    const checkForEmojiTrigger = (text: string, cursorPos: number) => {
        const textBeforeCursor = text.substring(0, cursorPos);
        const match = textBeforeCursor.match(/(?:^|\s):([a-zA-Z0-9_+-]{1,20})$/);

        if (match) {
            const query = match[1].toLowerCase();
            const startPos = cursorPos - match[1].length - 1; // start of :
            const results = searchEmojiSuggestions(query, 10);

            if (results.length > 0) {
                setEmojiSuggestions(results);
                setSuggestionIndex(0);
                setEmojiMatchRange({ start: startPos, end: cursorPos, query });
                return;
            }
        }

        setEmojiSuggestions([]);
        setEmojiMatchRange(null);
    };

    const applyEmojiSuggestion = (selectedEmoji: { emoji: string; name: string }) => {
        if (!emojiMatchRange || !textareaRef.current) return;
        const { start, end } = emojiMatchRange;
        const text = content;
        const newText = text.substring(0, start) + selectedEmoji.emoji + ' ' + text.substring(end);
        setContent(newText);
        setEmojiSuggestions([]);
        setEmojiMatchRange(null);

        setTimeout(() => {
            if (textareaRef.current) {
                const newCursor = start + selectedEmoji.emoji.length + 1;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursor, newCursor);
            }
        }, 0);
    };

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (emojiSuggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSuggestionIndex((prev) => (prev + 1) % emojiSuggestions.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSuggestionIndex((prev) => (prev - 1 + emojiSuggestions.length) % emojiSuggestions.length);
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                applyEmojiSuggestion(emojiSuggestions[suggestionIndex]);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setEmojiSuggestions([]);
                setEmojiMatchRange(null);
                return;
            }
        }
    };

    // Close emoji picker on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    // Fetch user's portfolio pieces if artist
    useEffect(() => {
        if (user?.artist_profile) {
            const fetchPortfolios = async () => {
                try {
                    setLoadingPortfolios(true);
                    const res = await portfolioApi.list(1);
                    setArtistPortfolios(res.data || []);
                } catch {
                    // Non-fatal
                } finally {
                    setLoadingPortfolios(false);
                }
            };
            fetchPortfolios();
        }
    }, [user]);

    // Enhanced formatting helper with smart selection wrapping
    const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = 'text') => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        let replacement = '';
        let newCursorStart = start;
        let newCursorEnd = end;

        if (selectedText) {
            replacement = `${prefix}${selectedText}${suffix}`;
            newCursorStart = start + prefix.length;
            newCursorEnd = start + prefix.length + selectedText.length;
        } else {
            replacement = `${prefix}${defaultPlaceholder}${suffix}`;
            newCursorStart = start + prefix.length;
            newCursorEnd = start + prefix.length + defaultPlaceholder.length;
        }

        const newContent = content.substring(0, start) + replacement + content.substring(end);
        setContent(newContent);
        setEditorTab('write');

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorStart, newCursorEnd);
        }, 0);
    };

    // Insert emoji at cursor
    const insertEmoji = (emoji: string) => {
        if (!textareaRef.current) {
            setContent((prev) => prev + emoji);
            return;
        }
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + emoji + content.substring(end);
        setContent(newContent);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        }, 0);
    };

    // Add Tag
    const handleAddTag = (tagToAdd: string) => {
        const clean = tagToAdd.replace(/^#/, '').trim();
        if (clean && !tags.includes(clean) && tags.length < 8) {
            setTags((prev) => [...prev, clean]);
            setTagInput('');
        }
    };

    // Remove Tag
    const handleRemoveTag = (tagToRemove: string) => {
        setTags((prev) => prev.filter((t) => t !== tagToRemove));
    };

    // Submit Post
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && mediaFiles.length === 0) {
            toast.error('Please write some content or attach an image/GIF for your post');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('visibility', visibility);
            formData.append('commentable', commentable ? '1' : '0');

            if (selectedPortfolioId) {
                formData.append('portfolio_id', String(selectedPortfolioId));
            }

            // Append Direct Uploaded Media (Images, GIFs, Videos)
            mediaFiles.forEach((file) => {
                formData.append('media[]', file);
            });

            tags.forEach((tag, idx) => {
                formData.append(`tags[${idx}]`, tag);
            });

            await postService.create(formData);
            toast.success('Post published to Explore!');
            navigate('/explore');
        } catch {
            toast.error('Failed to create post. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const charCount = content.length;
    const maxChars = 2000;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
            {/* ── Breadcrumb & Header Bar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
                <div>
                    <Link
                        to="/explore"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Artwork Feed
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
                            <Edit3 className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                Creator Studio • New Post
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Publish artwork breakdowns, commission announcements, sketches, or community lore.
                            </p>
                        </div>
                    </div>
                </div>

                {/* View Mode Toggle Button */}
                <div className="flex items-center gap-2 bg-secondary/80 p-1.5 rounded-xl border border-border/80 shrink-0">
                    <Button
                        type="button"
                        variant={!previewMode ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewMode(false)}
                        className="h-9 px-3.5 text-xs font-bold gap-1.5 cursor-pointer"
                    >
                        <Edit3 className="h-3.5 w-3.5" /> Editor
                    </Button>
                    <Button
                        type="button"
                        variant={previewMode ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewMode(true)}
                        className="h-9 px-3.5 text-xs font-bold gap-1.5 cursor-pointer"
                    >
                        <Eye className="h-3.5 w-3.5" /> Live Preview
                    </Button>
                </div>
            </div>

            {/* ── Main Studio Layout ── */}
            <AnimatePresence mode="wait">
                {previewMode ? (
                    /* ── Full Live Feed Preview ── */
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="max-w-2xl mx-auto space-y-6 py-4"
                    >
                        <div className="text-center space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">Live Feed Preview</span>
                            <h2 className="text-lg font-bold text-foreground">How your post appears on the Artwork Feed</h2>
                        </div>

                        {/* Mock Masonry Card */}
                        <div className="rounded-3xl overflow-hidden bg-card border border-border/80 shadow-2xl">
                            {mediaPreviews.length > 0 ? (
                                /* Attached Uploaded Media Preview */
                                <div className="space-y-0">
                                    {mediaPreviews[0].isVideo ? (
                                        <div className="relative w-full aspect-video overflow-hidden bg-black flex items-center justify-center">
                                            <video
                                                src={mediaPreviews[0].url}
                                                muted
                                                autoPlay
                                                loop
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                                                <Video className="h-3.5 w-3.5" />
                                                <span>Video Attachment</span>
                                            </div>
                                            {mediaPreviews.length > 1 && (
                                                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1 shadow-md">
                                                    <Layers className="h-3.5 w-3.5" />
                                                    <span>+{mediaPreviews.length - 1} more</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative w-full aspect-video overflow-hidden bg-muted">
                                            <img
                                                src={mediaPreviews[0].url}
                                                alt={mediaPreviews[0].name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                                                {mediaPreviews[0].isGif ? (
                                                    <>
                                                        <span className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">GIF</span>
                                                        <span>Attached GIF</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                                                        <span>Attached Image</span>
                                                    </>
                                                )}
                                            </div>
                                            {mediaPreviews.length > 1 && (
                                                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1 shadow-md">
                                                    <Layers className="h-3.5 w-3.5" />
                                                    <span>+{mediaPreviews.length - 1} more</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Author & Content Info */}
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                size="md"
                                                fallback={user?.display_name || user?.username || '?'}
                                                src={user?.avatar_url}
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-foreground">
                                                    {user?.display_name || user?.username}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    @{user?.username} • Just now
                                                </p>
                                            </div>
                                        </div>

                                        {content && (
                                            <div className="pt-1">
                                                <MarkdownContent content={content} />
                                            </div>
                                        )}

                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-2">
                                                {tags.map((t) => (
                                                    <Badge key={t} variant="secondary" className="text-xs font-semibold">
                                                        #{t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : getPortfolioImage(selectedPortfolio) ? (
                                <div className="space-y-0">
                                    <div className="relative w-full aspect-video overflow-hidden bg-muted">
                                        <img
                                            src={getPortfolioImage(selectedPortfolio)}
                                            alt={selectedPortfolio?.title || 'Attached Artwork'}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                            <span>Attached Portfolio Piece</span>
                                        </div>
                                    </div>

                                    {/* Card Details when artwork is attached */}
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                size="md"
                                                fallback={user?.display_name || user?.username || '?'}
                                                src={user?.avatar_url}
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-foreground">
                                                    {user?.display_name || user?.username}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    @{user?.username} • Just now
                                                </p>
                                            </div>
                                        </div>

                                        {content && (
                                            <div className="pt-1">
                                                <MarkdownContent content={content} />
                                            </div>
                                        )}

                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-2">
                                                {tags.map((t) => (
                                                    <Badge key={t} variant="secondary" className="text-xs font-semibold">
                                                        #{t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 bg-gradient-to-br from-primary/15 via-accent/10 to-secondary min-h-[220px] flex flex-col justify-between">
                                    <div className="text-base font-medium leading-relaxed text-foreground">
                                        <MarkdownContent content={content || '*Your post content will appear here...*'} />
                                    </div>
                                    <div className="pt-6 flex items-center gap-3">
                                        <Avatar
                                            size="md"
                                            fallback={user?.display_name || user?.username || '?'}
                                            src={user?.avatar_url}
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-foreground">
                                                {user?.display_name || user?.username}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                @{user?.username} • Just now
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPreviewMode(false)}
                                className="h-11 px-6 font-bold cursor-pointer"
                            >
                                Continue Editing
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting || !content.trim()}
                                className="h-11 px-8 font-bold shadow-lg gap-2 cursor-pointer"
                            >
                                <Send className="h-4 w-4" />
                                {submitting ? 'Publishing...' : 'Publish Post Now'}
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    /* ── 2-Column Creator Composer Studio ── */
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* ── Left Main Editor (Col 7/12) ── */}
                        <div className="lg:col-span-7 space-y-6">
                            <Card className="shadow-sm border-border/80">
                                <CardContent className="p-6 space-y-5">
                                    {/* Author Identity Badge */}
                                    <div className="flex items-center justify-between pb-4 border-b border-border/60">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                size="md"
                                                fallback={user?.display_name || user?.username || '?'}
                                                src={user?.avatar_url}
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-foreground">
                                                        {user?.display_name || user?.username}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                                        {user?.artist_profile ? 'Artist' : 'Creator'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">@{user?.username}</span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs font-semibold gap-1">
                                            {visibility === 'public' && <Globe className="h-3 w-3 text-emerald-400" />}
                                            {visibility === 'followers' && <Users className="h-3 w-3 text-primary" />}
                                            {visibility === 'private' && <Lock className="h-3 w-3 text-amber-400" />}
                                            <span className="capitalize">{visibility}</span>
                                        </Badge>
                                    </div>

                                    {/* Editor Toolbar & Write/Preview Tabs */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            {/* Write / Preview Tab Switcher */}
                                            <div className="flex items-center bg-secondary/80 p-1 rounded-xl border border-border/70">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditorTab('write')}
                                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                                        editorTab === 'write'
                                                            ? 'bg-card text-foreground shadow-xs'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    Write
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditorTab('preview')}
                                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                                        editorTab === 'preview'
                                                            ? 'bg-card text-primary shadow-xs'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    <Eye className="h-3 w-3" /> Preview
                                                </button>
                                            </div>
                                        </div>

                                        {/* Formatting Toolbar */}
                                        {editorTab === 'write' && (
                                            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-secondary/50 border border-border/60">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => insertFormatting('**', '**', 'bold text')}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                                    title="Bold (**text**)"
                                                >
                                                    <Bold className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => insertFormatting('*', '*', 'italic text')}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                                    title="Italic (*text*)"
                                                >
                                                    <Italic className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => insertFormatting('[', '](https://example.com)', 'link text')}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                                    title="Insert Link"
                                                >
                                                    <Link2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => insertFormatting('`', '`', 'code')}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                                    title="Code (`code`)"
                                                >
                                                    <Code className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => insertFormatting('> ', '', 'quote text')}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                                    title="Quote (> quote)"
                                                >
                                                    <Quote className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => insertFormatting('- ', '', 'list item')}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                                    title="Bullet List (- item)"
                                                >
                                                    <List className="h-4 w-4" />
                                                </Button>

                                                {/* Attach Image / GIF File Button */}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => mediaFileInputRef.current?.click()}
                                                    className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Attach Images, GIFs & Videos"
                                                >
                                                    <ImagePlus className="h-4 w-4" />
                                                </Button>

                                                {/* Online GIF Search Button */}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowGifModal(true)}
                                                    className="h-8 px-2 py-0 cursor-pointer font-bold text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                                    title="Search Online GIFs & Reactions"
                                                >
                                                    GIF
                                                </Button>

                                                {/* Hidden Media File Input */}
                                                <input
                                                    type="file"
                                                    ref={mediaFileInputRef}
                                                    onChange={handleFileInputChange}
                                                    multiple
                                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,video/mp4"
                                                    className="hidden"
                                                />

                                                {/* Emoji Picker Button beside markdowns */}
                                                <div className="relative" ref={emojiPickerRef}>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                                                        className={`h-8 w-8 p-0 cursor-pointer transition-colors ${
                                                            showEmojiPicker
                                                                ? 'bg-secondary text-foreground'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                        title="Insert Emoji"
                                                    >
                                                        <Smile className="h-4 w-4" />
                                                    </Button>

                                                    {/* Emoji Picker Popover */}
                                                    <AnimatePresence>
                                                        {showEmojiPicker && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                className="absolute left-0 top-full mt-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-border/80"
                                                            >
                                                                <EmojiPicker
                                                                    theme={EmojiTheme.DARK}
                                                                    onEmojiClick={(emojiData: EmojiClickData) => {
                                                                        insertEmoji(emojiData.emoji);
                                                                        setShowEmojiPicker(false);
                                                                    }}
                                                                    lazyLoadEmojis={true}
                                                                    searchPlaceHolder="Search emojis..."
                                                                    width={320}
                                                                    height={380}
                                                                />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Textarea or Inline Preview */}
                                    <div className="space-y-2 relative">
                                        <Label htmlFor="post_content" className="sr-only">
                                            Post Content
                                        </Label>
                                        {editorTab === 'write' ? (
                                            <div className="relative">
                                                {/* Inline Emoji Suggestions Popup (Discord/Slack style) */}
                                                <AnimatePresence>
                                                    {emojiSuggestions.length > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                                            className="absolute left-3 bottom-full mb-2 z-40 w-72 rounded-2xl bg-popover/95 backdrop-blur-xl border border-border/90 p-1.5 shadow-2xl space-y-0.5"
                                                        >
                                                            <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/40 mb-1">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Smile className="h-3 w-3 text-amber-400" />
                                                                    Emoji Suggestions
                                                                </span>
                                                                <span className="text-[9px] font-normal lowercase opacity-70">↑↓ / ↵ tab</span>
                                                            </div>
                                                            {emojiSuggestions.map((item, idx) => (
                                                                <button
                                                                    key={item.emoji + item.name}
                                                                    type="button"
                                                                    onClick={() => applyEmojiSuggestion(item)}
                                                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                                                                        idx === suggestionIndex
                                                                            ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                                                            : 'text-foreground hover:bg-secondary'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                                        <span className="text-lg leading-none shrink-0">{item.emoji}</span>
                                                                        <span className="truncate">:{item.name}:</span>
                                                                    </div>
                                                                    <span
                                                                        className={`text-[10px] truncate max-w-[95px] ${
                                                                            idx === suggestionIndex
                                                                                ? 'text-primary-foreground/80'
                                                                                : 'text-muted-foreground'
                                                                        }`}
                                                                    >
                                                                        {item.description}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <Textarea
                                                    id="post_content"
                                                    ref={textareaRef}
                                                    placeholder="Share your artwork progress, process breakdown, commission updates, or stories..."
                                                    value={content}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.slice(0, maxChars);
                                                        const { text: autoReplaced, hasReplaced } = autoReplaceShortcodes(raw);

                                                        if (hasReplaced) {
                                                            setContent(autoReplaced);
                                                            setEmojiSuggestions([]);
                                                            setEmojiMatchRange(null);
                                                            return;
                                                        }

                                                        setContent(raw);
                                                        checkForEmojiTrigger(raw, e.target.selectionStart || 0);
                                                    }}
                                                    onClick={(e) => {
                                                        const target = e.target as HTMLTextAreaElement;
                                                        checkForEmojiTrigger(target.value, target.selectionStart || 0);
                                                    }}
                                                    onKeyUp={(e) => {
                                                        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Backspace'].includes(e.key) && emojiSuggestions.length === 0) {
                                                            const target = e.target as HTMLTextAreaElement;
                                                            checkForEmojiTrigger(target.value, target.selectionStart || 0);
                                                        }
                                                    }}
                                                    onKeyDown={handleTextareaKeyDown}
                                                    rows={8}
                                                    className="resize-y min-h-[220px] text-base leading-relaxed p-4 rounded-2xl bg-card border-border/80 focus-visible:ring-primary font-medium"
                                                    required={mediaFiles.length === 0}
                                                />
                                            </div>
                                        ) : (
                                            <div className="min-h-[220px] p-5 rounded-2xl border border-border/80 bg-secondary/20 overflow-y-auto">
                                                {content ? (
                                                    <MarkdownContent content={content} />
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">
                                                        Nothing to preview yet. Switch to Write to start typing...
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                            <span>Format with Bold (**), Italic (*), Quote (&gt;), Lists (-)</span>
                                            <span className={charCount > 1800 ? 'text-amber-400 font-bold' : ''}>
                                                {charCount} / {maxChars}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ── Direct Images & GIFs Upload Zone / Preview Grid ── */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <ImagePlus className="h-3.5 w-3.5 text-primary" /> Attached Media ({mediaPreviews.length}/8)
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={() => mediaFileInputRef.current?.click()}
                                                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
                                            >
                                                <Plus className="h-3 w-3" /> Upload Media
                                            </button>
                                        </div>

                                        {/* Previews Grid or Dropzone */}
                                        {mediaPreviews.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {mediaPreviews.map((item, idx) => (
                                                    <div
                                                        key={item.id}
                                                        className="relative group rounded-2xl overflow-hidden border border-border/80 bg-secondary/30 aspect-square flex items-center justify-center shadow-xs"
                                                    >
                                                        {item.isVideo ? (
                                                            <video
                                                                src={item.url}
                                                                muted
                                                                autoPlay
                                                                loop
                                                                playsInline
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={item.url}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        )}

                                                        {/* Badge: VIDEO, GIF or IMG */}
                                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase backdrop-blur-md shadow-xs flex items-center gap-1">
                                                            {item.isVideo ? (
                                                                <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                    <Video className="h-3 w-3" /> VIDEO
                                                                </span>
                                                            ) : item.isGif ? (
                                                                <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded">GIF</span>
                                                            ) : (
                                                                <span className="bg-black/70 text-white px-1.5 py-0.5 rounded">IMG</span>
                                                            )}
                                                        </div>

                                                        {/* Delete button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMedia(idx)}
                                                            className="absolute top-2 right-2 h-7 w-7 rounded-xl bg-black/75 hover:bg-rose-600 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md z-10"
                                                            title="Remove media"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>

                                                        {/* File Size */}
                                                        <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] truncate px-2 font-medium">
                                                            {item.size}
                                                        </div>
                                                    </div>
                                                ))}

                                                {mediaPreviews.length < 8 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => mediaFileInputRef.current?.click()}
                                                        className="rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-secondary/10 hover:bg-secondary/30 aspect-square flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-all cursor-pointer"
                                                    >
                                                        <ImagePlus className="h-5 w-5" />
                                                        <span className="text-[11px] font-bold">Add More</span>
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => mediaFileInputRef.current?.click()}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                                                    isDragging
                                                        ? 'border-primary bg-primary/10 text-primary scale-[1.01]'
                                                        : 'border-border/70 hover:border-primary/50 bg-secondary/20 hover:bg-secondary/40 text-muted-foreground'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 text-xs font-semibold">
                                                    <ImagePlus className="h-4 w-4 text-primary" />
                                                    <span className="text-foreground font-bold">Drop images, animated GIFs, or videos here</span>
                                                    <span>or click to upload</span>
                                                </div>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Supports PNG, JPG, WebP, GIF, MP4, WebM up to 100MB (Max 8 files)
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tag Selector */}
                                    <div className="space-y-3 pt-3 border-t border-border/60">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <Tag className="h-3.5 w-3.5 text-primary" /> Post Tags ({tags.length}/8)
                                            </Label>
                                            <span className="text-[11px] text-muted-foreground">Press Enter or comma to add</span>
                                        </div>

                                        {/* Tag Chips */}
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="pl-3 pr-2 py-1 text-xs font-bold gap-1.5 bg-primary/10 text-primary border border-primary/20"
                                                >
                                                    #{tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="hover:text-rose-400 transition-colors cursor-pointer"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                            {tags.length < 8 && (
                                                <Input
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ',') {
                                                            e.preventDefault();
                                                            handleAddTag(tagInput);
                                                        }
                                                    }}
                                                    placeholder="Add tag..."
                                                    className="h-8 w-32 rounded-lg text-xs px-3 bg-secondary/40 border-border/70"
                                                />
                                            )}
                                        </div>

                                        {/* Popular Quick Suggestions */}
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                            <span className="text-[11px] text-muted-foreground font-medium mr-1">Suggested:</span>
                                            {POPULAR_TAGS.filter((t) => !tags.includes(t))
                                                .slice(0, 5)
                                                .map((tag) => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => handleAddTag(tag)}
                                                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                                                    >
                                                        +{tag}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ── Right Metadata & Attachment Sidebar (Col 5/12) ── */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* 1. Artwork / Portfolio Attachment Card */}
                            <Card className="shadow-sm border-border/80">
                                <CardHeader className="p-5 pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-bold flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-primary" /> Attach Portfolio Artwork
                                        </CardTitle>
                                        {selectedPortfolio && (
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                                                ATTACHED
                                            </span>
                                        )}
                                    </div>
                                    <CardDescription className="text-xs">
                                        Connect an existing artwork from your portfolio to feature on the feed.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 pt-2 space-y-4">
                                    {selectedPortfolio ? (
                                        <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-secondary/40 group">
                                            <div className="h-44 w-full bg-muted overflow-hidden">
                                                <img
                                                    src={getPortfolioImage(selectedPortfolio)}
                                                    alt={selectedPortfolio.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <div className="p-3.5 flex items-center justify-between gap-3 bg-card/90">
                                                <div className="overflow-hidden min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">
                                                        {selectedPortfolio.title}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        Portfolio ID: #{selectedPortfolio.id}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedPortfolioId(null);
                                                        setSelectedPortfolio(null);
                                                    }}
                                                    className="h-8 px-2.5 text-xs text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer shrink-0"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ) : user?.artist_profile ? (
                                        <div className="space-y-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsPortfolioModalOpen(true)}
                                                className="w-full h-12 rounded-xl border-dashed border-2 hover:border-primary font-bold text-xs gap-2 cursor-pointer"
                                            >
                                                <ImagePlus className="h-4 w-4 text-primary" /> Browse &amp; Select Portfolio Piece
                                            </Button>
                                            <p className="text-[11px] text-muted-foreground text-center">
                                                Posts without attached artwork render as a styled ambient quote card on the feed.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl border border-border/60 bg-secondary/30 text-xs text-muted-foreground space-y-2">
                                            <p className="font-semibold text-foreground">Text-Only Community Post</p>
                                            <p className="leading-relaxed">
                                                You are publishing as a community creator. Your post will appear as a styled announcement card on the Artwork Feed.
                                            </p>
                                            <Link
                                                to="/apply-artist"
                                                className="inline-flex items-center gap-1 text-primary font-bold hover:underline pt-1"
                                            >
                                                Become an Artist to attach artwork →
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* 2. Visibility & Audience */}
                            <Card className="shadow-sm border-border/80">
                                <CardHeader className="p-5 pb-3">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-primary" /> Post Visibility
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Choose who can discover and see this post across Comme.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 pt-2 space-y-3">
                                    {[
                                        {
                                            id: 'public' as PostVisibility,
                                            label: 'Public',
                                            desc: 'Visible to everyone on Artwork Feed & search',
                                            icon: Globe,
                                        },
                                        {
                                            id: 'followers' as PostVisibility,
                                            label: 'Followers Only',
                                            desc: 'Only users following your profile can view',
                                            icon: Users,
                                        },
                                        {
                                            id: 'private' as PostVisibility,
                                            label: 'Private / Unlisted',
                                            desc: 'Only accessible via direct link',
                                            icon: Lock,
                                        },
                                    ].map((opt) => {
                                        const Icon = opt.icon;
                                        const isSelected = visibility === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setVisibility(opt.id)}
                                                className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/10 ring-1 ring-primary/30 text-foreground'
                                                        : 'border-border hover:bg-secondary/60 text-muted-foreground'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground">{opt.label}</p>
                                                        <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                                                    </div>
                                                </div>
                                                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* 3. Discussion Moderation */}
                            <Card className="shadow-sm border-border/80">
                                <CardContent className="p-5 flex items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-primary" />
                                            <Label htmlFor="commentable_toggle" className="text-xs font-bold text-foreground cursor-pointer">
                                                Community Comments
                                            </Label>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Allow collectors &amp; users to comment on this post
                                        </p>
                                    </div>
                                    <input
                                        id="commentable_toggle"
                                        type="checkbox"
                                        checked={commentable}
                                        onChange={(e) => setCommentable(e.target.checked)}
                                        className="h-5 w-5 accent-primary rounded cursor-pointer"
                                    />
                                </CardContent>
                            </Card>

                            {/* 4. Action Buttons */}
                            <div className="space-y-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={submitting || !content.trim()}
                                    className="w-full h-12 rounded-xl font-bold shadow-lg text-sm gap-2 cursor-pointer"
                                >
                                    <Send className="h-4 w-4" />
                                    {submitting ? 'Publishing Post...' : 'Publish to Feed'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/explore')}
                                    className="w-full h-11 rounded-xl text-xs font-semibold cursor-pointer"
                                >
                                    Discard &amp; Return to Feed
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </AnimatePresence>

            {/* ── Portfolio Selection Modal Dialog ── */}
            <AnimatePresence>
                {isPortfolioModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-card border border-border/80 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-6 max-h-[85vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-border/60">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Select Portfolio Artwork</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Choose one of your published artwork pieces to feature with this post.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsPortfolioModalOpen(false)}
                                    className="h-8 w-8 rounded-full cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Portfolios Grid */}
                            <div className="flex-1 overflow-y-auto pr-1">
                                {loadingPortfolios ? (
                                    <div className="py-12 text-center text-xs text-muted-foreground">
                                        Loading your portfolio pieces...
                                    </div>
                                ) : artistPortfolios.length === 0 ? (
                                    <div className="py-12 text-center space-y-3">
                                        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/40" />
                                        <p className="text-sm font-semibold text-foreground">No portfolio artworks found</p>
                                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                            You haven't uploaded any pieces to your artist portfolio yet.
                                        </p>
                                        <Link to="/dashboard/portfolio">
                                            <Button size="sm" className="font-bold mt-2">
                                                Go to Studio Portfolio
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {artistPortfolios.map((portfolio) => {
                                            const isSelected = selectedPortfolioId === portfolio.id;
                                            return (
                                                <button
                                                    key={portfolio.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPortfolioId(portfolio.id);
                                                        setSelectedPortfolio(portfolio);
                                                        setIsPortfolioModalOpen(false);
                                                        toast.success(`Attached "${portfolio.title}"!`);
                                                    }}
                                                    className={`group relative rounded-2xl overflow-hidden border text-left transition-all cursor-pointer flex flex-col ${
                                                        isSelected
                                                            ? 'border-primary ring-2 ring-primary/40 shadow-md'
                                                            : 'border-border hover:border-primary/50'
                                                    }`}
                                                >
                                                    <div className="aspect-square w-full bg-muted overflow-hidden relative">
                                                        <img
                                                            src={getPortfolioImage(portfolio)}
                                                            alt={portfolio.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        {isSelected && (
                                                            <div className="absolute inset-0 bg-primary/30 backdrop-blur-xs flex items-center justify-center">
                                                                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                                                                    <Check className="h-5 w-5" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-2.5 bg-card/90">
                                                        <p className="text-xs font-bold text-foreground truncate">
                                                            {portfolio.title}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            ID: #{portfolio.id}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-border/60 flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPortfolioModalOpen(false)}
                                    className="h-10 px-5 text-xs font-semibold cursor-pointer"
                                >
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Online GIF Search Modal ── */}
            <GifPickerModal
                isOpen={showGifModal}
                onClose={() => setShowGifModal(false)}
                onSelectGif={handleSelectGif}
            />
        </div>
    );
};
