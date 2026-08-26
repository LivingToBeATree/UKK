import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
    'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground shadow',
                secondary: 'border-transparent bg-secondary text-secondary-foreground',
                outline: 'text-foreground border-border',
                // Comme brand variants:
                purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400 font-bold',
                teal: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold',
                gold: 'border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold',
                rose: 'border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold',
                // HTTP / API Method variants:
                get: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
                post: 'border-purple-500/30 bg-purple-500/15 text-purple-400',
                patch: 'border-amber-500/30 bg-amber-500/15 text-amber-400',
                delete: 'border-rose-500/30 bg-rose-500/15 text-rose-400',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface badgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

export function Badge ({ className, variant, ...props }: badgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}