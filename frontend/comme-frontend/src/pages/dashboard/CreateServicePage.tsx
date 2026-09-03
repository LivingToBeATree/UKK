import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Layers,
    DollarSign,
    Upload,
    ImageIcon,
    Film,
    X,
    Sparkles,
    PlusCircle,
    CheckCircle2,
    Tag,
    Lock,
    EyeOff,
} from 'lucide-react';
import { commissionServiceApi } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';

interface AddonItem {
    id?: number;
    title: string;
    description: string;
    additional_price: number;
}

interface OptionPackageItem {
    id?: number;
    title: string;
    description: string;
    base_price: number;
    addons: AddonItem[];
}

interface MediaPreviewItem {
    file?: File;
    url: string;
    isVideo: boolean;
    name: string;
    size?: string;
    isExisting?: boolean;
}

export const CreateServicePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'open' | 'closed' | 'draft'>('open');
    const [serviceTags, setServiceTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Packages & Options state
    const [options, setOptions] = useState<OptionPackageItem[]>([
        {
            title: 'Standard Package',
            description: 'Full color finished illustration with simple background and 2 revisions.',
            base_price: 500000,
            addons: [
                {
                    title: 'Commercial Rights License',
                    description: 'Full commercial rights for merchandise and advertising.',
                    additional_price: 300000,
                },
            ],
        },
    ]);

    // Showcase / Reference Artwork Media
    const [mediaItems, setMediaItems] = useState<MediaPreviewItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);

    // Fetch existing service when in edit mode
    useEffect(() => {
        if (!isEditMode || !id) return;

        const fetchService = async () => {
            try {
                setLoading(true);
                const svc = await commissionServiceApi.show(Number(id));
                setName(svc.name || '');
                setDescription(svc.description || '');
                setStatus(svc.status || 'open');

                if (svc.tags && svc.tags.length > 0) {
                    setServiceTags(svc.tags.map((t) => t.name));
                }

                if (svc.options && svc.options.length > 0) {
                    setOptions(
                        svc.options.map((opt) => ({
                            id: opt.id,
                            title: opt.title,
                            description: opt.description || '',
                            base_price: Number(opt.base_price ?? opt.price ?? 0),
                            addons: (opt.addons || []).map((ad) => ({
                                id: ad.id,
                                title: ad.title,
                                description: ad.description || '',
                                additional_price: Number(ad.additional_price || 0),
                            })),
                        }))
                    );
                }

                if (svc.media && svc.media.length > 0) {
                    setMediaItems(
                        svc.media.map((m) => ({
                            url: m.url,
                            isVideo: m.media_type === 'video' || (m.mime_type?.startsWith('video/') ?? false),
                            name: m.file_name || 'Showcase Image',
                            isExisting: true,
                        }))
                    );
                }
            } catch {
                toast.error('Failed to load commission service details');
                navigate('/dashboard/services');
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [id, isEditMode, navigate]);

    // Media upload handler
    const handleFiles = (files: FileList | File[]) => {
        const fileList = Array.from(files);
        const validItems: MediaPreviewItem[] = [];

        fileList.forEach((file) => {
            const isVideo = file.type.startsWith('video/');
            const isImage = file.type.startsWith('image/');

            if (!isImage && !isVideo) {
                toast.error(`"${file.name}" is not a supported image or video format.`);
                return;
            }

            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
            if (file.size > 50 * 1024 * 1024) {
                toast.error(`"${file.name}" exceeds 50MB limit.`);
                return;
            }

            validItems.push({
                file,
                url: URL.createObjectURL(file),
                isVideo,
                name: file.name,
                size: `${sizeMb} MB`,
            });
        });

        if (validItems.length > 0) {
            setMediaItems((prev) => [...prev, ...validItems]);
            toast.success(`Added ${validItems.length} reference / showcase media item(s)`);
        }
    };

    const handleRemoveMedia = (index: number) => {
        const item = mediaItems[index];
        if (!item.isExisting) {
            URL.revokeObjectURL(item.url);
        }
        setMediaItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddTag = (tagStr: string) => {
        const clean = tagStr.trim().replace(/^#/, '').replace(/[^a-zA-Z0-9_-]/g, '');
        if (!clean || serviceTags.includes(clean) || serviceTags.length >= 8) return;
        setServiceTags((prev) => [...prev, clean]);
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setServiceTags((prev) => prev.filter((t) => t !== tagToRemove));
    };

    // Option Package Handlers
    const handleAddPackage = () => {
        setOptions((prev) => [
            ...prev,
            {
                title: `Package #${prev.length + 1}`,
                description: 'Includes full resolution artwork with source files.',
                base_price: 750000,
                addons: [],
            },
        ]);
    };

    const handleRemovePackage = (pkgIndex: number) => {
        if (options.length <= 1) {
            toast.error('Your service must have at least one pricing package.');
            return;
        }
        setOptions((prev) => prev.filter((_, i) => i !== pkgIndex));
    };

    const handleUpdatePackage = (pkgIndex: number, field: keyof OptionPackageItem, value: any) => {
        setOptions((prev) =>
            prev.map((opt, i) => (i === pkgIndex ? { ...opt, [field]: value } : opt))
        );
    };

    // Addon Handlers
    const handleAddAddon = (pkgIndex: number) => {
        setOptions((prev) =>
            prev.map((opt, i) => {
                if (i !== pkgIndex) return opt;
                return {
                    ...opt,
                    addons: [
                        ...opt.addons,
                        {
                            title: 'New Add-on Option',
                            description: 'Optional additional feature for this package.',
                            additional_price: 150000,
                        },
                    ],
                };
            })
        );
    };

    const handleRemoveAddon = (pkgIndex: number, addonIndex: number) => {
        setOptions((prev) =>
            prev.map((opt, i) => {
                if (i !== pkgIndex) return opt;
                return {
                    ...opt,
                    addons: opt.addons.filter((_, aIdx) => aIdx !== addonIndex),
                };
            })
        );
    };

    const handleUpdateAddon = (
        pkgIndex: number,
        addonIndex: number,
        field: keyof AddonItem,
        value: any
    ) => {
        setOptions((prev) =>
            prev.map((opt, i) => {
                if (i !== pkgIndex) return opt;
                return {
                    ...opt,
                    addons: opt.addons.map((addon, aIdx) =>
                        aIdx === addonIndex ? { ...addon, [field]: value } : addon
                    ),
                };
            })
        );
    };

    // Form Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter a service listing title');
            return;
        }

        if (!description.trim()) {
            toast.error('Please enter detailed terms and scope for this service');
            return;
        }

        if (options.length === 0) {
            toast.error('Please configure at least one service package option');
            return;
        }

        for (let i = 0; i < options.length; i++) {
            if (!options[i].title.trim()) {
                toast.error(`Please provide a title for Package #${i + 1}`);
                return;
            }
            if (isNaN(options[i].base_price) || options[i].base_price < 0) {
                toast.error(`Please provide a valid base price for Package #${i + 1}`);
                return;
            }
        }

        setSubmitting(true);
        const toastId = toast.loading(isEditMode ? 'Saving service changes...' : 'Creating commission service...');

        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('description', description.trim());
            formData.append('status', status);

            // Tags
            if (serviceTags.length > 0) {
                serviceTags.forEach((tag, idx) => {
                    formData.append(`tags[${idx}]`, tag);
                });
            }

            // Append new files
            mediaItems.forEach((m) => {
                if (m.file) {
                    formData.append('media[]', m.file);
                }
            });

            // Options and Addons
            options.forEach((opt, optIdx) => {
                formData.append(`options[${optIdx}][title]`, opt.title.trim());
                if (opt.description.trim()) {
                    formData.append(`options[${optIdx}][description]`, opt.description.trim());
                }
                formData.append(`options[${optIdx}][base_price]`, String(opt.base_price));

                opt.addons.forEach((addon, addIdx) => {
                    if (addon.title.trim()) {
                        formData.append(`options[${optIdx}][addons][${addIdx}][title]`, addon.title.trim());
                        if (addon.description.trim()) {
                            formData.append(
                                `options[${optIdx}][addons][${addIdx}][description]`,
                                addon.description.trim()
                            );
                        }
                        formData.append(
                            `options[${optIdx}][addons][${addIdx}][additional_price]`,
                            String(addon.additional_price)
                        );
                    }
                });
            });

            if (isEditMode && id) {
                await commissionServiceApi.update(Number(id), formData);
                toast.dismiss(toastId);
                toast.success('Commission service updated successfully!');
            } else {
                await commissionServiceApi.create(formData);
                toast.dismiss(toastId);
                toast.success('Commission service published to your studio!');
            }

            navigate('/dashboard/services');
        } catch {
            toast.dismiss(toastId);
            toast.error(isEditMode ? 'Failed to update commission service' : 'Failed to create commission service');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center text-muted-foreground animate-pulse">
                Loading service configuration...
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-6 pb-16">
            <Link
                to="/dashboard/services"
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Commission Services
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
                        <Sparkles className="h-6 w-6 text-purple-400" />
                        {isEditMode ? 'Edit Commission Service' : 'Create Commission Service'}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Configure your service details, showcase reference artwork, packages, and optional add-ons.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ── 1. Service Overview ── */}
                <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-xs rounded-3xl overflow-hidden">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                            <Layers className="h-4 w-4 text-purple-400" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Service Overview</h2>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Service Listing Title <span className="text-rose-400">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Dynamic Anime Character Illustration / Live2D Model & Rigging"
                                required
                                className="h-11 rounded-xl bg-secondary/30 border-border/80 text-sm font-medium focus-visible:ring-purple-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Detailed Description & Terms <span className="text-rose-400">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What do you specialize in? Outline drawing styles, turnaround time expectations, accepted themes, and commercial usage policies..."
                                rows={4}
                                required
                                className="rounded-xl bg-secondary/30 border-border/80 text-xs leading-relaxed focus-visible:ring-purple-500"
                            />
                        </div>

                        {/* Availability Status */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Availability Status
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    {
                                        id: 'open' as const,
                                        label: 'Open for Orders',
                                        desc: 'Accepting client requests in store',
                                        icon: CheckCircle2,
                                        activeClass: 'border-emerald-500/80 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30',
                                        iconColor: 'text-emerald-400',
                                        dotColor: 'bg-emerald-400',
                                    },
                                    {
                                        id: 'closed' as const,
                                        label: 'Closed (Queue Full)',
                                        desc: 'Temporarily pause new requests',
                                        icon: Lock,
                                        activeClass: 'border-rose-500/80 bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30',
                                        iconColor: 'text-rose-400',
                                        dotColor: 'bg-rose-400',
                                    },
                                    {
                                        id: 'draft' as const,
                                        label: 'Draft (Hidden)',
                                        desc: 'Hidden from public store listings',
                                        icon: EyeOff,
                                        activeClass: 'border-amber-500/80 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30',
                                        iconColor: 'text-amber-400',
                                        dotColor: 'bg-amber-400',
                                    },
                                ].map((opt) => {
                                    const isSelected = status === opt.id;
                                    const Icon = opt.icon;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setStatus(opt.id)}
                                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                                                isSelected
                                                    ? opt.activeClass
                                                    : 'border-border/80 bg-secondary/30 hover:border-border hover:bg-secondary/60 text-muted-foreground'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <Icon className={`h-4 w-4 ${isSelected ? opt.iconColor : 'text-muted-foreground'}`} />
                                                <div className={`w-2 h-2 rounded-full ${isSelected ? opt.dotColor : 'bg-muted-foreground/40'}`} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-foreground">{opt.label}</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Service Category & Specialty Tags */}
                        <div className="space-y-3 pt-2 border-t border-border/60">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Tag className="h-3.5 w-3.5 text-purple-400" />
                                    Service Tags & Specialties ({serviceTags.length}/8)
                                </Label>
                                <span className="text-[10px] text-muted-foreground">Press Enter or comma to add</span>
                            </div>

                            {/* Active Tags */}
                            {serviceTags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {serviceTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-white cursor-pointer ml-1 p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Tag Input */}
                            {serviceTags.length < 8 && (
                                <div className="flex gap-2">
                                    <Input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ',') {
                                                e.preventDefault();
                                                handleAddTag(tagInput);
                                            }
                                        }}
                                        placeholder="Add a specialty tag (e.g. Anime, Chibi, VTuber, Emotes, Live2D)..."
                                        className="h-10 rounded-xl bg-secondary/30 border-border/80 text-xs focus-visible:ring-purple-500"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleAddTag(tagInput)}
                                        disabled={!tagInput.trim()}
                                        className="h-10 rounded-xl text-xs font-bold shrink-0"
                                    >
                                        Add
                                    </Button>
                                </div>
                            )}

                            {/* Suggested Quick Tags */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                <span className="text-[10px] text-muted-foreground font-semibold">Suggested:</span>
                                {['Anime', 'Chibi', 'VTuber', 'CharacterDesign', 'Illustration', 'Emotes', 'Live2D', 'FullBody', 'Commercial']
                                    .filter((t) => !serviceTags.includes(t))
                                    .slice(0, 7)
                                    .map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleAddTag(tag)}
                                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60 transition-colors cursor-pointer"
                                        >
                                            +{tag}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── 2. Reference & Showcase Artwork Media ── */}
                <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-xs rounded-3xl overflow-hidden">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-purple-400" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                                    Showcase &amp; Reference Artwork ({mediaItems.length})
                                </h2>
                            </div>
                            <span className="text-[11px] text-muted-foreground">Sample images shown to buyers</span>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/mp4"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) handleFiles(e.target.files);
                                e.target.value = '';
                            }}
                        />

                        {/* Upload Drop Zone */}
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-6 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                                isDragging
                                    ? 'border-purple-500 bg-purple-500/10 scale-[0.99]'
                                    : 'border-border/80 hover:border-purple-500/50 bg-secondary/20 hover:bg-secondary/40'
                            }`}
                        >
                            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 mb-2.5">
                                <Upload className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold text-foreground">
                                Click or drag sample artwork / reference images
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                High-res PNG, JPG, WebP, or MP4 timelapses (Max 50MB each). First image becomes listing cover.
                            </p>
                        </div>

                        {/* Media Preview Grid */}
                        {mediaItems.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                {mediaItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="group relative rounded-2xl overflow-hidden border border-border/80 bg-black/40 aspect-square shadow-xs"
                                    >
                                        {item.isVideo ? (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
                                                <Film className="h-8 w-8 text-purple-400 mb-1" />
                                                <span className="text-[10px] text-zinc-400 truncate max-w-[90%] px-1 font-mono">
                                                    {item.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                        )}

                                        {/* Cover Badge on first image */}
                                        {idx === 0 && (
                                            <Badge className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-md border-0">
                                                Cover Image
                                            </Badge>
                                        )}

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveMedia(idx);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            title="Remove image"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── 3. Service Packages & Add-ons ── */}
                <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-xs rounded-3xl overflow-hidden">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
                            <div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-emerald-400" />
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                                        Service Packages &amp; Pricing Options ({options.length})
                                    </h2>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Define customizable packages (e.g. Bust Up, Half Body, Full Character) along with package-specific add-ons.
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleAddPackage}
                                className="rounded-xl text-xs font-bold gap-1.5 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Package Option
                            </Button>
                        </div>

                        {/* Packages List */}
                        <div className="space-y-6">
                            {options.map((opt, pkgIdx) => (
                                <div
                                    key={pkgIdx}
                                    className="p-5 rounded-2xl border border-border/80 bg-secondary/20 space-y-4 relative"
                                >
                                    {/* Package Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="font-bold text-xs bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                                Package #{pkgIdx + 1}
                                            </Badge>
                                            <span className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
                                                {opt.title || 'Untitled Package'}
                                            </span>
                                        </div>

                                        {options.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePackage(pkgIdx)}
                                                className="text-xs text-rose-400 hover:text-rose-300 p-1 flex items-center gap-1 cursor-pointer transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Remove Package
                                            </button>
                                        )}
                                    </div>

                                    {/* Package Fields: Title & Base Price */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-2 space-y-1">
                                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Package Title *
                                            </Label>
                                            <Input
                                                value={opt.title}
                                                onChange={(e) => handleUpdatePackage(pkgIdx, 'title', e.target.value)}
                                                placeholder="e.g. Bust Up / Portrait Illustration"
                                                required
                                                className="h-9 text-xs rounded-xl bg-card border-border/80 font-medium"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Base Price (IDR) *
                                            </Label>
                                            <Input
                                                type="number"
                                                value={opt.base_price}
                                                onChange={(e) =>
                                                    handleUpdatePackage(pkgIdx, 'base_price', parseFloat(e.target.value) || 0)
                                                }
                                                placeholder="500000"
                                                required
                                                min={0}
                                                className="h-9 text-xs rounded-xl bg-card border-border/80 font-mono font-bold text-emerald-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Scope & Inclusions */}
                                    <div className="space-y-1">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Inclusions &amp; Deliverables
                                        </Label>
                                        <Input
                                            value={opt.description}
                                            onChange={(e) => handleUpdatePackage(pkgIdx, 'description', e.target.value)}
                                            placeholder="e.g. Full color render with transparent PNG + 300 DPI PSD source file + 2 free revisions"
                                            className="h-9 text-xs rounded-xl bg-card border-border/80"
                                        />
                                    </div>

                                    {/* ── Sub-section: Add-ons & Extras for this Package ── */}
                                    <div className="pt-3 border-t border-border/60 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Tag className="h-3.5 w-3.5 text-purple-400" />
                                                <span className="text-xs font-bold text-foreground">
                                                    Add-ons &amp; Extras ({opt.addons.length})
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="xs"
                                                onClick={() => handleAddAddon(pkgIdx)}
                                                className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer gap-1"
                                            >
                                                <PlusCircle className="h-3.5 w-3.5" /> Add Extra
                                            </Button>
                                        </div>

                                        {opt.addons.length === 0 ? (
                                            <p className="text-[11px] text-muted-foreground italic bg-secondary/30 p-2.5 rounded-xl">
                                                No add-ons configured. Click "+ Add Extra" to offer options like Commercial Rights, Complex Backgrounds, or Rush Delivery.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {opt.addons.map((addon, aIdx) => (
                                                    <div
                                                        key={aIdx}
                                                        className="p-3 rounded-xl border border-border/70 bg-card/60 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                                                    >
                                                        <div className="sm:col-span-5 space-y-0.5">
                                                            <Input
                                                                value={addon.title}
                                                                onChange={(e) =>
                                                                    handleUpdateAddon(pkgIdx, aIdx, 'title', e.target.value)
                                                                }
                                                                placeholder="Addon title (e.g. Detailed Background)"
                                                                required
                                                                className="h-8 text-xs rounded-lg bg-secondary/40"
                                                            />
                                                        </div>

                                                        <div className="sm:col-span-4 space-y-0.5">
                                                            <Input
                                                                value={addon.description}
                                                                onChange={(e) =>
                                                                    handleUpdateAddon(pkgIdx, aIdx, 'description', e.target.value)
                                                                }
                                                                placeholder="Addon notes (e.g. +3 days delivery)"
                                                                className="h-8 text-xs rounded-lg bg-secondary/40"
                                                            />
                                                        </div>

                                                        <div className="sm:col-span-2 space-y-0.5">
                                                            <Input
                                                                type="number"
                                                                value={addon.additional_price}
                                                                onChange={(e) =>
                                                                    handleUpdateAddon(
                                                                        pkgIdx,
                                                                        aIdx,
                                                                        'additional_price',
                                                                        parseFloat(e.target.value) || 0
                                                                    )
                                                                }
                                                                placeholder="Price"
                                                                min={0}
                                                                className="h-8 text-xs rounded-lg bg-secondary/40 font-mono font-bold text-emerald-400"
                                                            />
                                                        </div>

                                                        <div className="sm:col-span-1 flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveAddon(pkgIdx, aIdx)}
                                                                className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer transition-colors"
                                                                title="Remove add-on"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Submit Toolbar ── */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/dashboard/services')}
                        className="h-11 px-5 rounded-2xl text-xs font-semibold cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="h-11 px-7 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md gap-2"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {submitting
                            ? isEditMode
                                ? 'Saving...'
                                : 'Publishing Service...'
                            : isEditMode
                            ? 'Save Service Changes'
                            : 'Publish Commission Service'}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};
