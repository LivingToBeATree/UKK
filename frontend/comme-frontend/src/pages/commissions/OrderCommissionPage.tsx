import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send, ShieldCheck, Layers, Tag, Sparkles } from 'lucide-react';
import { commissionOrderApi } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { formatPrice } from '@/utils/format';
import type { CommissionService, CommissionOption, CommissionAddon } from '@/types';

export const OrderCommissionPage: React.FC = () => {
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

    if (!service || !selectedOption) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
                <p className="text-muted-foreground font-semibold">No service selected. Please choose a service and package first.</p>
                <Link to="/store">
                    <Button variant="outline" className="rounded-xl">Browse Store</Button>
                </Link>
            </div>
        );
    }

    const basePrice = Number(selectedOption.base_price ?? selectedOption.price ?? 0);
    const addonsTotal = selectedAddons.reduce((acc, ad) => acc + Number(ad.additional_price || 0), 0);
    const finalTotal = grandTotal !== undefined ? grandTotal : basePrice + addonsTotal;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            toast.error('Please provide a brief description and reference instructions for your commission.');
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading('Submitting commission request...');

        try {
            const order = await commissionOrderApi.create({
                commission_service_id: service.id,
                commission_option_id: selectedOption.id,
                addon_ids: selectedAddonIds.length > 0 ? selectedAddonIds : undefined,
                description: description.trim(),
            });

            toast.dismiss(toastId);
            toast.success('Commission request submitted to the artist!');
            navigate(`/commissions/${order.id}`);
        } catch {
            toast.dismiss(toastId);
            toast.error('Failed to submit commission request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 pb-16">
            <Link
                to={`/store/${service.id}`}
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Service Details
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
                        <Sparkles className="h-6 w-6 text-purple-400" /> Confirm Commission Order
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Review your chosen package, selected add-ons, and provide your project reference details.
                    </p>
                </div>

                {/* ── Order Summary Card ── */}
                <Card className="rounded-3xl border-border/80 bg-card/60 shadow-xs overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h2 className="font-bold text-base text-foreground">{service.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="font-bold text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 gap-1">
                                    <Layers className="h-3 w-3" /> {selectedOption.title}
                                </Badge>
                                <span className="font-mono text-xs text-muted-foreground">
                                    {formatPrice(basePrice)}
                                </span>
                            </div>
                        </div>

                        {/* Itemized Add-ons */}
                        {selectedAddons.length > 0 && (
                            <div className="pt-3 border-t border-border/60 space-y-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Tag className="h-3.5 w-3.5 text-purple-400" /> Selected Add-ons ({selectedAddons.length})
                                </p>
                                <div className="space-y-1.5">
                                    {selectedAddons.map((ad) => (
                                        <div
                                            key={ad.id || ad.title}
                                            className="flex items-center justify-between text-xs text-muted-foreground"
                                        >
                                            <span>+ {ad.title}</span>
                                            <span className="font-mono font-semibold text-foreground">
                                                +{formatPrice(ad.additional_price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Grand Total */}
                        <div className="flex items-baseline justify-between pt-3 border-t border-border/60">
                            <div>
                                <span className="text-xs font-bold text-foreground">Total Expected Payment</span>
                                <p className="text-[10px] text-muted-foreground">Held securely in Escrow until completion</p>
                            </div>
                            <span className="text-2xl font-black font-mono text-emerald-400">
                                {formatPrice(finalTotal)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Commission Description & Visual References ── */}
                <Card className="rounded-3xl border-border/80 bg-card/60 shadow-xs overflow-hidden">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Commission Request &amp; Visual References <span className="text-rose-400">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your character concept, preferred poses, color palette, background atmosphere, or link to reference drive/images..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                    required
                                    className="rounded-2xl bg-secondary/40 border-border/80 text-xs leading-relaxed"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md gap-2"
                                disabled={submitting}
                            >
                                <Send className="h-4 w-4" />
                                {submitting ? 'Submitting Request...' : 'Submit Commission Request'}
                            </Button>

                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                <span>No upfront payment charged until the artist accepts your request</span>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
