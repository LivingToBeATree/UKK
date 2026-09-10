import React, { useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Send,
    ShieldCheck,
    Layers,
    Tag,
    Sparkles,
    Paperclip,
    FileText,
    Maximize2,
    X,
    UploadCloud,
    Loader2,
    AlertCircle,
    Calendar,
    Clock,
} from 'lucide-react';
import { commissionOrderApi } from '@/services/commissionService';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from '@/components/ui/sonner';
import { formatPrice } from '@/utils/format';
import { MediaLightboxModal } from '@/components/ui/MediaLightboxModal';
import { cn } from '@/lib/utils';
import type { CommissionService, CommissionOption, CommissionAddon } from '@/types';

const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const OrderCommissionPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        service,
        selectedOption,
        selectedAddonIds = [],
        selectedAddons = [],
        grandTotal,
    } = (location.state || {}) as {
        service?: CommissionService;
        selectedOption?: CommissionOption;
        selectedAddonIds?: number[];
        selectedAddons?: CommissionAddon[];
        grandTotal?: number;
    };

    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useDocumentTitle(service ? `Order — ${service.name}` : 'Order Commission');

    // Deadline preference state: flexible (default) or specific date
    const [deadlineType, setDeadlineType] = useState<'flexible' | 'specific'>('flexible');
    const [deadline, setDeadline] = useState<string>('');

    const suggestedDeadline = useMemo(() => {
        if (!selectedOption?.duration_days) return '';
        const date = new Date();
        date.setDate(date.getDate() + Number(selectedOption.duration_days));
        return date.toISOString().split('T')[0];
    }, [selectedOption?.duration_days]);

    const minDeadlineDate = useMemo(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }, []);

    const handleSelectDeadlineType = (type: 'flexible' | 'specific') => {
        setDeadlineType(type);
        if (type === 'specific' && !deadline && suggestedDeadline) {
            setDeadline(suggestedDeadline);
        }
    };

    // Visual references attachment state
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<{ file: File; url: string; isImage: boolean; name: string; size: number }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Lightbox state for reference previews
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxMedia, setLightboxMedia] = useState<{ url: string; file_name?: string; media_type?: string; mime_type?: string }[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    if (!service || !selectedOption) {
        return (
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-20 text-center space-y-4">
                <p className="text-muted-foreground font-semibold">No service selected. Please choose a service and package first.</p>
                <Link to="/store">
                    <Button variant="outline" className="rounded-xl">Browse Store</Button>
                </Link>
            </div>
        );
    }

    const isOwnService = Boolean(user && (service.artist_profile?.user_id === user.id || user.artist_profile?.id === service.artist_profile_id));

    if (isOwnService) {
        return (
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-20 text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
                <h2 className="text-xl font-bold">Cannot Order Own Commission</h2>
                <p className="text-sm text-muted-foreground">You are the artist of this service listing and cannot submit a commission order to yourself.</p>
                <div className="flex items-center justify-center gap-3 pt-2">
                    <Link to="/dashboard/services">
                        <Button className="rounded-xl">Manage in Studio</Button>
                    </Link>
                    <Link to="/store">
                        <Button variant="outline" className="rounded-xl">Browse Store</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const basePrice = Number(selectedOption.base_price ?? selectedOption.price ?? 0);
    const addonsTotal = selectedAddons.reduce((acc, ad) => acc + Number(ad.additional_price || 0), 0);
    const finalTotal = grandTotal !== undefined ? grandTotal : basePrice + addonsTotal;

    const handleFilesSelect = (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        if (!fileArray.length) return;

        // Limit up to 10 visual reference files
        const combined = [...selectedFiles, ...fileArray].slice(0, 10);
        setSelectedFiles(combined);

        const previews = combined.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            isImage: file.type.startsWith('image/'),
            name: file.name,
            size: file.size,
        }));
        setFilePreviews(previews);
    };

    const handleRemoveFile = (index: number) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        if (filePreviews[index]?.url) {
            URL.revokeObjectURL(filePreviews[index].url);
        }
        const updatedPreviews = filePreviews.filter((_, i) => i !== index);
        setFilePreviews(updatedPreviews);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            e.preventDefault();
            handleFilesSelect(e.clipboardData.files);
        }
    };

    const openLightbox = (idx: number) => {
        const imageMediaList = filePreviews
            .filter((p) => p.isImage)
            .map((p) => ({
                url: p.url,
                file_name: p.name,
                media_type: 'image',
            }));
        setLightboxMedia(imageMediaList);
        setLightboxIndex(idx);
        setLightboxOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            toast.error('Please provide a brief description and reference instructions for your commission.');
            return;
        }

        if (deadlineType === 'specific' && !deadline) {
            toast.error('Please select an expected delivery deadline date, or choose Flexible.');
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading('Submitting commission request...');

        try {
            const formData = new FormData();
            formData.append('commission_service_id', String(service.id));
            if (selectedOption.id) {
                formData.append('commission_option_id', String(selectedOption.id));
            }
            selectedAddonIds.forEach((id) => {
                formData.append('addon_ids[]', String(id));
            });
            formData.append('description', description.trim());

            if (deadlineType === 'specific' && deadline) {
                formData.append('deadline', deadline);
            }

            selectedFiles.forEach((file) => {
                formData.append('attachments[]', file);
            });

            const order = await commissionOrderApi.create(formData);

            toast.dismiss(toastId);
            toast.success('Commission request submitted to the artist!');
            navigate(`/commissions/${order.slug || order.id}`);
        } catch {
            toast.dismiss(toastId);
            toast.error('Failed to submit commission request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 pb-16">
            <Link
                to={`/store/${service.slug || service.id}`}
                className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'gap-2 text-muted-foreground hover:text-foreground mb-6 -ml-2'
                )}
            >
                <ArrowLeft className="h-4 w-4" /> Back to Service Details
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
                        <Sparkles className="h-6 w-6 text-primary" /> Confirm Commission Order
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Review your chosen package, set your delivery deadline preference, and provide your project reference details.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* ── Left Column: Preferences & Form Details (7 or 8 cols) ── */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                        {/* 1. Deadline Preference Card */}
                        <Card className="rounded-3xl border-border/80 bg-card/60 shadow-xs">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        Delivery Deadline Preference
                                    </Label>
                                    {selectedOption?.duration_days && (
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                                            <Clock className="h-3 w-3 text-amber-400" />
                                            Standard turnaround: {selectedOption.duration_days} days
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Option 1: Flexible */}
                                    <button
                                        type="button"
                                        onClick={() => handleSelectDeadlineType('flexible')}
                                        className={cn(
                                            'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2',
                                            deadlineType === 'flexible'
                                                ? 'border-primary bg-primary/10 ring-1 ring-primary/30 shadow-xs'
                                                : 'border-border/80 bg-card/40 hover:bg-secondary/40 hover:border-primary/30'
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-foreground flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        'w-3.5 h-3.5 rounded-full border flex items-center justify-center',
                                                        deadlineType === 'flexible'
                                                            ? 'border-primary bg-primary'
                                                            : 'border-border/80'
                                                    )}
                                                >
                                                    {deadlineType === 'flexible' && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    )}
                                                </span>
                                                Flexible (No fixed deadline)
                                            </span>
                                            <Badge variant="secondary" className="text-[10px] bg-secondary/80 text-muted-foreground font-medium">
                                                Recommended
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground pl-5.5 leading-relaxed">
                                            Artist works at their standard comfortable pace. No deadline extension requests required.
                                        </p>
                                    </button>

                                    {/* Option 2: Specific Target Date */}
                                    <button
                                        type="button"
                                        onClick={() => handleSelectDeadlineType('specific')}
                                        className={cn(
                                            'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2',
                                            deadlineType === 'specific'
                                                ? 'border-primary bg-primary/10 ring-1 ring-primary/30 shadow-xs'
                                                : 'border-border/80 bg-card/40 hover:bg-secondary/40 hover:border-primary/30'
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-foreground flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        'w-3.5 h-3.5 rounded-full border flex items-center justify-center',
                                                        deadlineType === 'specific'
                                                            ? 'border-primary bg-primary'
                                                            : 'border-border/80'
                                                    )}
                                                >
                                                    {deadlineType === 'specific' && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    )}
                                                </span>
                                                Specific Target Deadline
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground pl-5.5 leading-relaxed">
                                            Specify an agreed delivery target for events, birthdays, or project schedules.
                                        </p>
                                    </button>
                                </div>

                                {deadlineType === 'specific' && (
                                    <div className="pt-3 border-t border-border/60 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Select Target Delivery Date
                                            </Label>
                                            {suggestedDeadline && (
                                                <button
                                                    type="button"
                                                    onClick={() => setDeadline(suggestedDeadline)}
                                                    className="text-[11px] text-primary hover:text-primary font-semibold cursor-pointer underline-offset-2 hover:underline"
                                                >
                                                    Suggested: {selectedOption?.duration_days} days ({suggestedDeadline})
                                                </button>
                                            )}
                                        </div>
                                        <DatePicker
                                            value={deadline}
                                            onChange={setDeadline}
                                            minDate={minDeadlineDate}
                                            placeholder="Choose expected completion deadline..."
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 2. Commission Request & Visual References Card */}
                        <Card className="rounded-3xl border-border/80 bg-card/60 shadow-xs overflow-hidden">
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Commission Request &amp; Visual References <span className="text-rose-400">*</span>
                                        </Label>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary font-bold transition-colors cursor-pointer"
                                        >
                                            <Paperclip className="h-3.5 w-3.5" /> Attach References
                                        </button>
                                    </div>

                                    <Textarea
                                        id="description"
                                        placeholder="Describe your character concept, preferred poses, color palette, background atmosphere, or paste reference images directly (Ctrl+V)..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        onPaste={handlePaste}
                                        rows={6}
                                        required
                                        className="rounded-2xl bg-secondary/40 border-border/80 text-xs leading-relaxed"
                                    />
                                </div>

                                {/* Reference Attachments Upload & Preview Tray */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                                            Attached Visual References ({filePreviews.length})
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            Images, PSDs, PDFs, ZIPs (Max 50MB each)
                                        </span>
                                    </div>

                                    {/* Hidden input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => {
                                            if (e.target.files) handleFilesSelect(e.target.files);
                                        }}
                                        multiple
                                        accept="image/*,.png,.jpg,.jpeg,.gif,.webp,.pdf,.zip,.psd,.clip"
                                        className="hidden"
                                    />

                                    {filePreviews.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {filePreviews.map((preview, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative group rounded-2xl overflow-hidden border border-border/80 bg-secondary/30 p-2 flex flex-col justify-between space-y-2"
                                                >
                                                    {preview.isImage ? (
                                                        <div
                                                            onClick={() => openLightbox(idx)}
                                                            className="relative h-24 w-full rounded-xl overflow-hidden bg-black/30 cursor-pointer group-hover:opacity-90 transition-opacity"
                                                        >
                                                            <img
                                                                src={preview.url}
                                                                alt={preview.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                <Maximize2 className="h-4 w-4 drop-shadow" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-24 w-full rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center p-2 text-center">
                                                            <FileText className="h-8 w-8 mb-1" />
                                                            <span className="text-[10px] uppercase font-mono font-bold">Document</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between gap-1 text-[11px] px-0.5">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold truncate text-foreground">{preview.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{formatFileSize(preview.size)}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(idx)}
                                                            className="h-6 w-6 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                                                            title="Remove reference"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add more tile */}
                                            {filePreviews.length < 10 && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="h-full min-h-[120px] rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-all cursor-pointer p-3"
                                                >
                                                    <UploadCloud className="h-6 w-6" />
                                                    <span className="text-xs font-bold">+ Add More</span>
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                if (e.dataTransfer.files) handleFilesSelect(e.dataTransfer.files);
                                            }}
                                            className="rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 bg-secondary/20 hover:bg-primary/5 p-6 text-center cursor-pointer transition-all space-y-2"
                                        >
                                            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                                                <UploadCloud className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground">Click to upload reference media or drag &amp; drop</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">Character sheets, moodboards, color swatches (or paste with Ctrl+V)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Right Column: Sticky Order Summary & Submission (5 or 4 cols) ── */}
                    <div className="lg:col-span-5 xl:col-span-4 sticky top-20 space-y-4">
                        <Card className="rounded-3xl border-border/80 bg-card/70 backdrop-blur-md shadow-lg overflow-hidden">
                            <CardContent className="p-6 space-y-5">
                                <div className="pb-3 border-b border-border/60">
                                    <h2 className="font-bold text-base text-foreground truncate">{service.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="font-bold text-[10px] bg-primary/15 text-primary border border-primary/30 gap-1">
                                            <Layers className="h-3 w-3" /> {selectedOption.title}
                                        </Badge>
                                        <span className="font-mono text-xs text-muted-foreground">
                                            {formatPrice(basePrice)}
                                        </span>
                                    </div>
                                </div>

                                {/* Itemized Add-ons */}
                                {selectedAddons.length > 0 && (
                                    <div className="space-y-2 pb-3 border-b border-border/60">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Tag className="h-3.5 w-3.5 text-primary" /> Selected Add-ons ({selectedAddons.length})
                                        </p>
                                        <div className="space-y-1.5">
                                            {selectedAddons.map((ad) => (
                                                <div
                                                    key={ad.id || ad.title}
                                                    className="flex items-center justify-between text-xs text-muted-foreground"
                                                >
                                                    <span className="truncate pr-2">+ {ad.title}</span>
                                                    <span className="font-mono font-semibold text-foreground shrink-0">
                                                        +{formatPrice(ad.additional_price)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Target Delivery Summary */}
                                <div className="space-y-1.5 py-1 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-primary" /> Target Delivery
                                        </span>
                                        <span className="font-semibold text-foreground font-mono">
                                            {deadlineType === 'specific' && deadline ? deadline : 'Flexible'}
                                        </span>
                                    </div>
                                    {selectedOption?.duration_days && (
                                        <p className="text-[10px] text-muted-foreground text-right">
                                            Standard turnaround: ~{selectedOption.duration_days} days
                                        </p>
                                    )}
                                </div>

                                {/* Grand Total */}
                                <div className="flex items-baseline justify-between pt-3 border-t border-border/60">
                                    <div>
                                        <span className="text-xs font-bold text-foreground">Total Expected Payment</span>
                                        <p className="text-[10px] text-muted-foreground">Held securely in Escrow</p>
                                    </div>
                                    <span className="text-2xl font-black font-mono text-emerald-400">
                                        {formatPrice(finalTotal)}
                                    </span>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-2xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-md gap-2"
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    {submitting ? 'Submitting Request...' : 'Submit Commission Request'}
                                </Button>

                                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>No upfront payment charged until artist accepts</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </motion.div>

            {/* Lightbox Modal for Visual References Preview */}
            <MediaLightboxModal
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                mediaList={lightboxMedia}
                initialIndex={lightboxIndex}
            />
        </div>
    );
};
