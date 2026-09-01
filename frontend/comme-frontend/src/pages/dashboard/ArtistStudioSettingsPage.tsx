import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Settings,
    Save,
    CheckCircle2,
    Palette,
    Clock,
    Link as LinkIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { artistProfileApi } from '@/services/artistService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { CommissionStatus } from '@/types';

export const ArtistStudioSettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile state
    const [status, setStatus] = useState<CommissionStatus>('open');
    const [bio, setBio] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [twitter, setTwitter] = useState('');
    const [artstation, setArtstation] = useState('');
    const [instagram, setInstagram] = useState('');

    const artistProfileId = user?.artist_profile?.id || (user as any)?.artistProfile?.id;

    useEffect(() => {
        const loadProfile = async () => {
            if (!artistProfileId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const profile = await artistProfileApi.show(artistProfileId);
                setStatus(profile.commission_status || 'open');
                setBio(profile.bio || '');
                setPortfolioUrl(profile.portfolio_url || '');

                const links = profile.social_links as any;
                if (typeof links === 'object' && links !== null) {
                    setTwitter(links.twitter || links.x || '');
                    setArtstation(links.artstation || '');
                    setInstagram(links.instagram || '');
                }
            } catch {
                toast.error('Failed to load studio profile settings');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [artistProfileId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!artistProfileId) {
            toast.error('Artist profile not found');
            return;
        }

        try {
            setSaving(true);
            await artistProfileApi.update(artistProfileId, {
                commission_status: status,
                bio: bio.trim(),
                portfolio_url: portfolioUrl.trim(),
                social_links: {
                    twitter: twitter.trim(),
                    artstation: artstation.trim(),
                    instagram: instagram.trim(),
                },
            });
            toast.success('Studio settings saved successfully!');
        } catch {
            toast.error('Failed to save studio settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black flex items-center gap-2.5 text-foreground">
                    <Settings className="h-6 w-6 text-purple-400" />
                    Studio Profile & Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your commission availability, artist bio, external links, and studio preferences.
                </p>
            </div>

            {loading ? (
                <div className="space-y-6">
                    <Skeleton className="h-44 w-full rounded-3xl" />
                    <Skeleton className="h-56 w-full rounded-3xl" />
                    <Skeleton className="h-56 w-full rounded-3xl" />
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-6">
                    {/* 1. Commission Availability Status */}
                    <Card className="rounded-3xl border-border/80 bg-card overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <Clock className="h-5 w-5 text-purple-400" />
                            <h3 className="text-base font-bold text-foreground">
                                Commission Availability Status
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Control whether clients can currently place orders for your services.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            {[
                                {
                                    id: 'open' as CommissionStatus,
                                    label: 'Open for Commissions',
                                    desc: 'Accepting new order requests normally',
                                    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
                                },
                                {
                                    id: 'busy' as CommissionStatus,
                                    label: 'Busy / Waitlist Only',
                                    desc: 'Queue is full; new clients are waitlisted',
                                    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
                                },
                                {
                                    id: 'closed' as CommissionStatus,
                                    label: 'Closed',
                                    desc: 'Temporarily not taking new requests',
                                    badgeColor: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
                                },
                            ].map((opt) => {
                                const isSelected = status === opt.id;
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => setStatus(opt.id)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                                            isSelected
                                                ? `${opt.badgeColor} ring-2 ring-purple-500/30 shadow-md`
                                                : 'border-border/80 bg-secondary/30 hover:bg-secondary/60 text-muted-foreground'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-foreground">{opt.label}</span>
                                            {isSelected && <CheckCircle2 className="h-4 w-4 text-purple-400" />}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            {opt.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Studio Bio & Description */}
                <Card className="rounded-3xl border-border/80 bg-card overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <Palette className="h-5 w-5 text-purple-400" />
                            <h3 className="text-base font-bold text-foreground">
                                Studio Bio & Artistic Specialty
                            </h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                About Your Studio / Bio
                            </label>
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Describe your art style, tools used (Photoshop, Blender, Clip Studio), and specialties..."
                                className="min-h-[120px] rounded-2xl bg-secondary/40 border-border/80 text-xs leading-relaxed"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                This will be highlighted on your public artist profile and marketplace store cards.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. External Links & Portfolio */}
                <Card className="rounded-3xl border-border/80 bg-card overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <LinkIcon className="h-5 w-5 text-purple-400" />
                            <h3 className="text-base font-bold text-foreground">
                                External Portfolio & Social Links
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Main Portfolio Website
                                </label>
                                <Input
                                    value={portfolioUrl}
                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                    placeholder="https://artstation.com/yourname or https://myportfolio.com"
                                    className="h-10 rounded-xl bg-secondary/40 border-border/80 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Twitter / X
                                </label>
                                <Input
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    placeholder="https://x.com/username"
                                    className="h-10 rounded-xl bg-secondary/40 border-border/80 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    ArtStation
                                </label>
                                <Input
                                    value={artstation}
                                    onChange={(e) => setArtstation(e.target.value)}
                                    placeholder="https://artstation.com/username"
                                    className="h-10 rounded-xl bg-secondary/40 border-border/80 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Instagram
                                </label>
                                <Input
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    placeholder="https://instagram.com/username"
                                    className="h-10 rounded-xl bg-secondary/40 border-border/80 text-xs"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button Bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                        type="submit"
                        disabled={saving}
                        className="h-10 px-6 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Studio Settings'}
                    </Button>
                </div>
            </form>
            )}
        </motion.div>
    );
};
