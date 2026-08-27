import * as React from 'react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
    activeTab: string;
    setActiveTab: (value: string) => void;
    id: string;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ defaultValue, value, onValueChange, className, children, ...props }, ref) => {
        const [tab, setTab] = React.useState(value || defaultValue || '');
        const id = React.useId();

        const activeTab = value !== undefined ? value : tab;
        const setActiveTab = React.useCallback(
            (val: string) => {
                if (value === undefined) setTab(val);
                onValueChange?.(val);
            },
            [value, onValueChange]
        );

        return (
            <TabsContext.Provider value={{ activeTab, setActiveTab, id }}>
                <div ref={ref} className={cn('w-full', className)} {...props}>
                    {children}
                </div>
            </TabsContext.Provider>
        );
    }
);
Tabs.displayName = 'Tabs';

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-xl bg-secondary/80 p-1 text-muted-foreground border border-border/50 relative',
                className
            )}
            {...props}
        />
    )
);
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext);
        if (!context) throw new Error('TabsTrigger must be used within Tabs');

        const isActive = context.activeTab === value;

        return (
            <button
                ref={ref}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => context.setActiveTab(value)}
                className={cn(
                    'relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer z-10',
                    isActive ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground',
                    className
                )}
                {...props}
            >
                {isActive && (
                    <motion.div
                        layoutId={`active-tab-${context.id}`}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="absolute inset-0 rounded-lg bg-card shadow-sm border border-border/60 -z-10"
                    />
                )}
                {children}
            </button>
        );
    }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children?: React.ReactNode;
    value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext);
        if (!context) throw new Error('TabsContent must be used within Tabs');

        return (
            <AnimatePresence mode="wait">
                {context.activeTab === value && (
                    <motion.div
                        ref={ref}
                        role="tabpanel"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className={cn('mt-3 ring-offset-background focus-visible:outline-none', className)}
                        {...props}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }
);
TabsContent.displayName = 'TabsContent';
