import React from 'react';
import { Check, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { LegalLayout } from '@/layouts/LegalLayout';

export const EscrowPage: React.FC = () => {
    return (
        <LegalLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Center Column */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                            Escrow &amp; Payment Security
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            How Comme protects client payments, guarantees artist compensation, and safeguards transactions with bank-grade encryption.
                        </p>
                    </div>

                    {/* How Escrow Works Checklist */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Escrow Protections
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>Upfront Escrow Deposit:</strong> Funds are locked securely in Comme&apos;s verified merchant account before the creator begins production.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>Dual-Trigger Release:</strong> Funds are released to the artist upon buyer approval or automatically 7 days after final delivery inspection.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>PCI-DSS Compliant Processing:</strong> Raw card details and bank credentials never touch Comme servers—processed via Midtrans.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step-by-Step Lifecycle */}
                    <div className="space-y-6 pt-6 border-t border-border/60 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                        <h2 className="text-base font-bold text-foreground">
                            Step-by-Step Payment Journey
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl border border-border/60 bg-secondary/30 space-y-2">
                                <div className="flex items-center gap-2 font-bold text-foreground text-xs">
                                    <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono">1</span>
                                    <span>Lock in Escrow</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Buyer initiates order. Payment clears via Midtrans Snap and is held safely in escrow.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/60 bg-secondary/30 space-y-2">
                                <div className="flex items-center gap-2 font-bold text-foreground text-xs">
                                    <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono">2</span>
                                    <span>Work in Progress</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Artist creates deliverables with peace of mind knowing funds are verified and secured.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/60 bg-secondary/30 space-y-2">
                                <div className="flex items-center gap-2 font-bold text-foreground text-xs">
                                    <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono">3</span>
                                    <span>Review &amp; Release</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Buyer approves or 7-day review window passes. Midtrans Iris releases payout to creator.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Escrow Guarantee Box */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5 text-xs text-muted-foreground">
                        <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                Escrow Guarantee
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </h3>
                        <p className="leading-relaxed">
                            Every transaction on Comme is backed by our full escrow mediation protocol. Funds remain safeguarded until agreed work is fulfilled.
                        </p>
                    </div>
                </div>
            </div>
        </LegalLayout>
    );
};
