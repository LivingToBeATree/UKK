import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Ban, ArrowUpRight, Sparkles } from 'lucide-react';
import { LegalLayout } from '@/layouts/LegalLayout';

export const LicensePage: React.FC = () => {
    return (
        <LegalLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Center Column: License summary & checklist */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                            Comme Art License
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Comme artworks and commissioned deliverables are crafted for direct creator-client collaboration. Our transparent licensing structure reflects that.
                        </p>
                    </div>

                    {/* What is permitted checklist */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            What is permitted
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    All commissioned artworks can be <strong>downloaded in original full resolution</strong> and used freely according to your selected tier agreement.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>Commercial and non-commercial</strong> usages are supported transparently with creator-defined add-on licensing options.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>No additional permissions needed</strong> for agreed project scope (though crediting your artist is always appreciated!).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What is not permitted */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <span>What is not permitted</span>
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
                                <span className="h-5 w-5 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Ban className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    Standard personal commission deliverables cannot be <strong>resold, sublicensed, or monetized</strong> without purchasing a commercial license option.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
                                <span className="h-5 w-5 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Ban className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    Scraping, harvesting, or compiling artworks from Comme to <strong>train generative AI models</strong> or replicate a competing marketplace.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Longform Summary */}
                    <div className="space-y-4 pt-6 border-t border-border/60 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                        <h2 className="text-base font-bold text-foreground">
                            Grant of License
                        </h2>
                        <p>
                            Upon buyer approval and milestone release, the creator grants the client an irrevocable, worldwide license to download, display, and utilize the commissioned artwork in accordance with the purchased tier specifications.
                        </p>
                        <p>
                            For personal tier commissions, this license permits private display, personal social media avatars, and non-commercial reproduction. For commercial tier commissions, this license encompasses global commercial distribution, branding, streaming, and merchandise manufacturing.
                        </p>
                        <p className="pt-2">
                            Questions?{' '}
                            <Link to="/terms" className="text-foreground underline font-semibold hover:text-primary transition-colors">
                                Read our Terms of Service
                            </Link>{' '}
                            or{' '}
                            <a href="mailto:aryarega2811@gmail.com" className="text-foreground underline font-semibold hover:text-primary transition-colors">
                                Contact Support (aryarega2811@gmail.com)
                            </a>.
                        </p>
                    </div>
                </div>

                {/* Right Column: Unsplash-style Tip Box */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5 text-xs text-muted-foreground">
                        <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Attribution Guidelines
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </h3>
                        <p className="leading-relaxed">
                            Even though artist attribution isn&apos;t mandatory for commercial licenses, Comme creators appreciate it as it provides exposure to their craft.
                        </p>
                        <div className="p-2.5 rounded-lg bg-secondary/50 font-mono text-[11px] text-foreground">
                            Artwork by @creator on Comme
                        </div>
                    </div>
                </div>
            </div>
        </LegalLayout>
    );
};
