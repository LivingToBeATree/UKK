import React from 'react';
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
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarTrigger,
} from './ui/sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { Avatar } from './ui/avatar';
import { useAuth } from '@/hooks/useAuth';

export interface AppSidebarProps {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
    activeTab = 'overview',
    onTabChange,
}) => {
    const { user } = useAuth();
    const { collapsed } = useSidebar();

    const studioMenu = [
        { id: 'overview', label: 'Studio Overview', icon: LayoutDashboard },
        { id: 'portfolio', label: 'Portfolio Works', icon: Palette },
        { id: 'services', label: 'Commission Tiers', icon: Sparkles },
        { id: 'orders', label: 'Order Queue', icon: Layers, badge: 3 },
    ];

    const commsMenu = [
        { id: 'messages', label: 'Client Inquiries', icon: MessageSquare, badge: 2 },
        { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
    ];

    const financeMenu = [
        { id: 'payouts', label: 'Earnings & Escrow', icon: Wallet },
        { id: 'settings', label: 'Studio Settings', icon: Settings },
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
            <SidebarContent>
                {/* 1. Studio Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Studio</SidebarGroupLabel>
                    <SidebarMenu>
                        {studioMenu.map((item) => (
                            <SidebarMenuButton
                                key={item.id}
                                icon={item.icon}
                                isActive={activeTab === item.id}
                                badge={item.badge}
                                onClick={() => onTabChange?.(item.id)}
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
                                isActive={activeTab === item.id}
                                badge={item.badge}
                                onClick={() => onTabChange?.(item.id)}
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
                                isActive={activeTab === item.id}
                                onClick={() => onTabChange?.(item.id)}
                            >
                                {item.label}
                            </SidebarMenuButton>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* Sidebar Footer with Collapse Toggle */}
            <SidebarFooter>
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <span className="text-[11px] font-medium text-muted-foreground px-2">
                            Collapse Sidebar
                        </span>
                    )}
                    <SidebarTrigger className={collapsed ? 'mx-auto' : ''} />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};
