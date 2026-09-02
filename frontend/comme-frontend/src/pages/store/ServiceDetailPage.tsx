import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Star,
    ShoppingCart,
    Clock,
    Layers,
    Tag,
    Check,
    ImageIcon,
    ShieldCheck,
    PenTool,
} from 'lucide-react';
import { commissionServiceApi, commissionReviewApi, type CommissionReview } from '@/services/commissionService';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { formatPrice } from '@/utils/format';
import type { CommissionService, CommissionOption, CommissionAddon } from '@/types';

export const ServiceDetailPage: React.FC = () => {
    const { serviceId } = useParams<{ serviceId: string }>();
    const { user } = useAuth();
    const { requireAuth } = useAuthModal();
    const navigate = useNavigate();

    const [service, setService] = useState<CommissionService | null>(null);
    const [reviews, setReviews] = useState<CommissionReview[]>([]);
    const [selectedOption, setSelectedOption] = useState<CommissionOption | null>(null);
    const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
    const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const svc = await commissionServiceApi.show(Number(serviceId));
                setService(svc);
                if (svc.options && svc.options.length > 0) {
                    setSelectedOption(svc.options[0]);
                }
                if (svc.artist_profile_id) {
                    const reviewsRes = await commissionReviewApi.listForArtist(svc.artist_profile_id);
                    setReviews(reviewsRes.data);
                }
            } catch {
                toast.error('Failed to load commission service');
            } finally {
                setLoading(false);
            }
        };
        if (serviceId) fetchData();
    }, [serviceId]);

    // Reset selected addons when package changes
    const handleSelectOption = (option: CommissionOption) => {
        setSelectedOption(option);
        setSelectedAddonIds([]);
    };

    const handleToggleAddon = (addonId?: number) => {
        if (!addonId) return;
        setSelectedAddonIds((prev) =>
            prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
        );
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-80 w-full rounded-3xl" />
                        <Skeleton className="h-32 w-full rounded-3xl" />
                    </div>
                    <Skeleton className="h-96 w-full rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
                <p className="text-muted-foreground font-semibold">Commission service not found</p>
                <Link to="/store">
                    <Button variant="outline" className="rounded-xl">Browse Store</Button>
                </Link>
            </div>
        );
    }

    const basePrice = selectedOption ? Number(selectedOption.base_price ?? selectedOption.price ?? 0) : 0;
    const availableAddons: CommissionAddon[] = selectedOption?.addons || [];
    const selectedAddons = availableAddons.filter((ad) => ad.id && selectedAddonIds.includes(ad.id));
    const addonsTotal = selectedAddons.reduce((acc, ad) => acc + Number(ad.additional_price || 0), 0);
    const grandTotal = basePrice + addonsTotal;

    const mediaList = service.media || [];
    const activeMedia = mediaList[activeMediaIndex] || mediaList[0];

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 pb-16">
            <Link
                to="/store"
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Store
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-8">
                {/* ── Left Column: Service Details & Showcase ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 1. Reference / Showcase Media Gallery */}
                    <div className="space-y-3">
                        <div className="rounded-3xl overflow-hidden bg-black/60 border border-border/80 aspect-16/10 flex items-center justify-center relative shadow-sm">
                            {activeMedia ? (
                                activeMedia.media_type === 'video' || activeMedia.mime_type?.startsWith('video/') ? (
                                    <video
                                        src={activeMedia.url}
                                        controls
                                        className="w-full h-full object-contain bg-black"
                                    />
                                ) : (
                                    <img
                                        src={activeMedia.url}
                                        alt={service.name}
                                        className="w-full h-full object-contain bg-black/40"
                                    />
                                )
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                                    <span>No showcase artwork uploaded</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails row */}
                        {mediaList.length > 1 && (
                            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                                {mediaList.map((m, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveMediaIndex(idx)}
                                        className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                                            activeMediaIndex === idx
                                                ? 'border-purple-500 scale-105 shadow-xs'
                                                : 'border-border/60 hover:border-purple-500/50 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={m.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Service Header & Artist */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                {service.name}
                            </h1>
                            <Badge
                                variant="secondary"
                                className={`text-xs font-bold uppercase tracking-wider ${
                                    service.status === 'open'
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                }`}
                            >
                                {service.status === 'open' ? 'Open for Orders' : service.status}
                            </Badge>
                        </div>

                        {service.artist_profile?.user && (
                            <Link
                                to={`/artists/${service.artist_profile_id}`}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-purple-400 transition-colors"
                            >
                                <Avatar
                                    size="sm"
                                    src={service.artist_profile.user.avatar_url}
                                    fallback={service.artist_profile.user.display_name || service.artist_profile.user.username}
                                />
                                <span>by {service.artist_profile.user.display_name || service.artist_profile.user.username}</span>
                            </Link>
                        )}
                    </div>

                    {/* 3. Packages & Options Selector */}
                    {service.options && service.options.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Layers className="h-4 w-4 text-purple-400" />
                                Select Service Package
                            </h2>
                            <div className="grid gap-3">
                                {service.options.map((option) => {
                                    const isSelected = selectedOption?.id === option.id;
                                    return (
                                        <Card
                                            key={option.id}
                                            className={`cursor-pointer rounded-2xl transition-all border ${
                                                isSelected
                                                    ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30 shadow-xs'
                                                    : 'border-border/80 bg-card/60 hover:border-purple-500/40 hover:bg-secondary/40'
                                            }`}
                                            onClick={() => handleSelectOption(option)}
                                        >
                                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                                                isSelected
                                                                    ? 'border-purple-500 bg-purple-600 text-white'
                                                                    : 'border-border/80'
                                                            }`}
                                                        >
                                                            {isSelected && <Check className="h-2.5 w-2.5" />}
                                                        </div>
                                                        <h3 className="font-bold text-sm text-foreground truncate">
                                                            {option.title}
                                                        </h3>
                                                    </div>
                                                    {option.description && (
                                                        <p className="text-xs text-muted-foreground pl-6 line-clamp-2">
                                                            {option.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
                                                        {formatPrice(option.base_price ?? option.price ?? 0)}
                                                    </p>
                                                    {option.duration_days && (
                                                        <p className="text-[11px] text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                                                            <Clock className="h-3 w-3" />
                                                            {option.duration_days} days
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 4. Package Add-ons & Extras */}
                    {availableAddons.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Tag className="h-4 w-4 text-purple-400" />
                                Optional Add-ons &amp; Extras ({availableAddons.length})
                            </h2>
                            <div className="grid gap-2.5">
                                {availableAddons.map((addon) => {
                                    const isChecked = addon.id ? selectedAddonIds.includes(addon.id) : false;
                                    return (
                                        <div
                                            key={addon.id || addon.title}
                                            onClick={() => handleToggleAddon(addon.id)}
                                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                isChecked
                                                    ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30 shadow-xs'
                                                    : 'border-border/80 bg-card/60 hover:bg-secondary/40'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {}}
                                                    className="h-4 w-4 accent-purple-600 rounded cursor-pointer shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs text-foreground truncate">
                                                        {addon.title}
                                                    </p>
                                                    {addon.description && (
                                                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                                            {addon.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="font-mono font-bold text-xs text-emerald-400 shrink-0">
                                                +{formatPrice(addon.additional_price)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 5. Detailed Scope & Terms Description */}
                    <Card className="rounded-3xl border-border/80 bg-card/60 shadow-xs overflow-hidden">
                        <CardContent className="p-6 space-y-3">
                            <h2 className="font-bold text-sm uppercase tracking-wider text-foreground">
                                Detailed Terms &amp; Scope
                            </h2>
                            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                                {service.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* 6. Reviews */}
                    <Card className="rounded-3xl border-border/80 bg-card/60 shadow-xs overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                Client Reviews ({reviews.length})
                            </h2>
                            {reviews.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">No reviews yet for this artist.</p>
                            ) : (
                                <div className="space-y-4 divide-y divide-border/60">
                                    {reviews.map((rev) => (
                                        <div key={rev.id} className="pt-3 first:pt-0 space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star
                                                            key={s}
                                                            className={`h-3 w-3 ${
                                                                s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-muted'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                {rev.title && <span className="text-xs font-bold text-foreground">{rev.title}</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{rev.comment}</p>
                                            {rev.artist_reply && (
                                                <div className="ml-4 mt-2 p-3 rounded-2xl bg-secondary/50 border-l-2 border-purple-500 text-xs space-y-1">
                                                    <p className="font-bold text-[11px] text-purple-400">Artist Reply</p>
                                                    <p className="text-muted-foreground">{rev.artist_reply}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right Column: Order Summary & Checkout ── */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-20 rounded-3xl border-border/80 bg-card/70 backdrop-blur-md shadow-lg overflow-hidden">
                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                                <ShoppingCart className="h-4 w-4 text-purple-400" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                                    Order Summary
                                </h2>
                            </div>

                            {selectedOption ? (
                                <div className="space-y-3.5">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Selected Package
                                        </p>
                                        <p className="text-sm font-bold text-foreground mt-0.5">{selectedOption.title}</p>
                                        <p className="font-mono font-semibold text-xs text-foreground/80 mt-0.5">
                                            {formatPrice(basePrice)}
                                        </p>
                                    </div>

                                    {/* Selected Add-ons itemization */}
                                    {selectedAddons.length > 0 && (
                                        <div className="space-y-1.5 pt-2 border-t border-border/60">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Selected Add-ons ({selectedAddons.length})
                                            </p>
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
                                    )}

                                    {/* Total Calculation */}
                                    <div className="pt-3 border-t border-border/60 flex items-baseline justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-foreground">Total Price</p>
                                            <p className="text-[10px] text-muted-foreground">Escrow protected</p>
                                        </div>
                                        <p className="text-2xl font-black font-mono text-emerald-400">
                                            {formatPrice(grandTotal)}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">Please select a service package above</p>
                            )}

                            {Boolean(user && (service.artist_profile?.user_id === user.id || user.artist_profile?.id === service.artist_profile_id)) ? (
                                <Link to="/dashboard/services" className="w-full block">
                                    <Button
                                        className="w-full h-11 rounded-2xl font-bold text-xs bg-secondary hover:bg-muted text-foreground border border-border cursor-pointer shadow-md gap-2"
                                    >
                                        <PenTool className="h-4 w-4 text-purple-400" />
                                        Manage in Artist Studio
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    className="w-full h-11 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md gap-2"
                                    disabled={!selectedOption || service.status !== 'open'}
                                    onClick={() => {
                                        if (
                                            !requireAuth({
                                                intent: 'commission',
                                                redirectUrl: `/store/${serviceId}/order`,
                                            })
                                        ) {
                                            return;
                                        }
                                        navigate(`/store/${serviceId}/order`, {
                                            state: {
                                                service,
                                                selectedOption,
                                                selectedAddonIds,
                                                selectedAddons,
                                                grandTotal,
                                            },
                                        });
                                    }}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    {service.status === 'open' ? 'Proceed to Order' : 'Service Currently Closed'}
                                </Button>
                            )}

                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                <span>100% Escrow &amp; Milestone Protection</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};
