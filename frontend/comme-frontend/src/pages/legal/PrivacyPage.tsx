import React from 'react';
import { Check, Lock, ArrowUpRight, ShieldCheck, Database, FileCheck } from 'lucide-react';
import { LegalLayout } from '@/layouts/LegalLayout';

export const PrivacyPage: React.FC = () => {
    return (
        <LegalLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Center Column */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                            Privacy Policy
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            How Comme collects, secures, and handles your personal data in compliance with Indonesian Personal Data Protection regulations (UU PDP No. 27/2022).
                        </p>
                    </div>

                    {/* Quick Checklist */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Key Privacy Safeguards
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>UU PDP Compliance:</strong> We honor all statutory rights of personal data subjects including access, correction, and deletion.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>Tokenized Payments via Midtrans:</strong> Raw credit card numbers and bank security pins never touch or reside on Comme servers.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>Encrypted Payout Details:</strong> Artist bank account numbers are stored encrypted at rest using AES-256 cryptographic standards.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Legal Sections */}
                    <div className="space-y-6 pt-6 border-t border-border/60 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                        <section className="space-y-2.5">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Database className="h-4 w-4 text-primary" />
                                1. Information We Collect
                            </h2>
                            <p>
                                When creating an account or placing a commission, we collect your verified email, display name, username, and communication logs exchanged inside commission workspaces.
                            </p>
                        </section>

                        <section className="space-y-2.5">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <FileCheck className="h-4 w-4 text-emerald-400" />
                                2. Legal Basis for Processing
                            </h2>
                            <p>
                                Data processing occurs under contractual necessity to facilitate transactions, maintain verified creator profiles, deliver notifications, and fulfill statutory tax reporting requirements.
                            </p>
                        </section>

                        <section className="space-y-2.5">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-amber-400" />
                                3. Third-Party Data Processors
                            </h2>
                            <p>
                                We partner strictly with vetted enterprise infrastructure providers:
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5 text-xs">
                                <li><strong>Midtrans (PT Midtrans):</strong> Licensed payment gateway for processing Snap checkout and Iris artist disbursements.</li>
                                <li><strong>Cloud Storage:</strong> Encrypted object storage for portfolio images and commission deliverables.</li>
                            </ul>
                        </section>
                    </div>
                </div>

                {/* Right Column: Privacy Tip Box */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5 text-xs text-muted-foreground">
                        <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Lock className="h-4 w-4 text-emerald-400" />
                                Data Protection Officer
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </h3>
                        <p className="leading-relaxed">
                            For data access requests, account rectification, or statutory privacy inquiries under UU PDP, contact our team:
                        </p>
                        <div className="pt-2 border-t border-border/50 text-foreground font-semibold">
                            DPO Contact: <a href="mailto:aryarega2811@gmail.com" className="text-primary underline">aryarega2811@gmail.com</a>
                        </div>
                    </div>
                </div>
            </div>
        </LegalLayout>
    );
};
