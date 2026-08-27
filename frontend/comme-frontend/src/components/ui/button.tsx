import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex shrink-0 items-center justify-center rounded-xl font-semibold text-xs tracking-wide transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground hover:brightness-110 shadow-md shadow-primary/20',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
                outline:
                    'border border-border bg-card hover:bg-secondary text-foreground hover:border-border',
                ghost:
                    'hover:bg-secondary text-foreground hover:text-foreground',
                destructive:
                    'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20',
                link:
                    'text-primary underline-offset-4 hover:underline p-0 h-auto',
            },
            size: {
                default: 'h-10 px-5 py-2',
                xs: 'h-7 px-2.5 text-[11px] rounded-lg',
                sm: 'h-8 px-3.5 text-xs rounded-lg',
                lg: 'h-12 px-7 text-sm rounded-xl',
                icon: 'h-10 w-10 p-0',
                'icon-sm': 'h-8 w-8 p-0 rounded-lg',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(buttonVariants({ variant, size, className }))}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { buttonVariants };
