import * as React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-xl bg-primary/10 dark:bg-primary/15 border border-primary/20',
                className
            )}
            {...props}
        />
    );
}