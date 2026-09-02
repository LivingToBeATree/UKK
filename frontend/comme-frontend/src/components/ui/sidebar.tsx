import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'motion/react';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
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

    // Auto-close mobile drawer when window resizes to desktop breakpoint
    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        const handleResize = (e: MediaQueryListEvent) => {
            if (e.matches) setMobileOpen(false);
        };
        mediaQuery.addEventListener('change', handleResize);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);

    // Close on Escape key on mobile
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && mobileOpen) {
                setMobileOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileOpen]);

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
    const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

    return (
        <>
            {/* Desktop Sidebar (md and above) */}
            <motion.aside
                animate={{ width: collapsed ? 72 : 256 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className={cn(
                    'hidden md:flex sticky top-0 h-screen min-h-screen shrink-0 border-r border-border bg-card/90 backdrop-blur-xl z-30 flex-col transition-colors overflow-y-auto',
                    className
                )}
                {...props}
            >
                {children}
            </motion.aside>

            {/* 2. Mobile Slide-Over Drawer (< md) */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
                        />

                        {/* Slide-over Drawer Panel */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                            className={cn(
                                'fixed inset-y-0 left-0 z-50 flex flex-col w-70 bg-card border-r border-border shadow-2xl md:hidden',
                                className
                            )}
                            {...props}
                        >
                            <div className="absolute top-4 right-3 z-10 md:hidden">
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setMobileOpen(false)}
                                    aria-label="Close sidebar"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            {children}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
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

    return (
        <div
            className={cn(
                'px-3 text-[11px] font-bold tracking-wider uppercase text-muted-foreground/70 truncate',
                collapsed && 'hidden md:hidden',
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
    onClick,
    ...props
}: SidebarMenuButtonProps) {
    const { collapsed, setMobileOpen } = useSidebar();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        // Auto close mobile drawer on item click
        setMobileOpen(false);
    };

    return (
        <li>
            <button
                onClick={handleClick}
                className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer select-none outline-none',
                    isActive
                        ? 'bg-primary/10 text-primary border-l-2 border-primary font-bold shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
                    collapsed && 'md:justify-center md:px-0 md:py-2.5',
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
                <span className={cn('flex-1 text-left truncate', collapsed && 'md:hidden')}>
                    {children}
                </span>
                {badge !== undefined && (
                    <span
                        className={cn(
                            'ml-auto rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-extrabold',
                            collapsed && 'md:hidden'
                        )}
                    >
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
            aria-label="Toggle desktop sidebar"
            className={cn('text-muted-foreground hover:text-foreground hidden md:inline-flex', className)}
            {...props}
        >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
    );
}

export function SidebarMobileTrigger({
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { toggleMobile } = useSidebar();

    return (
        <Button
            variant="outline"
            size="icon-sm"
            onClick={toggleMobile}
            aria-label="Open mobile navigation sidebar"
            className={cn('md:hidden text-muted-foreground hover:text-foreground', className)}
            {...props}
        >
            <Menu className="h-4 w-4" />
        </Button>
    );
}
