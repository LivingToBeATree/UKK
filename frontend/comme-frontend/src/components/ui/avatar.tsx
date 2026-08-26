import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
    src?: string | null,
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isOnline?: boolean;
}

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl font-bold',
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, alt, fallback, size = 'md', isOnline, ...props }, ref) => {
        const [imageError, setImageError] = React.useState(false);

        const getInitials = (text?: string) => {
            if (!text) return 'U';
            const parts = text.trim().split(' ');
            if (parts.length >= 2) {
                return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
            }
            return text.slice(0, 2).toUpperCase();
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-border bg-secondary font-medium text-secondary-foreground ring-offset-background',
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {src && !imageError ? (
                    <img
                        src={src}
                        alt={alt || 'Avatar'}
                        className='h-full w-full object-cover'
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <span>{fallback ? getInitials(fallback) : getInitials(alt)}</span>
                )}

                {isOnline !== undefined && (
                    <span 
                        className={cn(
                            'absolute bottom-0 right-0 block rounded-full ring-2 ring-background',
                            isOnline ? 'bg-emerald-500' : 'bg-muted-foreground',
                            size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
                        )}
                    />
                )}
            </div>
        );
    }
);
Avatar.displayName = 'Avatar'