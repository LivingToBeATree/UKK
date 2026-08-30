import React from 'react';
import { Check, Shield, Lock, Clock, ArrowUpRight } from 'lucide-react';
import { LegalLayout } from '@/layouts/LegalLayout';

export const EscrowPage: React.FC = () => {
    return (
        <LegalLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Center Column */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                            Escrow &amp; Payment Security
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            How Comme protects client payments, guarantees artist compensation, and safeguards transactions with bank-grade encryption.
                        </p>
                    </div>

                    {/* How Escrow Works Checklist */}
                    <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                <strong>Upfront Escrow Deposit:</strong> Funds are locked securely in Comme&apos;s verified merchant account before the creator begins production.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                <strong>Dual-Trigger Release:</strong> Funds are released to the artist upon buyer approval or automatically 7 days after final delivery inspection.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                            <p className="text-sm sm:text-base text-foreground font-medium">
                                <strong>PCI-DSS Compliant Processing:</strong> Raw card details and bank credentials never touch Comme servers—processed via Midtrans.
                            </p>
                        </div>
                    </div>

                    {/* Step-by-Step Lifecycle */}
                    <div className="space-y-6 pt-6 border-t border-border/60 text-sm leading-relaxed text-muted-foreground">
                        <h2 className="text-lg font-bold text-foreground">
                            The Commission Escrow Lifecycle
                        </h2>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-card border border-border/70 space-y-1.5">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-primary" /> Step 1: Order Acceptance &amp; Secure Hold
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    When an artist accepts a commission brief, the client settles the invoice via Midtrans Snap (GoPay, QRIS, Virtual Account, Credit Card). Payment is held safely in escrow.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-card border border-border/70 space-y-1.5">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-amber-400" /> Step 2: Milestone Delivery &amp; Review
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    The creator submits drafts and deliverables through the commission workbench. The client has the opportunity to request revisions per the agreed service tier.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-card border border-border/70 space-y-1.5">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-emerald-400" /> Step 3: Payout Disbursement
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Once the buyer confirms satisfaction—or 7 calendar days elapse after final delivery with no dispute—escrow releases the payout directly to the artist&apos;s verified account.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dispute Resolution */}
                    <div className="space-y-3 pt-6 border-t border-border/60 text-sm leading-relaxed text-muted-foreground">
                        <h2 className="text-lg font-bold text-foreground">
                            Dispute Handling &amp; Mediation
                        </h2>
                        <p>
                            If an artist fails to deliver within agreed deadlines or deliverables deviate substantially from specifications, clients can open a mediation ticket. Our moderation team reviews the workbench audit log, chat history, and submitted files to determine fair resolution or full refund.
                        </p>
                    </div>
                </div>

                {/* Right Column: Escrow Guarantee Card */}
                <div className="lg:col-span-4">
                    <div className="sticky top-12 p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5 text-xs text-muted-foreground">
                        <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Shield className="h-4 w-4 text-emerald-400" />
                                Payment Protection
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </h3>
                        <p className="leading-relaxed">
                            Powered by Midtrans payment gateway with 3D Secure authentication and automated fraud detection.
                        </p>
                        <div className="p-3 rounded-xl bg-secondary/70 border-l-2 border-emerald-400 text-[11px] text-foreground space-y-1">
                            <p className="font-semibold">Zero Chargeback Risk</p>
                            <p className="text-muted-foreground">Artists are protected against unverified chargebacks once work is delivered in good faith.</p>
                        </div>
                    </div>
                </div>
            </div>
        </LegalLayout>
    );
};
