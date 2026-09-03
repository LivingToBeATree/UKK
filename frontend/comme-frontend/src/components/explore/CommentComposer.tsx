import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Bold,
    Italic,
    Link2,
    Code,
    Quote,
    List,
    ImagePlus,
    Smile,
    Send,
    Eye,
    ImageIcon,
    Video,
    X,
    MessageSquare,
} from 'lucide-react';
import EmojiPicker, { Theme as EmojiTheme, type EmojiClickData } from 'emoji-picker-react';
import {
    searchEmojiSuggestions,
    autoReplaceShortcodes,
    type EmojiSuggestion,
} from '@/utils/emojiHelper';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { postService } from '@/services/postService';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { GifPickerModal } from '@/components/ui/GifPickerModal';
import type { PostComment } from '@/types';

interface CommentComposerProps {
    postId: number;
    parentCommentId?: number;
    onCommentAdded: (comment: PostComment) => void;
    onCancel?: () => void;
    placeholder?: string;
}

interface AttachedMedia {
    id: string;
    file: File;
    url: string;
    isGif: boolean;
    isVideo: boolean;
    size: string;
    name: string;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({
    postId,
    parentCommentId,
    onCommentAdded,
    onCancel,
    placeholder = 'Share your feedback, inquiry, or appreciation...',
}) => {
    const { user } = useAuth();
    const { requireAuth } = useAuthModal();

    const [content, setContent] = useState('');
    const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
    const [submitting, setSubmitting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifModal, setShowGifModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Attached Media (Images, GIFs, Videos)
    const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
    const mediaFileInputRef = useRef<HTMLInputElement>(null);

    // Inline Emoji Autocomplete
    const [emojiSuggestions, setEmojiSuggestions] = useState<EmojiSuggestion[]>([]);
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [emojiMatchRange, setEmojiMatchRange] = useState<{ start: number; end: number; query: string } | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Close emoji picker on click outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Select online GIF handler: Attach directly into comment media attachments
    const handleSelectGif = async (gif: { url: string; title: string }) => {
        if (attachedMedia.length >= 4) {
            toast.error('Maximum 4 media files per comment');
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

            setAttachedMedia((prev) => [
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
            toast.success(`Attached "${gif.title || 'GIF'}" to comment media!`);
        } catch {
            toast.dismiss(toastId);
            toast.error('Failed to attach GIF from server');
        }
    };

    // File attachments handler
    const handleFiles = (files: FileList | File[]) => {
        const validMedia: AttachedMedia[] = [];

        Array.from(files).forEach((file) => {
            if (attachedMedia.length + validMedia.length >= 4) {
                toast.error('Maximum 4 media files per comment');
                return;
            }

            const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
            const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name);
            const maxAllowedSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;

            if (file.size > maxAllowedSize) {
                toast.error(`File ${file.name} is too large (max ${isVideo ? '50MB' : '15MB'})`);
                return;
            }
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                toast.error(`File ${file.name} is not a supported format`);
                return;
            }

            const url = URL.createObjectURL(file);
            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
            validMedia.push({
                id: Math.random().toString(36).substring(2, 9),
                file,
                url,
                isGif,
                isVideo,
                size: `${sizeMb} MB`,
                name: file.name,
            });
        });

        if (validMedia.length > 0) {
            setAttachedMedia((prev) => [...prev, ...validMedia]);
            toast.success(`Attached ${validMedia.length} media file(s)`);
        }
    };

    const handleRemoveMedia = (index: number) => {
        URL.revokeObjectURL(attachedMedia[index].url);
        setAttachedMedia((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = '';
        }
    };

    // Text & Emoji handling
    const checkForEmojiTrigger = (text: string, cursorPos: number) => {
        const textBeforeCursor = text.substring(0, cursorPos);
        const match = textBeforeCursor.match(/(?:^|\s):([a-zA-Z0-9_+-]{1,20})$/);

        if (match) {
            const query = match[1].toLowerCase();
            const startPos = cursorPos - match[1].length - 1;
            const results = searchEmojiSuggestions(query, 8);

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
        const before = content.substring(0, start);
        const after = content.substring(end);
        const newText = before + (before.endsWith(' ') || before.length === 0 ? '' : ' ') + selectedEmoji.emoji + ' ' + after;

        setContent(newText);
        setEmojiSuggestions([]);
        setEmojiMatchRange(null);

        const newPos = start + selectedEmoji.emoji.length + (before.endsWith(' ') || before.length === 0 ? 1 : 2);
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newPos, newPos);
            }
        }, 0);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        const cursorPos = e.target.selectionStart;

        const replaced = autoReplaceShortcodes(text);
        setContent(replaced.text);
        checkForEmojiTrigger(replaced.text, cursorPos);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

        // Quick submit on Ctrl+Enter or Cmd+Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
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
            newCursorStart = start;
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

    // Submit Comment
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requireAuth('comment')) return;
        if (!content.trim() && attachedMedia.length === 0) {
            toast.error('Please write a comment or attach an image/GIF');
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading('Posting discussion comment...');

        try {
            let finalContent = content.trim();

            // If user attached local media files, upload them first and append markdown
            if (attachedMedia.length > 0) {
                for (const m of attachedMedia) {
                    const formData = new FormData();
                    formData.append('file', m.file);
                    const res = await api.post('/media', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    const uploadedUrl = res.data?.data?.url;
                    if (uploadedUrl) {
                        finalContent += `\n\n![${m.name}](${uploadedUrl})`;
                    }
                }
            }

            const newComment = await postService.createComment(postId, finalContent, parentCommentId);
            onCommentAdded(newComment);

            // Clean up
            setContent('');
            attachedMedia.forEach((m) => URL.revokeObjectURL(m.url));
            setAttachedMedia([]);
            setEditorTab('write');

            toast.dismiss(toastId);
            toast.success(parentCommentId ? 'Reply posted!' : 'Comment posted to Community Discussion!');
        } catch {
            toast.dismiss(toastId);
            toast.error('Failed to post comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <Card className="rounded-2xl border border-border/80 bg-card/60 shadow-sm overflow-hidden">
                <CardContent className="p-5">
                    <div
                        onClick={() => requireAuth('comment')}
                        className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border/90 hover:border-primary/60 bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer text-xs text-muted-foreground group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                <MessageSquare className="h-4 w-4" />
                            </div>
                            <span>Sign in to participate in the community discussion, post markdown & share GIFs...</span>
                        </div>
                        <Button size="sm" className="h-8 font-bold text-xs shadow-xs">
                            Sign In
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
            <CardContent className="p-5 sm:p-6 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ── User Header Row ── */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                        <div className="flex items-center gap-3">
                            <Avatar
                                size="sm"
                                fallback={user?.display_name || user?.username || '?'}
                                src={user?.avatar_url}
                            />
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-xs sm:text-sm text-foreground">
                                    {user?.display_name || user?.username}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    user?.role === 'admin'
                                        ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                        : user?.role === 'moderator'
                                        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                                        : user?.artist_profile
                                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                        : 'text-muted-foreground bg-secondary/80 border-border/60'
                                }`}>
                                    {user?.role === 'admin' ? 'Admin' : user?.role === 'moderator' ? 'Moderator' : user?.artist_profile ? 'Artist' : 'User'}
                                </span>
                                <span className="text-[11px] text-muted-foreground hidden sm:inline">@{user?.username}</span>
                            </div>
                        </div>

                        {/* Write / Preview Tab Switcher */}
                        <div className="flex items-center bg-secondary/80 p-0.5 rounded-xl border border-border/70">
                            <button
                                type="button"
                                onClick={() => setEditorTab('write')}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                    editorTab === 'preview'
                                        ? 'bg-card text-primary shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Eye className="h-3 w-3" /> Preview
                            </button>
                        </div>
                    </div>

                    {/* ── Markdown Formatting Toolbar (in Write mode) ── */}
                    {editorTab === 'write' && (
                        <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-secondary/40 border border-border/60">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => insertFormatting('**', '**', 'bold text')}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Bold (**text**)"
                            >
                                <Bold className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => insertFormatting('*', '*', 'italic text')}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Italic (*text*)"
                            >
                                <Italic className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => insertFormatting('[', '](https://example.com)', 'link text')}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Insert Link"
                            >
                                <Link2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => insertFormatting('`', '`', 'code')}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Code (`code`)"
                            >
                                <Code className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => insertFormatting('> ', '', 'quote text')}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Quote (> quote)"
                            >
                                <Quote className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => insertFormatting('- ', '', 'list item')}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Bullet List (- item)"
                            >
                                <List className="h-3.5 w-3.5" />
                            </Button>

                            <div className="h-4 w-px bg-border/80 mx-1" />

                            {/* Attach Media Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => mediaFileInputRef.current?.click()}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Attach Image or Video"
                            >
                                <ImagePlus className="h-3.5 w-3.5" />
                            </Button>

                            {/* GIF Picker Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowGifModal(true)}
                                className="h-7 px-2 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                                title="Search Online GIFs"
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

                            {/* Emoji Picker Popover */}
                            <div className="relative" ref={emojiPickerRef}>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                                    className={`h-7 w-7 p-0 cursor-pointer transition-colors ${
                                        showEmojiPicker ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    title="Insert Emoji"
                                >
                                    <Smile className="h-3.5 w-3.5" />
                                </Button>

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
                                                width={300}
                                                height={340}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* ── Main Textarea & Live Preview ── */}
                    <div className="space-y-2 relative">
                        {editorTab === 'write' ? (
                            <div
                                className={`relative rounded-xl transition-all ${
                                    isDragging ? 'ring-2 ring-primary ring-offset-2' : ''
                                }`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDragging(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDragging(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDragging(false);
                                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                        handleFiles(e.dataTransfer.files);
                                    }
                                }}
                            >
                                {/* Inline Emoji Suggestions Dropdown */}
                                <AnimatePresence>
                                    {emojiSuggestions.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                            className="absolute left-3 bottom-full mb-2 z-40 w-64 rounded-2xl bg-popover/95 backdrop-blur-xl border border-border/90 p-1.5 shadow-2xl space-y-0.5"
                                        >
                                            <div className="px-2 py-0.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/40 mb-1">
                                                <span className="flex items-center gap-1">
                                                    <Smile className="h-3 w-3 text-amber-400" /> Emojis
                                                </span>
                                                <span className="text-[8px] opacity-70">↑↓ / ↵</span>
                                            </div>
                                            {emojiSuggestions.map((item, idx) => (
                                                <button
                                                    key={item.emoji + item.name}
                                                    type="button"
                                                    onClick={() => applyEmojiSuggestion(item)}
                                                    className={`w-full flex items-center justify-between px-2.5 py-1 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                                                        idx === suggestionIndex
                                                            ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                                            : 'text-foreground hover:bg-secondary'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-base leading-none shrink-0">{item.emoji}</span>
                                                        <span className="truncate font-mono text-[11px]">:{item.name}:</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={handleContentChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder={placeholder}
                                    rows={4}
                                    maxLength={2000}
                                    className="w-full resize-none rounded-xl p-3.5 text-sm bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/70"
                                />
                            </div>
                        ) : (
                            /* Live Preview Tab */
                            <div className="min-h-[110px] p-4 rounded-xl bg-secondary/20 border border-border/80 space-y-3">
                                {content.trim() ? (
                                    <MarkdownContent content={content} variant="comment" />
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                        Your markdown comment preview will appear here...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Attached Media Strip ── */}
                    {attachedMedia.length > 0 && (
                        <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <ImageIcon className="h-3.5 w-3.5 text-primary" /> Attached Media ({attachedMedia.length}/4)
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                {attachedMedia.map((m, idx) => (
                                    <div
                                        key={m.id}
                                        className="relative w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-black/60 border border-border/80 group/thumb flex items-center justify-center shrink-0 shadow-xs"
                                    >
                                        {m.isVideo ? (
                                            <video src={m.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                                        )}

                                        {/* Format Badge */}
                                        <div className="absolute top-1 left-1">
                                            {m.isVideo ? (
                                                <span className="bg-blue-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                                    <Video className="h-2 w-2" /> VID
                                                </span>
                                            ) : m.isGif ? (
                                                <span className="bg-purple-600/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">
                                                    GIF
                                                </span>
                                            ) : (
                                                <span className="bg-black/70 backdrop-blur-md text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                    IMG
                                                </span>
                                            )}
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMedia(idx)}
                                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                                            title="Remove media"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Footer Bar: Helper text, Char count & Submit Button ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span>Format with Bold (**), Italic (*), Quote (&gt;), Lists (-)</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="font-mono">{content.length} / 2000</span>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            {onCancel && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onCancel}
                                    className="h-9 px-4 rounded-xl font-bold text-xs cursor-pointer"
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={submitting || (!content.trim() && attachedMedia.length === 0)}
                                className="h-9 px-5 rounded-xl font-bold text-xs gap-2 shadow-md cursor-pointer bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <Send className="h-3.5 w-3.5" />
                                {submitting ? 'Posting...' : parentCommentId ? 'Post Reply' : 'Post Comment'}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>

            {/* Online GIF Picker Modal */}
            <GifPickerModal
                isOpen={showGifModal}
                onClose={() => setShowGifModal(false)}
                onSelectGif={handleSelectGif}
            />
        </Card>
    );
};
