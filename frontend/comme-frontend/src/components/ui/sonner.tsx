import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="system"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans',
                    description: 'group-[.toast]:text-muted-foreground',
                    actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium',
                    cancelButton:
                        'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                    error:
                        'group-[.toaster]:border-rose-500/40 group-[.toaster]:text-rose-400 group-[.toaster]:bg-rose-950/20',
                    success:
                        'group-[.toaster]:border-emerald-500/40 group-[.toaster]:text-emerald-400 group-[.toaster]:bg-emerald-950/20',
                },
            }}
            {...props}
        />
    );
};

export { toast };
