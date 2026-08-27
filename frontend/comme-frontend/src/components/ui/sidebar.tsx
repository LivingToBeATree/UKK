import React, { useState } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { SidebarContext } from '@/contexts/sidebarContextDef';
import { useSidebar } from '@/hooks/useSidebar';

export interface SidebarProviderProps {
    children: React.ReactNode;
    defaultCollapsed?: boolean;
    storageKey?: string;
}

export function SidebarProvider({
    children,
    defaultCollapsed = false,
    storageKey = 'comme-sidebar-collapsed',
}: SidebarProviderProps) {
    const [collapsed, setCollapsedState] = useState<boolean>(() => {
        const saved = localStorage.getItem(storageKey);
        return saved !== null ? saved === 'true' : defaultCollapsed;
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    const setCollapsed = (val: boolean) => {
        setCollapsedState(val);
        localStorage.setItem(storageKey, String(val));
    };

    const toggleSidebar = () => setCollapsed(!collapsed);
    const toggleMobile = () => setMobileOpen(!mobileOpen);

    return (
        <SidebarContext.Provider
            value={{
                collapsed,
                setCollapsed,
                toggleSidebar,
                mobileOpen,
                setMobileOpen,
                toggleMobile,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export interface SidebarProps extends Omit<HTMLMotionProps<'aside'>, 'children'> {
    children?: React.ReactNode;
    collapsible?: boolean;
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
    const { collapsed } = useSidebar();

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 256 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className={cn(
                'relative flex flex-col h-full shrink-0 border-r border-border bg-card/60 backdrop-blur-md z-30 transition-colors',
                className
            )}
            {...props}
        >
            {children}
        </motion.aside>
    );
}

export function SidebarHeader({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('flex h-16 items-center px-4 border-b border-border/60 shrink-0', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function SidebarContent({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex-1 overflow-y-auto px-3 py-4 space-y-6', className)} {...props}>
            {children}
        </div>
    );
}

export function SidebarFooter({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('flex flex-col p-3 border-t border-border/60 shrink-0 gap-2', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function SidebarGroup({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('space-y-1.5', className)} {...props}>
            {children}
        </div>
    );
}

export function SidebarGroupLabel({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    const { collapsed } = useSidebar();

    if (collapsed) {
        return <div className="h-2" />;
    }

    return (
        <div
            className={cn(
                'px-3 text-[11px] font-bold tracking-wider uppercase text-muted-foreground/70 truncate',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function SidebarMenu({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLUListElement>) {
    return (
        <ul className={cn('space-y-1', className)} {...props}>
            {children}
        </ul>
    );
}

export interface SidebarMenuButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ElementType;
    isActive?: boolean;
    badge?: string | number;
}

export function SidebarMenuButton({
    className,
    children,
    icon: Icon,
    isActive = false,
    badge,
    ...props
}: SidebarMenuButtonProps) {
    const { collapsed } = useSidebar();

    return (
        <li>
            <button
                className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer select-none outline-none',
                    isActive
                        ? 'bg-primary/10 text-primary border-l-2 border-primary font-bold shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
                    collapsed && 'justify-center px-0 py-2.5',
                    className
                )}
                {...props}
            >
                {Icon && (
                    <Icon
                        className={cn(
                            'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                    />
                )}
                {!collapsed && (
                    <span className="flex-1 text-left truncate">{children}</span>
                )}
                {!collapsed && badge !== undefined && (
                    <span className="ml-auto rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-extrabold">
                        {badge}
                    </span>
                )}
            </button>
        </li>
    );
}

export function SidebarTrigger({
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { collapsed, toggleSidebar } = useSidebar();

    return (
        <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className={cn('text-muted-foreground hover:text-foreground', className)}
            {...props}
        >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
    );
}
