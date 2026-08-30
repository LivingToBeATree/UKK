import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Ban, ArrowUpRight } from 'lucide-react';
import { LegalLayout } from '@/layouts/LegalLayout';

export const LicensePage: React.FC = () => {
    return (
        <LegalLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Center Column: License summary & checklist */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                            License
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Comme artworks and commissioned deliverables are made for direct creator-client collaboration. Our license reflects that.
                        </p>
                    </div>

                    {/* What is permitted checklist */}
                    <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                All commissioned artworks can be <strong>downloaded in full resolution</strong> and used freely according to your selected tier
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                <strong>Commercial and non-commercial</strong> purposes supported with transparent add-on licensing
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                <strong>No additional permission needed</strong> (though crediting your artist is appreciated!)
                            </p>
                        </div>
                    </div>

                    {/* What is not permitted */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            What is not permitted <span role="img" aria-label="thumbs down">👎</span>
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="h-5 w-5 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Ban className="h-3.5 w-3.5 stroke-[2.5]" />
                                </span>
                                <p className="text-sm text-muted-foreground">
                                    Standard personal commission assets cannot be <strong>resold or monetized</strong> without purchasing the commercial rights tier.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="h-5 w-5 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Ban className="h-3.5 w-3.5 stroke-[2.5]" />
                                </span>
                                <p className="text-sm text-muted-foreground">
                                    Scraping or compiling artwork from Comme to <strong>train generative AI models</strong> or replicate a competing marketplace.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Longform Legal Text */}
                    <div className="space-y-4 pt-8 border-t border-border/60 text-sm leading-relaxed text-muted-foreground">
                        <h2 className="text-lg font-bold text-foreground">
                            Longform
                        </h2>
                        <p>
                            Upon milestone completion and escrow release, the artist grants the client an irrevocable, worldwide license to download, display, and utilize the commissioned artwork in accordance with the purchased order specifications.
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
                            <a href="mailto:support@comme.art" className="text-foreground underline font-semibold hover:text-primary transition-colors">
                                Contact Support
                            </a>.
                        </p>
                    </div>
                </div>

                {/* Right Column: Unsplash-style Tip Box */}
                <div className="lg:col-span-4">
                    <div className="sticky top-12 p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5 text-xs text-muted-foreground">
                        <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                            <span>Tip: How to give attribution</span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </h3>
                        <p className="leading-relaxed">
                            Even though artist attribution isn&apos;t mandatory for commercial licenses, Comme creators appreciate it as it provides exposure to their craft and supports their creative growth.
                        </p>
                        <div className="p-3 rounded-xl bg-secondary/70 border-l-2 border-primary font-mono text-[11px] text-foreground">
                            Art by <span className="underline">@artist_handle</span> on Comme
                        </div>
                    </div>
                </div>
            </div>
        </LegalLayout>
    );
};
