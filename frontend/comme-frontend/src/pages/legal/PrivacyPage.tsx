import React from 'react';
import { Check, Lock, ArrowUpRight, ShieldCheck, Database, FileCheck } from 'lucide-react';
import { LegalLayout } from '@/layouts/LegalLayout';

export const PrivacyPage: React.FC = () => {
    return (
        <LegalLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Center Column */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                            Privacy Policy
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            How Comme collects, secures, and handles your personal data in full compliance with Indonesian Personal Data Protection regulations (UU PDP No. 27/2022).
                        </p>
                    </div>

                    {/* Quick Checklist */}
                    <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                <strong>UU PDP Compliance:</strong> We honor all statutory rights of personal data subjects under Indonesian law.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                <strong>Tokenized Payments via Midtrans:</strong> Raw credit card numbers and bank pins are never stored on Comme servers.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                <strong>Zero Third-Party Data Sales:</strong> Your profile, artworks, and messages are never sold to ad brokers or AI scrapers.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Sections */}
                    <div className="space-y-8 pt-8 border-t border-border/60 text-sm sm:text-base leading-relaxed text-muted-foreground">
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Database className="h-4 w-4 text-primary" />
                                1. Personal Data We Collect
                            </h2>
                            <p>
                                We collect only the data necessary to provide and secure your creative marketplace experience:
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
                                <li><strong>Identity Data:</strong> Username, email address, display name, and avatar image.</li>
                                <li><strong>Security &amp; Device Auditing:</strong> IP addresses, browser user agents, and device fingerprints stored in our <code className="text-xs bg-secondary px-1 py-0.5 rounded text-foreground">known_devices</code> audit log to detect unauthorized logins.</li>
                                <li><strong>Commission Data:</strong> Commission briefs, message histories, milestone specifications, and uploaded media attachments.</li>
                                <li><strong>Financial Metadata:</strong> Transaction IDs, order totals, and payout status via Midtrans.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <FileCheck className="h-4 w-4 text-emerald-400" />
                                2. Data Subject Rights (Hak Subjek Data Pribadi)
                            </h2>
                            <p>
                                Pursuant to Law No. 27 of 2022 (UU PDP), users have specific enforceable rights:
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
                                <li><strong>Right to Access &amp; Portability:</strong> Obtain a complete copy of your profile and commission records.</li>
                                <li><strong>Right to Rectification:</strong> Update inaccurate personal information anytime in Creator Settings.</li>
                                <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request the permanent deletion of your account and personal identifiers.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-amber-400" />
                                3. Third-Party Data Processors
                            </h2>
                            <p>
                                We partner strictly with vetted enterprise infrastructure providers:
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
                                <li><strong>Midtrans (PT Midtrans):</strong> Licensed payment gateway for processing Snap checkout and artist disbursements.</li>
                                <li><strong>Cloud Storage:</strong> Encrypted object storage for portfolio images and commission deliverables.</li>
                            </ul>
                        </section>
                    </div>
                </div>

                {/* Right Column: Privacy Tip Box */}
                <div className="lg:col-span-4">
                    <div className="sticky top-12 p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5 text-xs text-muted-foreground">
                        <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Lock className="h-4 w-4 text-emerald-400" />
                                UU PDP Officer
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </h3>
                        <p className="leading-relaxed">
                            For data access requests, rectification, or privacy concerns, contact our Data Protection Officer directly:
                        </p>
                        <div className="pt-2 border-t border-border/50 text-foreground font-semibold">
                            DPO Contact: <a href="mailto:privacy@comme.art" className="text-primary underline">privacy@comme.art</a>
                        </div>
                    </div>
                </div>
            </div>
        </LegalLayout>
    );
};
