import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import type { PaginationMeta, PaginationLinks } from '@/types';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
    meta?: PaginationMeta;
    links?: PaginationLinks;
    onPageChange?: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    meta,
    onPageChange,
    className,
    ...props
}) => {
    if (!meta || meta.last_page <= 1) return null;

    const { current_page, last_page, total, from, to } = meta;

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-center justify-between gap-4 py-4',
                className
            )}
            {...props}
        >
            <div className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{from ?? 0}</span> to{' '}
                <span className="font-semibold text-foreground">{to ?? 0}</span> of{' '}
                <span className="font-semibold text-foreground">{total}</span> results
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={current_page <= 1}
                    onClick={() => onPageChange?.(current_page - 1)}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>

                <div className="text-xs font-semibold px-2">
                    Page {current_page} of {last_page}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={current_page >= last_page}
                    onClick={() => onPageChange?.(current_page + 1)}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
};
