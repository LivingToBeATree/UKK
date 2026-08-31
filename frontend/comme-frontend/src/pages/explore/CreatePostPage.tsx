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
} from 'lucide-react';
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

const EMOJI_LIST = ['✨', '🎨', '🚀', '🔥', '💖', '🖌️', '🌸', '🌟', '⚡', '💭', '💎', '🎉'];

const getPortfolioImage = (portfolio: Portfolio | null | undefined): string | undefined => {
    return portfolio?.media?.[0]?.url;
};

export const CreatePostPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Form States
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<PostVisibility>('public');
    const [commentable, setCommentable] = useState(true);
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // Artist Portfolios for Attachment
    const [artistPortfolios, setArtistPortfolios] = useState<Portfolio[]>([]);
    const [loadingPortfolios, setLoadingPortfolios] = useState(false);
    const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Insert formatting helper
    const insertFormatting = (prefix: string, suffix: string = '') => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

        const newContent = content.substring(0, start) + replacement + content.substring(end);
        setContent(newContent);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                start + prefix.length + (selectedText ? selectedText.length : 4)
            );
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
        if (!content.trim()) {
            toast.error('Please write some content for your post');
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

            tags.forEach((tag, idx) => {
                formData.append(`tags[${idx}]`, tag);
            });

            await postService.create(formData);
            toast.success('Post published to Artwork Feed!');
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
                            {getPortfolioImage(selectedPortfolio) ? (
                                <div className="relative w-full aspect-video overflow-hidden bg-muted">
                                    <img
                                        src={getPortfolioImage(selectedPortfolio)}
                                        alt={selectedPortfolio?.title || 'Attached Artwork'}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                        <span>Attached Portfolio Piece</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 bg-gradient-to-br from-primary/15 via-accent/10 to-secondary min-h-[220px] flex flex-col justify-between">
                                    <p className="text-base font-medium leading-relaxed text-foreground italic">
                                        "{content || 'Your post content will appear here...'}"
                                    </p>
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

                            {/* Card Details when artwork is attached */}
                            {getPortfolioImage(selectedPortfolio) && (
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
                                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                                            {content}
                                        </p>
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

                                    {/* Formatting Toolbar */}
                                    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-secondary/50 border border-border/60">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => insertFormatting('**', '**')}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                            title="Bold (**text**)"
                                        >
                                            <Bold className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => insertFormatting('*', '*')}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                            title="Italic (*text*)"
                                        >
                                            <Italic className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => insertFormatting('[', '](https://)')}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                            title="Insert Link"
                                        >
                                            <Link2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => insertFormatting('`', '`')}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                            title="Code (`code`)"
                                        >
                                            <Code className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => insertFormatting('> ')}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                            title="Quote (> quote)"
                                        >
                                            <Quote className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => insertFormatting('- ')}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                            title="Bullet List (- item)"
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>

                                        {/* Emojis Palette */}
                                        <div className="h-4 w-px bg-border/80 mx-1.5" />
                                        <div className="flex items-center gap-1 overflow-x-auto">
                                            {EMOJI_LIST.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => insertEmoji(emoji)}
                                                    className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-sm transition-transform hover:scale-115 cursor-pointer"
                                                    title={`Insert ${emoji}`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Main Textarea */}
                                    <div className="space-y-2">
                                        <Label htmlFor="post_content" className="sr-only">
                                            Post Content
                                        </Label>
                                        <Textarea
                                            id="post_content"
                                            ref={textareaRef}
                                            placeholder="Share your artwork progress, process breakdown, commission updates, or stories..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
                                            rows={8}
                                            className="resize-y min-h-[200px] text-base leading-relaxed p-4 rounded-2xl bg-card border-border/80 focus-visible:ring-primary font-medium"
                                            required
                                        />
                                        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                            <span>Markdown formatting is supported</span>
                                            <span className={charCount > 1800 ? 'text-amber-400 font-bold' : ''}>
                                                {charCount} / {maxChars}
                                            </span>
                                        </div>
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
        </div>
    );
};
