import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Send,
    ShieldCheck,
    Sparkles,
    CheckCircle2,
    Clock,
    XCircle,
    Plus,
    Trash2,
    Globe,
    ExternalLink,
    HelpCircle,
    ChevronDown,
    ArrowRight,
    Loader2,
    Zap,
    BadgeCheck,
} from 'lucide-react';
import { artistApplicationApi } from '@/services/artistService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { formatDateSafe } from '@/utils/format';
import type { ArtistApplication } from '@/types';

const ART_SPECIALTIES = [
    'Anime / Manga',
    'Character Design',
    'VTuber / Live2D',
    'Digital Painting',
    'Concept Art',
    'Pixel Art',
    'Chibi & Emotes',
    'Fantasy / Sci-Fi',
    '3D Modeling',
    'Comics / Webtoon',
];

export const ApplyArtistPage: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    // Existing application check
    const [existingApplication, setExistingApplication] = useState<ArtistApplication | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(true);

    // Form state
    const [bio, setBio] = useState('');
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Anime / Manga', 'Character Design']);
    const [primaryPortfolio, setPrimaryPortfolio] = useState('');
    const [additionalPortfolios, setAdditionalPortfolios] = useState<string[]>([]);
    const [website, setWebsite] = useState('');
    const [twitterUrl, setTwitterUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [pixivUrl, setPixivUrl] = useState('');
    const [otherSocialUrl, setOtherSocialUrl] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // FAQ Accordion state
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        let isMounted = true;
        const checkApp = async () => {
            try {
                setCheckingStatus(true);
                const app = await artistApplicationApi.myApplication();
                if (isMounted) {
                    setExistingApplication(app);
                }
            } catch {
                // No existing application found (404), which is normal for first-time applicants
            } finally {
                if (isMounted) setCheckingStatus(false);
            }
        };
        checkApp();
        return () => {
            isMounted = false;
        };
    }, []);

    const toggleSpecialty = (spec: string) => {
        setSelectedSpecialties((prev) =>
            prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
        );
    };

    const handleAddPortfolioField = () => {
        if (additionalPortfolios.length >= 5) {
            toast.error('You can add up to 5 additional portfolio links');
            return;
        }
        setAdditionalPortfolios((prev) => [...prev, '']);
    };

    const handleUpdateAdditionalPortfolio = (index: number, val: string) => {
        const updated = [...additionalPortfolios];
        updated[index] = val;
        setAdditionalPortfolios(updated);
    };

    const handleRemoveAdditionalPortfolio = (index: number) => {
        setAdditionalPortfolios((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!bio.trim() || bio.trim().length < 20) {
            toast.error('Please write at least 20 characters in your artist bio');
            return;
        }

        if (!primaryPortfolio.trim()) {
            toast.error('Please provide a primary portfolio URL');
            return;
        }

        // Validate URL format
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(primaryPortfolio.trim())) {
            toast.error('Please enter a valid URL (e.g. https://artstation.com/yourname)');
            return;
        }

        if (!agreeTerms) {
            toast.error('Please accept the creator guidelines and terms to proceed');
            return;
        }

        setSubmitting(true);
        try {
            // Aggregate all portfolio links
            const validPortfolios = [
                primaryPortfolio.trim(),
                ...additionalPortfolios.map((p) => p.trim()).filter((p) => p && urlPattern.test(p)),
            ];

            // Aggregate social links
            const socialLinks = [
                twitterUrl.trim(),
                instagramUrl.trim(),
                pixivUrl.trim(),
                otherSocialUrl.trim(),
            ].filter((s) => s && urlPattern.test(s));

            // Format full bio with selected specialties
            const specialtiesNote = selectedSpecialties.length > 0
                ? `\n\n[Specialties]: ${selectedSpecialties.join(', ')}`
                : '';
            const fullBio = `${bio.trim()}${specialtiesNote}`;

            await artistApplicationApi.create({
                bio: fullBio,
                portfolio_links: validPortfolios,
                website: website.trim() ? website.trim() : undefined,
                social_links: socialLinks.length > 0 ? socialLinks : undefined,
            });

            toast.success('Artist application submitted successfully!');
            await refreshUser();
            navigate('/apply-artist/status');
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Failed to submit application. Please check your links and try again.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (checkingStatus) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Checking creator verification status...</p>
            </div>
        );
    }

    // 1. If user already has an active artist profile
    if (user?.artist_profile) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16">
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl p-8 text-center space-y-5 rounded-3xl shadow-2xl">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                            <BadgeCheck className="h-9 w-9" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-foreground tracking-tight">
                                You Are Already a Verified Comme Artist!
                            </h2>
                            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                                Your artist profile is active. You can manage your commission services, view incoming order requests, and configure payout accounts from your Creator Studio.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <Link to="/dashboard">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-600/20">
                                    <Sparkles className="h-4 w-4" /> Open Artist Studio
                                </Button>
                            </Link>
                            <Link to="/dashboard/services">
                                <Button variant="outline" className="rounded-xl cursor-pointer">
                                    Manage Commission Services
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // 2. If user already has a pending application
    if (existingApplication && existingApplication.status === 'pending') {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16">
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl p-8 text-center space-y-6 rounded-3xl shadow-2xl">
                        <div className="h-16 w-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                            <Clock className="h-9 w-9 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="text-2xl font-black text-foreground tracking-tight">
                                    Application Under Review
                                </h2>
                                <Badge variant="gold" className="uppercase font-mono text-[10px]">
                                    In Review
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                                Thank you for applying to become a creator on Comme! Our curator team is reviewing your portfolio submissions. We typically respond within 24 to 48 hours.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-muted/30 border border-border text-left text-xs max-w-md mx-auto space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Submitted on:</span>
                                <span className="font-bold text-foreground font-mono">
                                    {formatDateSafe(existingApplication.submitted_at || existingApplication.created_at)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Primary Portfolio:</span>
                                <span className="font-bold text-primary truncate max-w-[200px]">
                                    {existingApplication.portfolio_links?.[0] || existingApplication.portfolio_url || 'Provided'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-3 pt-2">
                            <Link to="/apply-artist/status">
                                <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl gap-2 cursor-pointer">
                                    View Full Application Details <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
            {/* ── Top Hero Banner ── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Comme Creator Program</span>
                    <span className="h-1 w-1 rounded-full bg-purple-400" />
                    <span className="text-purple-400 font-bold">Artist Verification</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                    Turn Your Art into Income with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400">Escrow Security</span>
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Join Comme's curated roster of illustrators, VTuber riggers, and concept artists. Receive upfront escrow guarantees, structured milestone chat, and seamless Midtrans payouts.
                </p>

                {/* 3 Value Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                    <div className="p-3.5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-xs text-foreground">Zero Chargeback Risk</p>
                            <p className="text-[11px] text-muted-foreground">Escrow held before drawing</p>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-xs text-foreground">Creator Studio Suite</p>
                            <p className="text-[11px] text-muted-foreground">Order queue &amp; chat tools</p>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
                            <BadgeCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-xs text-foreground">Verified Badge</p>
                            <p className="text-[11px] text-muted-foreground">Featured in Commission Store</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Main Two-Column Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Multi-Step Application Form (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Previous Rejection Alert if applicable */}
                    {existingApplication && existingApplication.status === 'rejected' && (
                        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 space-y-2 text-xs">
                            <div className="flex items-center gap-2 text-rose-400 font-bold">
                                <XCircle className="h-4 w-4" /> Previous Application Not Approved
                            </div>
                            <p className="text-muted-foreground">
                                {existingApplication.rejection_reason || 'Your previous submission did not meet the verification criteria. You are welcome to submit updated portfolio links below.'}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 1. Artist Bio & Creative Specialties Card */}
                        <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-xs overflow-hidden">
                            <CardHeader className="pb-4 border-b border-border/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">
                                            1
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-foreground">Artist Identity &amp; Specialties</CardTitle>
                                            <CardDescription className="text-xs">Tell us about your art background, techniques, and style</CardDescription>
                                        </div>
                                    </div>
                                    {user && (
                                        <div className="flex items-center gap-2 hidden sm:flex">
                                            <Avatar size="sm" fallback={user.display_name || user.username} src={user.avatar_url} />
                                            <span className="text-xs font-bold text-foreground truncate max-w-[120px]">@{user.username}</span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="p-5 space-y-5">
                                {/* Specialty Tags Selector */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase font-mono">
                                        Primary Art Styles &amp; Specialties (Select All That Apply)
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {ART_SPECIALTIES.map((spec) => {
                                            const isSelected = selectedSpecialties.includes(spec);
                                            return (
                                                <button
                                                    key={spec}
                                                    type="button"
                                                    onClick={() => toggleSpecialty(spec)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                                        isSelected
                                                            ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-600/20'
                                                            : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border-border'
                                                    }`}
                                                >
                                                    {isSelected ? '✓ ' : '+ '}
                                                    {spec}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Artist Bio */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="bio" className="text-xs font-bold text-muted-foreground uppercase font-mono">
                                            Artist Bio &amp; Creative Introduction *
                                        </Label>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            {bio.length} / 2000 chars (min 20)
                                        </span>
                                    </div>
                                    <Textarea
                                        id="bio"
                                        placeholder="e.g. Freelance illustrator with 4+ years of experience specializing in anime characters, fantasy concept art, and vibrant digital portraits. I love bringing original characters to life with intricate lighting and detailed backgrounds..."
                                        rows={4}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        maxLength={2000}
                                        className="text-xs sm:text-sm bg-muted/20 resize-none leading-relaxed"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Portfolio Showcase Card */}
                        <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-xs overflow-hidden">
                            <CardHeader className="pb-4 border-b border-border/50">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                                        2
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold text-foreground">Portfolio Showcase</CardTitle>
                                        <CardDescription className="text-xs">Provide public links where our curators can review your finished artwork</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="primary_portfolio" className="text-xs font-bold text-muted-foreground uppercase font-mono">
                                        Primary Portfolio URL *
                                    </Label>
                                    <div className="relative">
                                        <Globe className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                        <Input
                                            id="primary_portfolio"
                                            placeholder="https://artstation.com/yourname (or Cara, Pixiv, Behance, Carrd)"
                                            value={primaryPortfolio}
                                            onChange={(e) => setPrimaryPortfolio(e.target.value)}
                                            className="pl-9 text-xs sm:text-sm bg-muted/20"
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Must be a public URL with accessible illustration galleries.
                                    </p>
                                </div>

                                {/* Dynamic Additional Portfolios */}
                                {additionalPortfolios.map((link, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <Label className="text-[11px] text-muted-foreground font-mono">
                                            Additional Gallery Link #{idx + 1}
                                        </Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <ExternalLink className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                                <Input
                                                    placeholder="https://cara.app/yourname or https://behance.net/..."
                                                    value={link}
                                                    onChange={(e) => handleUpdateAdditionalPortfolio(idx, e.target.value)}
                                                    className="pl-9 text-xs sm:text-sm bg-muted/20"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveAdditionalPortfolio(idx)}
                                                className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {additionalPortfolios.length < 5 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddPortfolioField}
                                        className="text-xs gap-1.5 cursor-pointer mt-1"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Add Another Portfolio Link
                                    </Button>
                                )}

                                <div className="space-y-2 pt-2 border-t border-border/50">
                                    <Label htmlFor="website" className="text-xs font-bold text-muted-foreground uppercase font-mono">
                                        Personal Website / Portfolio Site (Optional)
                                    </Label>
                                    <Input
                                        id="website"
                                        placeholder="https://yourname.carrd.co or https://yourstudio.com"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="text-xs sm:text-sm bg-muted/20"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Social Media & Creator Accounts */}
                        <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-xs overflow-hidden">
                            <CardHeader className="pb-4 border-b border-border/50">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center text-xs font-bold font-mono">
                                        3
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold text-foreground">Social &amp; Creator Accounts</CardTitle>
                                        <CardDescription className="text-xs">Help us verify your active community presence</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-5 space-y-3.5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground font-medium">Twitter / X Profile</Label>
                                        <Input
                                            placeholder="https://twitter.com/yourhandle"
                                            value={twitterUrl}
                                            onChange={(e) => setTwitterUrl(e.target.value)}
                                            className="text-xs bg-muted/20"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground font-medium">Instagram Profile</Label>
                                        <Input
                                            placeholder="https://instagram.com/yourhandle"
                                            value={instagramUrl}
                                            onChange={(e) => setInstagramUrl(e.target.value)}
                                            className="text-xs bg-muted/20"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground font-medium">Pixiv / Cara / DeviantArt</Label>
                                        <Input
                                            placeholder="https://pixiv.net/users/... or cara.app/..."
                                            value={pixivUrl}
                                            onChange={(e) => setPixivUrl(e.target.value)}
                                            className="text-xs bg-muted/20"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground font-medium">Other Creator Link (Optional)</Label>
                                        <Input
                                            placeholder="https://linktr.ee/... or Discord tag"
                                            value={otherSocialUrl}
                                            onChange={(e) => setOtherSocialUrl(e.target.value)}
                                            className="text-xs bg-muted/20"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. Creator Agreement & Submission */}
                        <Card className="border border-purple-500/30 bg-purple-500/5 backdrop-blur-md shadow-lg overflow-hidden">
                            <CardContent className="p-5 space-y-4">
                                <label className="flex items-start gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                                    />
                                    <div className="text-xs text-muted-foreground leading-relaxed">
                                        <span className="font-bold text-foreground block">
                                            I confirm that all submitted artworks are my original creations.
                                        </span>
                                        I agree to the Comme Creator Terms of Service, commit to honest turnaround estimates, and understand that escrow payouts are governed by platform milestones.
                                    </div>
                                </label>

                                <Button
                                    type="submit"
                                    disabled={submitting || !agreeTerms || !primaryPortfolio.trim() || bio.trim().length < 20}
                                    className="w-full h-12 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-2xl gap-2 shadow-lg shadow-purple-600/25 cursor-pointer text-sm"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Submit Application for Artist Verification
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </div>

                {/* Right Column: Perks, Review Timeline & Creator FAQ (5 cols) */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
                    {/* How It Works Timeline Card */}
                    <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                                <Sparkles className="h-4 w-4 text-purple-400" />
                                Verification Roadmap
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs">
                            <div className="flex items-start gap-3">
                                <div className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                                    1
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">Submit Your Portfolio</p>
                                    <p className="text-muted-foreground mt-0.5">Fill out your art styles, portfolio URLs, and introduction.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                                    2
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">Curator Quality Review</p>
                                    <p className="text-muted-foreground mt-0.5">Our team verifies original artwork and active commission capability (24-48 hours).</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                                    3
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">Studio Dashboard Unlocked</p>
                                    <p className="text-muted-foreground mt-0.5">Create commission packages, publish services in the Store, and receive orders.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Creator Standards Checklist */}
                    <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                Creator Standards
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>Minimum 3-5 completed original illustrations in portfolio</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>Verifiable public creator account (X, Pixiv, Cara, ArtStation)</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>No AI-generated or traced artwork without full disclosure</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Creator FAQ Accordion */}
                    <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-xs">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                                <HelpCircle className="h-4 w-4 text-primary" />
                                Creator FAQ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            {[
                                {
                                    q: 'How does the Escrow Payment protect artists?',
                                    a: 'When a client accepts your commission offer, Midtrans holds 100% of the funds securely upfront. Once you deliver the completed work and the review period ends, the funds are instantly released to your payout ledger with zero risk of buyer chargebacks.',
                                },
                                {
                                    q: 'How long does portfolio review take?',
                                    a: 'Applications are typically reviewed within 24 to 48 hours on business days. You will receive an in-app notification once approved.',
                                },
                                {
                                    q: 'What payout methods are supported?',
                                    a: 'Comme supports direct bank transfers across all major Indonesian banks (BCA, Mandiri, BNI, BRI, Permata, and Iris network) with automated ledger settlement.',
                                },
                            ].map((item, idx) => (
                                <div key={idx} className="border border-border/60 rounded-xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="w-full p-3 text-left font-bold text-foreground flex items-center justify-between gap-2 hover:bg-muted/30 transition-colors cursor-pointer"
                                    >
                                        <span>{item.q}</span>
                                        <ChevronDown
                                            className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                                                openFaq === idx ? 'rotate-180 text-primary' : ''
                                            }`}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === idx && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-3 pb-3 text-muted-foreground leading-relaxed border-t border-border/40 pt-2 bg-muted/10"
                                            >
                                                {item.a}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
