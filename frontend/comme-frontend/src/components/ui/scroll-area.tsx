import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    maxHeight?: string | number;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
    ({ className, style, maxHeight = '400px', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                style={{ maxHeight, ...style }}
                className={cn(
                    'overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40 transition-colors',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
ScrollArea.displayName = 'ScrollArea';
