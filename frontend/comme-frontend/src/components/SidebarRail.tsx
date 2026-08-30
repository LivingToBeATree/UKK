import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Image as GalleryIcon,
    PenTool,
    Compass,
    FolderKanban,
    Layers,
    Bookmark,
    User as UserIcon,
    Settings,
    LogOut,
    Shield,
    Sparkles,
    Terminal,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import { Avatar } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { toast } from './ui/sonner';

interface RailItemProps {
    icon: React.ElementType;
    label: string;
    path?: string;
    isActive?: boolean;
    isCollapsed: boolean;
    onClick?: () => void;
}

const RailItem: React.FC<RailItemProps> = ({
    icon: Icon,
    label,
    path,
    isActive,
    isCollapsed,
    onClick,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const buttonElement = (
        <button
            onClick={onClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`relative flex items-center gap-3.5 rounded-xl transition-all duration-150 group cursor-pointer focus:outline-none ${
                isCollapsed
                    ? 'justify-center h-11 w-11'
                    : 'w-full px-3 py-2.5 h-11'
            } ${
                isActive
                    ? 'bg-secondary text-foreground font-semibold shadow-xs ring-1 ring-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
            aria-label={label}
        >
            <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
            
            {/* Expanded Label */}
            {!isCollapsed && (
                <span className="text-xs font-semibold truncate tracking-tight text-foreground/90">
                    {label}
                </span>
            )}

            {/* Floating Tooltip (Only when collapsed) */}
            {isCollapsed && showTooltip && (
                <div className="absolute left-14 z-50 px-2.5 py-1 text-xs font-semibold text-foreground bg-card border border-border/80 rounded-lg shadow-lg whitespace-nowrap pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                    {label}
                </div>
            )}
        </button>
    );

    if (path) {
        return (
            <Link to={path} className={`focus:outline-none ${isCollapsed ? '' : 'w-full'}`}>
                {buttonElement}
            </Link>
        );
    }

    return buttonElement;
};

export const SidebarRail: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { collapsed, toggleSidebar } = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Signed out successfully');
            navigate('/login');
        } catch {
            toast.error('Failed to sign out');
        }
    };

    return (
        <aside
            className={`fixed left-0 top-0 bottom-0 z-50 bg-card/90 backdrop-blur-xl border-r border-border/70 flex flex-col justify-between py-3 select-none transition-all duration-300 ease-in-out ${
                collapsed ? 'w-16 items-center px-2' : 'w-60 items-stretch px-3'
            }`}
        >
            {/* TOP GROUP: Logo (Clicking toggles expand/collapse) & Navigation Links */}
            <div className="flex flex-col items-center gap-1.5 w-full">
                {/* 1. Official Comme Logo Header (No '>', Whole header toggles expand/collapse) */}
                <button
                    onClick={toggleSidebar}
                    className={`flex items-center gap-3 w-full mb-2 p-1.5 rounded-xl hover:bg-secondary/60 transition-all cursor-pointer group focus:outline-none ${
                        collapsed ? 'justify-center' : 'justify-start px-2'
                    }`}
                    title={collapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
                    aria-label="Toggle Sidebar"
                >
                    <img
                        src="/Comme_Emblem.svg"
                        alt="Comme"
                        className="h-8 w-8 object-contain shrink-0 transition-transform group-hover:scale-105"
                    />
                    {!collapsed && (
                        <div className="flex flex-col text-left">
                            <span className="font-extrabold text-sm tracking-tight text-foreground">
                                COMME
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium">
                                Art & Commissions
                            </span>
                        </div>
                    )}
                </button>

                {/* 2. Gallery / Feed */}
                <RailItem
                    icon={GalleryIcon}
                    label="Art Feed & Showcase"
                    path="/"
                    isActive={location.pathname === '/'}
                    isCollapsed={collapsed}
                />

                {/* 3. Studio / Creator Hub */}
                <RailItem
                    icon={PenTool}
                    label={user?.artist_profile ? 'Artist Studio' : 'Become an Artist'}
                    path={user?.artist_profile ? '/dashboard' : '/apply-artist'}
                    isActive={location.pathname.startsWith('/dashboard') || location.pathname === '/apply-artist'}
                    isCollapsed={collapsed}
                />

                {/* Divider */}
                <div className={`${collapsed ? 'w-6' : 'w-full'} h-[1px] bg-border/80 my-1`} />

                {/* 4. Explore */}
                <RailItem
                    icon={Compass}
                    label="Explore Artwork"
                    path="/explore"
                    isActive={location.pathname === '/explore'}
                    isCollapsed={collapsed}
                />

                {/* 5. Store / Commission Services */}
                <RailItem
                    icon={FolderKanban}
                    label="Commission Store"
                    path="/store"
                    isActive={location.pathname === '/store'}
                    isCollapsed={collapsed}
                />

                {/* 6. Artists Directory */}
                <RailItem
                    icon={Layers}
                    label="Artists Directory"
                    path="/artists"
                    isActive={location.pathname === '/artists'}
                    isCollapsed={collapsed}
                />

                {/* Divider */}
                <div className={`${collapsed ? 'w-6' : 'w-full'} h-[1px] bg-border/80 my-1`} />

                {/* 7. My Commissions / Orders */}
                <RailItem
                    icon={Bookmark}
                    label="My Commissions"
                    path="/commissions"
                    isActive={location.pathname.startsWith('/commissions')}
                    isCollapsed={collapsed}
                />
            </div>

            {/* BOTTOM GROUP: Settings & User Profile Avatar */}
            <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t border-border/60">
                {/* 1. Settings (Direct link to Settings page with Appearance, Security, Profile tabs) */}
                <RailItem
                    icon={Settings}
                    label="Settings & Appearance"
                    path="/settings"
                    isActive={location.pathname === '/settings'}
                    isCollapsed={collapsed}
                />

                {/* 2. User Avatar & Menu */}
                {isAuthenticated && user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`flex items-center gap-2.5 rounded-xl hover:bg-secondary/60 transition-all focus:outline-none cursor-pointer ${
                                    collapsed ? 'justify-center h-11 w-11' : 'w-full px-2 py-1.5'
                                }`}
                                title={user.display_name || user.username}
                            >
                                <Avatar
                                    size="sm"
                                    fallback={user.display_name || user.username}
                                    src={user.avatar_url}
                                    isOnline={true}
                                />
                                {!collapsed && (
                                    <div className="flex flex-col min-w-0 flex-1 text-left">
                                        <p className="font-bold text-xs truncate text-foreground leading-tight">
                                            {user.display_name || user.username}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            @{user.username}
                                        </p>
                                    </div>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-card border border-border shadow-xl rounded-xl ml-2">
                            <div className="px-3 py-2 border-b border-border mb-1">
                                <p className="font-bold text-xs truncate text-foreground">
                                    {user.display_name || user.username}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    @{user.username}
                                </p>
                            </div>

                            <DropdownMenuItem onClick={() => navigate(`/@${user.username}`)}>
                                <UserIcon className="h-4 w-4 mr-2 text-primary" />
                                <span>My Profile</span>
                            </DropdownMenuItem>

                            {user.artist_profile ? (
                                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                                    <PenTool className="h-4 w-4 mr-2 text-emerald-400" />
                                    <span>Artist Studio</span>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => navigate('/apply-artist')}>
                                    <Sparkles className="h-4 w-4 mr-2 text-amber-400" />
                                    <span>Become an Artist</span>
                                </DropdownMenuItem>
                            )}

                            {(user.role === 'admin' || user.role === 'moderator') && (
                                <DropdownMenuItem onClick={() => navigate('/admin')}>
                                    <Shield className="h-4 w-4 mr-2 text-amber-400" />
                                    <span>Staff Admin Panel</span>
                                </DropdownMenuItem>
                            )}

                            {import.meta.env.DEV && (
                                <DropdownMenuItem onClick={() => navigate('/dev')}>
                                    <Terminal className="h-4 w-4 mr-2 text-purple-400" />
                                    <span>Developer Console</span>
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem onClick={() => navigate('/settings')}>
                                <Settings className="h-4 w-4 mr-2" />
                                <span>Settings</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem destructive onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <RailItem
                        icon={UserIcon}
                        label="Sign In / Register"
                        path="/login"
                        isActive={location.pathname === '/login'}
                        isCollapsed={collapsed}
                    />
                )}
            </div>
        </aside>
    );
};
