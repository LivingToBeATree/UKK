import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type HTMLMotionProps } from 'motion/react';
import {
    Dialog,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogContext,
} from './dialog';
import { Button } from './button';
import { cn } from '@/lib/utils';

export const AlertDialog = Dialog;
export const AlertDialogTrigger = DialogTrigger;
export const AlertDialogHeader = DialogHeader;
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;
export const AlertDialogFooter = DialogFooter;

export interface AlertDialogContentProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children?: React.ReactNode;
}

export const AlertDialogContent = React.forwardRef<
    HTMLDivElement,
    AlertDialogContentProps
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(DialogContext);
    if (!context) throw new Error('AlertDialogContent must be used within AlertDialog');

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && context.open) {
                context.setOpen(false);
            }
        };
        if (context.open) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [context.open, context]);

    return createPortal(
        <AnimatePresence>
            {context.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => context.setOpen(false)}
                    />
                    <motion.div
                        ref={ref}
                        role="alertdialog"
                        aria-modal="true"
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className={cn(
                            'relative z-50 w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl',
                            className
                        )}
                        {...props}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
});
AlertDialogContent.displayName = 'AlertDialogContent';

export const AlertDialogAction = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const context = React.useContext(DialogContext);
    return (
        <Button
            ref={ref}
            variant="destructive"
            className={cn(className)}
            onClick={(e) => {
                onClick?.(e);
                context?.setOpen(false);
            }}
            {...props}
        />
    );
});
AlertDialogAction.displayName = 'AlertDialogAction';

export const AlertDialogCancel = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const context = React.useContext(DialogContext);
    return (
        <Button
            ref={ref}
            variant="outline"
            className={cn(className)}
            onClick={(e) => {
                onClick?.(e);
                context?.setOpen(false);
            }}
            {...props}
        />
    );
});
AlertDialogCancel.displayName = 'AlertDialogCancel';
