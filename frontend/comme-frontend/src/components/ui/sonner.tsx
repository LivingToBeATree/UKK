import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            richColors
            closeButton
            position="top-right"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl font-sans text-xs',
                    description: 'group-[.toast]:text-muted-foreground text-xs',
                },
            }}
            {...props}
        />
    );
};

export { toast };
