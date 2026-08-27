import * as React from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from './dialog';
import { Button } from './button';
import { cn } from '@/lib/utils';

export const AlertDialog = Dialog;
export const AlertDialogTrigger = DialogTrigger;
export const AlertDialogHeader = DialogHeader;
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;
export const AlertDialogFooter = DialogFooter;

export const AlertDialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div
            ref={ref}
            role="alertdialog"
            className={cn(
                'relative z-50 w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 text-card-foreground shadow-2xl transition-all',
                className
            )}
            {...props}
        >
            {children}
        </div>
    </div>
));
AlertDialogContent.displayName = 'AlertDialogContent';

export const AlertDialogAction = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <Button ref={ref} variant="destructive" className={cn(className)} {...props} />
));
AlertDialogAction.displayName = 'AlertDialogAction';

export const AlertDialogCancel = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <Button ref={ref} variant="outline" className={cn(className)} {...props} />
));
AlertDialogCancel.displayName = 'AlertDialogCancel';
