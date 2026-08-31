import React from 'react';
import { ArrowUpRight, Code2 } from 'lucide-react';
import { LegalLayout } from '@/layouts/LegalLayout';

export const ApiTermsPage: React.FC = () => {
    return (
        <LegalLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Center Column */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                            API Terms of Service
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Guidelines for programmatic platform access, developer endpoints, and integrations with Comme.
                        </p>
                    </div>

                    {/* Notice */}
                    <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-4">
                        <div className="flex items-center gap-2 text-foreground font-bold text-base">
                            <Code2 className="h-5 w-5 text-primary" />
                            <span>Public API Access Notice</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Comme does not currently offer an open public developer API for external automated data harvesting or third-party client bots. Access to Comme endpoints is restricted strictly to official first-party web applications and verified creator studio tools.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            If you are an enterprise partner, educational researcher, or creator tool developer seeking private API access or webhook integration, please reach out to <a href="mailto:developers@comme.art" className="text-primary underline">developers@comme.art</a>.
                        </p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5 text-xs text-muted-foreground">
                        <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                            <span>Developer Contact</span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </h3>
                        <p className="leading-relaxed">
                            Interested in building studio extensions or Discord bot integrations for Comme?
                        </p>
                        <div className="pt-2 border-t border-border/50 text-foreground font-semibold">
                            Inquiries: <a href="mailto:developers@comme.art" className="text-primary underline">developers@comme.art</a>
                        </div>
                    </div>
                </div>
            </div>
        </LegalLayout>
    );
};
