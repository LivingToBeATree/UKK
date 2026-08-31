import React from 'react';
import { Check, ArrowUpRight, Cookie } from 'lucide-react';
import { LegalLayout } from '@/layouts/LegalLayout';

export const CookiePage: React.FC = () => {
    return (
        <LegalLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Center Column */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                            Cookie Policy
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Comme believes in transparency. We only use strictly essential cookies and local storage tokens necessary for platform security and basic preferences.
                        </p>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Privacy-First Approach
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>Strictly Essential Only:</strong> Session authentication and CSRF security tokens required to use your account safely.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-secondary/20">
                                <span className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    <strong>Zero Ad Trackers:</strong> No cross-site advertising pixels, third-party marketing beacons, or telemetry trackers.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cookie Breakdown Table */}
                    <div className="space-y-4 pt-6 border-t border-border/60 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                        <h2 className="text-base font-bold text-foreground">
                            Cookies &amp; Storage Tokens Used by Comme
                        </h2>

                        <div className="overflow-x-auto rounded-xl border border-border/70">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-secondary/60 text-foreground font-bold border-b border-border/70">
                                    <tr>
                                        <th className="p-3">Identifier</th>
                                        <th className="p-3">Type</th>
                                        <th className="p-3">Purpose</th>
                                        <th className="p-3">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    <tr>
                                        <td className="p-3 font-mono text-primary font-semibold">comme_session</td>
                                        <td className="p-3">Cookie (HttpOnly)</td>
                                        <td className="p-3">Maintains your authenticated user session via Laravel Sanctum</td>
                                        <td className="p-3">Session / 30 Days</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-mono text-primary font-semibold">XSRF-TOKEN</td>
                                        <td className="p-3">Cookie</td>
                                        <td className="p-3">Prevents Cross-Site Request Forgery (CSRF) attacks</td>
                                        <td className="p-3">Session</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-mono text-primary font-semibold">comme-ui-theme</td>
                                        <td className="p-3">localStorage</td>
                                        <td className="p-3">Stores your dark/light appearance preference</td>
                                        <td className="p-3">Persistent</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-mono text-primary font-semibold">comme-color-theme</td>
                                        <td className="p-3">localStorage</td>
                                        <td className="p-3">Stores your selected accent color theme (Purple, Teal, Orange)</td>
                                        <td className="p-3">Persistent</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Cookie Info Card */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5 text-xs text-muted-foreground">
                        <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Cookie className="h-4 w-4 text-amber-400" />
                                No Tracking Consent Needed
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </h3>
                        <p className="leading-relaxed">
                            Because Comme strictly utilizes first-party essential technical cookies, you won&apos;t be harassed with annoying advertising popups.
                        </p>
                    </div>
                </div>
            </div>
        </LegalLayout>
    );
};
