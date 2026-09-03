import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ShieldAlert,
    EyeOff,
    UserX,
    FileQuestion,
    ArrowLeft,
    HelpCircle,
    Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type UnavailableVariant = 'taken_down' | 'suspended' | 'private' | 'not_found' | 'deleted';
export type ContentType = 'artwork' | 'post' | 'profile' | 'service' | 'content';

interface UnavailableContentStateProps {
    variant?: UnavailableVariant;
    type?: ContentType;
    title?: string;
    description?: string;
    reason?: string;
    customAction?: React.ReactNode;
}

export const UnavailableContentState: React.FC<UnavailableContentStateProps> = ({
    variant = 'not_found',
    type = 'content',
    title,
    description,
    reason,
    customAction,
}) => {
    const navigate = useNavigate();

    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

    const config = {
        taken_down: {
            icon: ShieldAlert,
            badge: 'Content Taken Down',
            badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
            iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-rose-500/10',
            defaultTitle: `This ${formattedType} is no longer available`,
            defaultDesc: `This ${type} was taken down by moderation for violating Comme's Community Guidelines and has been restricted from public view.`,
        },
        suspended: {
            icon: UserX,
            badge: 'Account Suspended',
            badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
            iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-amber-500/10',
            defaultTitle: `Creator Account Suspended`,
            defaultDesc: `The creator associated with this ${type} is currently suspended for policy violations. Their content is temporarily unavailable.`,
        },
        private: {
            icon: EyeOff,
            badge: 'Private Content',
            badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
            iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-500/10',
            defaultTitle: `This ${formattedType} is Private`,
            defaultDesc: `The author has set this ${type} to private or limited its access to approved followers only.`,
        },
        not_found: {
            icon: FileQuestion,
            badge: 'Not Found',
            badgeClass: 'bg-muted/80 text-muted-foreground border-border/80',
            iconBg: 'bg-muted/50 border-border text-muted-foreground shadow-sm',
            defaultTitle: `${formattedType} Not Found`,
            defaultDesc: `The ${type} you are trying to view does not exist, may have been deleted by the owner, or the URL is incorrect.`,
        },
        deleted: {
            icon: FileQuestion,
            badge: 'Deleted Content',
            badgeClass: 'bg-muted/80 text-muted-foreground border-border/80',
            iconBg: 'bg-muted/50 border-border text-muted-foreground shadow-sm',
            defaultTitle: `This ${formattedType} Has Been Deleted`,
            defaultDesc: `This ${type} was removed by its owner and is no longer available on Comme.`,
        },
    }[variant];

    const Icon = config.icon;
    const finalTitle = title || config.defaultTitle;
    const finalDescription = description || config.defaultDesc;

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-16 sm:py-24">
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-sm overflow-hidden shadow-xl text-center">
                    <CardContent className="p-8 sm:p-12 space-y-6">
                        {/* Icon & Glow */}
                        <div className="relative inline-flex items-center justify-center">
                            <div className={`h-20 w-20 rounded-3xl border ${config.iconBg} flex items-center justify-center shadow-lg`}>
                                <Icon className="h-10 w-10" />
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeClass}`}>
                                {config.badge}
                            </span>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-2.5 max-w-md mx-auto">
                            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                                {finalTitle}
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {finalDescription}
                            </p>

                            {reason && (
                                <div className="mt-4 p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs text-foreground/90 font-medium">
                                    <span className="text-muted-foreground">Notice: </span>
                                    "{reason}"
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                            {customAction ? (
                                customAction
                            ) : (
                                <>
                                    <Button
                                        onClick={() => navigate('/explore')}
                                        className="w-full sm:w-auto rounded-2xl text-xs font-bold gap-2 px-6 shadow-md cursor-pointer"
                                    >
                                        <Compass className="h-4 w-4" /> Explore Feed
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(-1)}
                                        className="w-full sm:w-auto rounded-2xl text-xs font-semibold gap-1.5 px-5 border-border/80 hover:bg-muted cursor-pointer"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" /> Go Back
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Help Footer */}
                        <div className="pt-4 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-center gap-4">
                            <Link to="/tickets" className="hover:text-foreground transition-colors flex items-center gap-1">
                                <HelpCircle className="h-3.5 w-3.5" /> Help Center & Appeals
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
