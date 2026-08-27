import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
    activeTab: string;
    setActiveTab: (value: string) => void;
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

        const activeTab = value !== undefined ? value : tab;
        const setActiveTab = React.useCallback(
            (val: string) => {
                if (value === undefined) setTab(val);
                onValueChange?.(val);
            },
            [value, onValueChange]
        );

        return (
            <TabsContext.Provider value={{ activeTab, setActiveTab }}>
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
                'inline-flex h-10 items-center justify-center rounded-lg bg-secondary/80 p-1 text-muted-foreground',
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
                    'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                    isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'hover:bg-background/50 hover:text-foreground',
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext);
        if (!context) throw new Error('TabsContent must be used within Tabs');

        if (context.activeTab !== value) return null;

        return (
            <div
                ref={ref}
                role="tabpanel"
                className={cn('mt-3 ring-offset-background focus-visible:outline-none', className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
TabsContent.displayName = 'TabsContent';
