import * as React from 'react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

interface DropdownContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(undefined);

export interface DropdownMenuProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
    open: controlledOpen,
    onOpenChange,
    className,
    children,
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = React.useCallback(
        (val: boolean) => {
            if (!isControlled) setUncontrolledOpen(val);
            onOpenChange?.(val);
        },
        [isControlled, onOpenChange]
    );

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, setOpen]);

    return (
        <DropdownContext.Provider value={{ open, setOpen }}>
            <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
                {children}
            </div>
        </DropdownContext.Provider>
    );
};

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export const DropdownMenuTrigger = React.forwardRef<HTMLElement, DropdownMenuTriggerProps>(
    ({ asChild, children, onClick, className, ...props }, ref) => {
        const context = React.useContext(DropdownContext);
        if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

        const handleClick = (e: React.MouseEvent) => {
            onClick?.(e as React.MouseEvent<HTMLButtonElement>);
            context.setOpen(!context.open);
        };

        if (asChild && React.isValidElement(children)) {
            const childElement = children as React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>;
            return React.cloneElement(childElement, {
                ...props,
                ref,
                className: cn(childElement.props.className, className),
                'aria-expanded': context.open,
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                    childElement.props.onClick?.(e);
                    handleClick(e);
                },
            });
        }

        return (
            <button
                ref={ref as React.Ref<HTMLButtonElement>}
                type="button"
                className={className}
                aria-expanded={context.open}
                onClick={handleClick}
                {...props}
            >
                {children}
            </button>
        );
    }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export interface DropdownMenuContentProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children?: React.ReactNode;
    align?: 'start' | 'end' | 'center';
    side?: 'top' | 'bottom' | 'left' | 'right';
}

export const DropdownMenuContent = React.forwardRef<
    HTMLDivElement,
    DropdownMenuContentProps
>(({ className, align = 'end', side = 'bottom', children, ...props }, ref) => {
    const context = React.useContext(DropdownContext);
    if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');

    const positionClasses: Record<string, string> = {
        'bottom-start': 'top-full left-0 mt-2 origin-top-left',
        'bottom-end': 'top-full right-0 mt-2 origin-top-right',
        'bottom-center': 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top',

        'top-start': 'bottom-full left-0 mb-2 origin-bottom-left',
        'top-end': 'bottom-full right-0 mb-2 origin-bottom-right',
        'top-center': 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom',

        'left-start': 'right-full top-0 mr-2 origin-top-right',
        'left-end': 'right-full bottom-0 mr-2 origin-bottom-right',
        'left-center': 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right',

        'right-start': 'left-full top-0 ml-2 origin-top-left',
        'right-end': 'left-full bottom-0 ml-2 origin-bottom-left',
        'right-center': 'left-full top-1/2 -translate-y-1/2 ml-2 origin-left',
    };

    const posKey = `${side}-${align}`;
    const chosenPos = positionClasses[posKey] || positionClasses['bottom-end'];

    const motionVariants = {
        bottom: {
            initial: { opacity: 0, scale: 0.95, y: -6 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.95, y: -6 },
        },
        top: {
            initial: { opacity: 0, scale: 0.95, y: 6 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.95, y: 6 },
        },
        left: {
            initial: { opacity: 0, scale: 0.95, x: 6 },
            animate: { opacity: 1, scale: 1, x: 0 },
            exit: { opacity: 0, scale: 0.95, x: 6 },
        },
        right: {
            initial: { opacity: 0, scale: 0.95, x: -6 },
            animate: { opacity: 1, scale: 1, x: 0 },
            exit: { opacity: 0, scale: 0.95, x: -6 },
        },
    };

    const variant = motionVariants[side] || motionVariants.bottom;

    return (
        <AnimatePresence>
            {context.open && (
                <motion.div
                    ref={ref}
                    initial={variant.initial}
                    animate={variant.animate}
                    exit={variant.exit}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={cn(
                        'absolute z-50 min-w-45 overflow-hidden rounded-xl border border-border bg-card p-1 text-card-foreground shadow-2xl backdrop-blur-xl',
                        chosenPos,
                        className
                    )}
                    {...props}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { destructive?: boolean }
>(({ className, destructive, onClick, children, ...props }, ref) => {
    const context = React.useContext(DropdownContext);

    return (
        <button
            ref={ref}
            type="button"
            onClick={(e) => {
                onClick?.(e);
                context?.setOpen(false);
            }}
            className={cn(
                'flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-colors hover:bg-secondary focus:bg-secondary disabled:pointer-events-none disabled:opacity-50 text-left',
                destructive && 'text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
