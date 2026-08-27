import * as React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-xl bg-purple-900/10 dark:bg-purple-400/10 border border-border/50',
                className
            )}
            {...props}
        />
    );
}