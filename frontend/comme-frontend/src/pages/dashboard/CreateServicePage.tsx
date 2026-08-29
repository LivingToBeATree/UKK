import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Plus, Trash2, Layers, DollarSign } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { commissionServiceApi } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';

interface OptionItem {
    title: string;
    description: string;
    base_price: number;
}

interface ServiceForm {
    name: string;
    description: string;
    status: 'draft' | 'open' | 'closed';
    options: OptionItem[];
}

export const CreateServicePage: React.FC = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ServiceForm>({
        defaultValues: {
            status: 'open',
            options: [
                {
                    title: 'Standard Tier',
                    description: 'Full color finished illustration with simple background and 2 revisions.',
                    base_price: 500000,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'options',
    });

    const onSubmit = async (data: ServiceForm) => {
        if (data.options.length === 0) {
            toast.error('Please add at least one pricing tier option.');
            return;
        }

        setSubmitting(true);
        try {
            await commissionServiceApi.create({
                name: data.name,
                description: data.description,
                status: data.status,
                options: data.options.map((opt) => ({
                    title: opt.title,
                    description: opt.description,
                    base_price: Number(opt.base_price),
                })),
            });
            toast.success('Commission service created with pricing tiers!');
            navigate('/dashboard/services');
        } catch {
            toast.error('Failed to create commission service');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
            <Link
                to="/dashboard/services"
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Services
            </Link>

            <div>
                <h1 className="text-2xl font-black tracking-tight">Create Commission Service</h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Set up your commission listing, description, and pricing tiers for prospective clients.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* 1. General Service Details */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-base font-bold flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" /> Service Overview
                        </h2>

                        <div className="space-y-2">
                            <Label htmlFor="name">Service Listing Title *</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Dynamic Character Illustration / Live2D Model"
                                {...register('name', { required: 'Service title is required' })}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Detailed Description & Terms *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what you draw (poses, backgrounds, formats) and your terms of service..."
                                {...register('description', { required: 'Description is required' })}
                                rows={4}
                            />
                            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Availability Status</Label>
                            <select
                                id="status"
                                {...register('status')}
                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                <option value="open">Open (Ready for orders)</option>
                                <option value="closed">Closed (Queue full)</option>
                                <option value="draft">Draft (Hidden)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Pricing Tiers Builder */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-emerald-400" /> Pricing Options & Tiers ({fields.length})
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Add customizable options (e.g. Bust Up, Half Body, Full Render) for buyers to select.
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="xs"
                                variant="outline"
                                onClick={() =>
                                    append({
                                        title: `Tier ${fields.length + 1}`,
                                        description: 'Includes full resolution source files.',
                                        base_price: 750000,
                                    })
                                }
                                className="gap-1"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Tier
                            </Button>
                        </div>

                        <div className="space-y-4 pt-2">
                            {fields.map((field, idx) => (
                                <div
                                    key={field.id}
                                    className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3 relative"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono font-bold text-primary">
                                            Tier #{idx + 1}
                                        </span>
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(idx)}
                                                className="text-xs text-rose-500 hover:text-rose-400 p-1 flex items-center gap-1 cursor-pointer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-2 space-y-1">
                                            <Label className="text-[11px]">Tier Title *</Label>
                                            <Input
                                                placeholder="e.g. Full Body + Background"
                                                {...register(`options.${idx}.title` as const, { required: true })}
                                                className="text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Base Price (IDR) *</Label>
                                            <Input
                                                type="number"
                                                placeholder="750000"
                                                {...register(`options.${idx}.base_price` as const, {
                                                    required: true,
                                                    valueAsNumber: true,
                                                })}
                                                className="text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[11px]">Tier Inclusions & Details</Label>
                                        <Input
                                            placeholder="e.g. Includes 300 DPI PSD + PNG + 2 revision rounds"
                                            {...register(`options.${idx}.description` as const)}
                                            className="text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Toolbar */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/dashboard/services')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="gap-2">
                        <Save className="h-4 w-4" />
                        {submitting ? 'Publishing Service...' : 'Publish Service Listing'}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};
