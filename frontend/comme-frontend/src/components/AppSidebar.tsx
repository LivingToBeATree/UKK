import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Palette,
    Layers,
    MessageSquare,
    Star,
    Wallet,
    Settings,
    Sparkles,
} from 'lucide-react';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
} from './ui/sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { Avatar } from './ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { commissionOrderApi } from '@/services/commissionService';

export interface AppSidebarProps {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
    activeTab,
    onTabChange,
}) => {
    const { user } = useAuth();
    const { collapsed } = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();

    const [activeOrdersCount, setActiveOrdersCount] = useState<number | undefined>(undefined);

    useEffect(() => {
        const fetchBadgeCounts = async () => {
            try {
                const res = await commissionOrderApi.list(1);
                const active = (res.data || []).filter((o: any) =>
                    ['pending', 'accepted', 'in_progress', 'revision'].includes(o.status)
                );
                if (active.length > 0) {
                    setActiveOrdersCount(active.length);
                }
            } catch {
                // Ignore silent failure
            }
        };

        fetchBadgeCounts();
    }, [location.pathname]);

    const studioMenu = [
        {
            id: 'overview',
            label: 'Studio Overview',
            icon: LayoutDashboard,
            path: '/dashboard',
            isActive: location.pathname === '/dashboard',
        },
        {
            id: 'portfolio',
            label: 'Portfolio Works',
            icon: Palette,
            path: '/dashboard/portfolio',
            isActive: location.pathname.startsWith('/dashboard/portfolio'),
        },
        {
            id: 'services',
            label: 'Commission Tiers',
            icon: Sparkles,
            path: '/dashboard/services',
            isActive: location.pathname.startsWith('/dashboard/services'),
        },
        {
            id: 'orders',
            label: 'Order Queue',
            icon: Layers,
            path: '/dashboard/commissions',
            badge: activeOrdersCount,
            isActive: location.pathname.startsWith('/dashboard/commissions'),
        },
    ];

    const commsMenu = [
        {
            id: 'messages',
            label: 'Client Inquiries',
            icon: MessageSquare,
            path: '/dashboard/inquiries',
            badge: activeOrdersCount,
            isActive: location.pathname.startsWith('/dashboard/inquiries') || location.pathname.startsWith('/dashboard/messages'),
        },
        {
            id: 'reviews',
            label: 'Reviews & Ratings',
            icon: Star,
            path: '/dashboard/reviews',
            isActive: location.pathname.startsWith('/dashboard/reviews'),
        },
    ];

    const financeMenu = [
        {
            id: 'payouts',
            label: 'Earnings & Escrow',
            icon: Wallet,
            path: '/dashboard/earnings',
            isActive: location.pathname.startsWith('/dashboard/earnings') || location.pathname.startsWith('/dashboard/payouts'),
        },
        {
            id: 'settings',
            label: 'Studio Settings',
            icon: Settings,
            path: '/dashboard/settings',
            isActive: location.pathname.startsWith('/dashboard/settings'),
        },
    ];

    return (
        <Sidebar>
            {/* Sidebar Header */}
            <SidebarHeader>
                <div className="flex items-center gap-3 w-full overflow-hidden">
                    <Avatar
                        size="sm"
                        fallback={user?.display_name || user?.username || 'Studio'}
                        src={user?.avatar_url}
                        isOnline={true}
                    />
                    {!collapsed && (
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-bold text-xs truncate text-foreground">
                                {user?.display_name || 'Artist Studio'}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                                @{user?.username || 'creator'} • Pro Artist
                            </span>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            {/* Sidebar Nav Content */}
            <SidebarContent className="flex-1">
                {/* 1. Studio Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Studio</SidebarGroupLabel>
                    <SidebarMenu>
                        {studioMenu.map((item) => (
                            <SidebarMenuButton
                                key={item.id}
                                icon={item.icon}
                                isActive={onTabChange && activeTab !== undefined ? activeTab === item.id : item.isActive}
                                badge={item.badge}
                                onClick={() => (onTabChange ? onTabChange(item.id) : navigate(item.path))}
                            >
                                {item.label}
                            </SidebarMenuButton>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                {/* 2. Communication Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Communication</SidebarGroupLabel>
                    <SidebarMenu>
                        {commsMenu.map((item) => (
                            <SidebarMenuButton
                                key={item.id}
                                icon={item.icon}
                                isActive={onTabChange && activeTab !== undefined ? activeTab === item.id : item.isActive}
                                badge={item.badge}
                                onClick={() => (onTabChange ? onTabChange(item.id) : navigate(item.path))}
                            >
                                {item.label}
                            </SidebarMenuButton>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                {/* 3. Financials & Management */}
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarMenu>
                        {financeMenu.map((item) => (
                            <SidebarMenuButton
                                key={item.id}
                                icon={item.icon}
                                isActive={onTabChange && activeTab !== undefined ? activeTab === item.id : item.isActive}
                                onClick={() => (onTabChange ? onTabChange(item.id) : navigate(item.path))}
                            >
                                {item.label}
                            </SidebarMenuButton>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};
