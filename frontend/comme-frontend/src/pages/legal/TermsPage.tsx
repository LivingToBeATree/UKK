import React from 'react';
import { Check, ArrowUpRight, Scale, FileText, AlertTriangle } from 'lucide-react';
import { LegalLayout } from '@/layouts/LegalLayout';

export const TermsPage: React.FC = () => {
    return (
        <LegalLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Center Column */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                            Terms of Service
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            These Terms of Service govern your use of the Comme platform, artist storefronts, commission workbench, and dispute mediation systems.
                        </p>
                    </div>

                    {/* Quick Checklist */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Platform Guarantees
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>Milestone Escrow Protection:</strong> Client payments are held securely in escrow until agreed project deliverables are completed and reviewed.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>Creator Intellectual Property:</strong> Creators retain full copyright and moral rights to their original creations unless explicitly transferred.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>7-Day Inspection Window:</strong> Buyers receive a full 7-day review window upon delivery to inspect work or request revisions before funds release.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Legal Sections */}
                    <div className="space-y-6 pt-6 border-t border-border/60 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                        <section className="space-y-2.5">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                1. Account Eligibility &amp; Conduct
                            </h2>
                            <p>
                                Users must provide accurate profile details. Harassment, unauthorized commercial scraping, spam, or uploading illicit material is strictly prohibited and subject to immediate suspension.
                            </p>
                        </section>

                        <section className="space-y-2.5">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                                2. Commission Workflow &amp; Cancellations
                            </h2>
                            <p>
                                Once an order is accepted and paid, the artist undertakes production within the designated turnaround deadline. If an artist fails to deliver, clients are eligible for mediation and escrow refund.
                            </p>
                        </section>

                        <section className="space-y-2.5">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Scale className="h-4 w-4 text-primary" />
                                3. Governing Law &amp; Jurisdiction
                            </h2>
                            <p>
                                These Terms are governed by and construed in accordance with the laws of the Republic of Indonesia. Any legal disputes shall be resolved through Indonesian courts.
                            </p>
                        </section>
                    </div>
                </div>

                {/* Right Column: Trust Card */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5 text-xs text-muted-foreground">
                        <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Scale className="h-4 w-4 text-primary" />
                                Trust &amp; Safety
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </h3>
                        <p className="leading-relaxed">
                            Need help with a transaction dispute, intellectual property report, or account assistance?
                        </p>
                        <div className="pt-2 border-t border-border/50 text-foreground font-semibold">
                            Support: <a href="mailto:aryarega2811@gmail.com" className="text-primary underline">aryarega2811@gmail.com</a>
                        </div>
                    </div>
                </div>
            </div>
        </LegalLayout>
    );
};
