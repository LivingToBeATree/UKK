import React from 'react';
import { Check, ArrowUpRight, Shield, Scale, AlertTriangle, FileText } from 'lucide-react';
import { LegalLayout } from '@/layouts/LegalLayout';

export const TermsPage: React.FC = () => {
    return (
        <LegalLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Center Column */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                            Terms of Service
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            These Terms of Service govern your use of the Comme platform, artist storefronts, commission workbench, and dispute mediation systems.
                        </p>
                    </div>

                    {/* Quick Checklist */}
                    <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                <strong>Milestone Escrow Protection:</strong> Client payments are held securely until agreed project deliverables are reviewed.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                <strong>Independent Creator Copyright:</strong> Artists retain all moral rights and copyright to original artwork.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                <strong>Built-in Ticket &amp; Report Moderation:</strong> Disputes and copyright claims are resolved through our structured moderation workflow.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Sections */}
                    <div className="space-y-8 pt-8 border-t border-border/60 text-sm sm:text-base leading-relaxed text-muted-foreground">
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                1. Account Eligibility &amp; Registration
                            </h2>
                            <p>
                                You must be at least 13 years of age (or have parental/guardian consent) to create an account on Comme. You agree to provide accurate registration details and maintain the confidentiality of your credentials.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Shield className="h-4 w-4 text-emerald-400" />
                                2. Commission Agreements &amp; Payment Escrow
                            </h2>
                            <p>
                                A binding commission contract is established once an artist accepts a buyer&apos;s custom order request. All funds are paid upfront into escrow via Midtrans. Funds are released upon:
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
                                <li>Buyer manual approval of delivered milestone files; or</li>
                                <li>Automatic expiration of the 7-day post-delivery inspection window without an open dispute.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                                3. Dispute Resolution, Reports &amp; Moderation
                            </h2>
                            <p>
                                If a dispute arises regarding delivery quality, non-delivery, or terms breach, either party may file a <strong>Support Ticket</strong> or <strong>Report</strong> directly within the platform. Our moderation team reviews all communication logs and files, issuing appropriate remedies (milestone revisions, escrow refunds, or account sanctions).
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Scale className="h-4 w-4 text-primary" />
                                4. Governing Law &amp; Jurisdiction
                            </h2>
                            <p>
                                These Terms are governed by and construed in accordance with the laws of the Republic of Indonesia. Any legal disputes shall be submitted to the jurisdiction of the competent courts in Indonesia.
                            </p>
                        </section>
                    </div>
                </div>

                {/* Right Column: Escrow Tip Card */}
                <div className="lg:col-span-4">
                    <div className="sticky top-12 p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5 text-xs text-muted-foreground">
                        <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Scale className="h-4 w-4 text-primary" />
                                Trust &amp; Safety
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </h3>
                        <p className="leading-relaxed">
                            Need help with a transaction dispute or copyright notice?
                        </p>
                        <div className="pt-2 border-t border-border/50 text-foreground font-semibold">
                            Support: <a href="mailto:support@comme.art" className="text-primary underline">support@comme.art</a>
                        </div>
                    </div>
                </div>
            </div>
        </LegalLayout>
    );
};
