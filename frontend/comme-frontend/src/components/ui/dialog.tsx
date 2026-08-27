import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open: controlledOpen, onOpenChange, children }) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = React.useCallback(
        (val: boolean) => {
            if (!isControlled) setUncontrolledOpen(val);
            onOpenChange?.(val);
        },
        [isControlled, onOpenChange]
    );

    return (
        <DialogContext.Provider value={{ open, setOpen }}>
            {children}
        </DialogContext.Provider>
    );
};

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export const DialogTrigger = React.forwardRef<HTMLElement, DialogTriggerProps>(
    ({ asChild, children, onClick, className, ...props }, ref) => {
        const context = React.useContext(DialogContext);
        if (!context) throw new Error('DialogTrigger must be used within Dialog');

        const handleClick = (e: React.MouseEvent) => {
            onClick?.(e as React.MouseEvent<HTMLButtonElement>);
            context.setOpen(true);
        };

        if (asChild && React.isValidElement(children)) {
            const childElement = children as React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>;
            return React.cloneElement(childElement, {
                ...props,
                ref,
                className: cn(childElement.props.className, className),
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
                onClick={handleClick}
                {...props}
            >
                {children}
            </button>
        );
    }
);
DialogTrigger.displayName = 'DialogTrigger';

export const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => {
    const context = React.useContext(DialogContext);
    if (!context) throw new Error('DialogContent must be used within Dialog');

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && context.open) {
                context.setOpen(false);
                onClose?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [context, onClose]);

    if (!context.open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => {
                    context.setOpen(false);
                    onClose?.();
                }}
            />
            {/* Modal Card */}
            <div
                ref={ref}
                role="dialog"
                aria-modal="true"
                className={cn(
                    'relative z-50 w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl transition-all',
                    className
                )}
                {...props}
            >
                {children}
                <button
                    type="button"
                    onClick={() => {
                        context.setOpen(false);
                        onClose?.();
                    }}
                    className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    );
});
DialogContent.displayName = 'DialogContent';

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col space-y-1.5 text-left mb-4', className)} {...props} />
    )
);
DialogHeader.displayName = 'DialogHeader';

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2 ref={ref} className={cn('text-lg font-bold leading-none tracking-tight text-foreground', className)} {...props} />
    )
);
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 gap-2', className)} {...props} />
    )
);
DialogFooter.displayName = 'DialogFooter';
