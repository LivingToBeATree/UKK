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
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon,
    Laptop,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import { useTheme } from '@/hooks/useTheme';
import { useColorTheme, type ColorTheme } from '@/hooks/useColorTheme';
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
            className={`relative flex items-center gap-3 rounded-xl transition-all duration-150 group cursor-pointer focus:outline-none ${
                isCollapsed
                    ? 'justify-center h-10 w-10 sm:h-11 sm:w-11'
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
    const { theme, setTheme } = useTheme();
    const { colorTheme, setColorTheme } = useColorTheme();
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
            className={`fixed left-0 top-0 bottom-0 z-50 bg-card/90 backdrop-blur-xl border-r border-border/70 flex flex-col justify-between py-3.5 select-none transition-all duration-300 ease-in-out ${
                collapsed ? 'w-16 items-center px-2' : 'w-64 items-stretch px-3'
            }`}
        >
            {/* TOP GROUP: Logo, Toggle & Navigation Links */}
            <div className="flex flex-col items-center gap-1.5 w-full">
                {/* 1. Header with Logo and Expand/Collapse Toggle */}
                <div className={`flex items-center w-full mb-3 ${collapsed ? 'justify-center' : 'justify-between px-1'}`}>
                    <Link to="/" className="flex items-center gap-2.5 group p-1 rounded-xl hover:bg-secondary/60 transition-transform hover:scale-105" title="Comme Home">
                        <img src="/favicon.svg" alt="Comme" className="h-7 w-7 object-contain shrink-0" />
                        {!collapsed && (
                            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                COMME
                            </span>
                        )}
                    </Link>

                    {/* Expand/Collapse Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
                        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                        aria-label="Toggle Sidebar"
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                </div>

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

            {/* BOTTOM GROUP: Settings & User Avatar (Theme switchers moved inside) */}
            <div className="flex flex-col items-center gap-2 w-full pt-2 border-t border-border/60">
                {/* 1. Settings & Appearance Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={`flex items-center gap-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all cursor-pointer focus:outline-none ${
                                collapsed
                                    ? 'justify-center h-10 w-10'
                                    : 'w-full px-3 py-2.5 h-11'
                            }`}
                            title="Appearance & Settings"
                        >
                            <Settings className="h-5 w-5 shrink-0" />
                            {!collapsed && (
                                <span className="text-xs font-semibold truncate text-foreground/90">
                                    Settings & Appearance
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-60 bg-card border border-border shadow-xl rounded-xl p-2 space-y-2 ml-2">
                        {/* Display Mode */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">Display Mode</p>
                            <div className="grid grid-cols-3 gap-1 bg-secondary/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex items-center justify-center py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        theme === 'light' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Sun className="h-3.5 w-3.5 mr-1" /> Light
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex items-center justify-center py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        theme === 'dark' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Moon className="h-3.5 w-3.5 mr-1" /> Dark
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`flex items-center justify-center py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        theme === 'system' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Laptop className="h-3.5 w-3.5 mr-1" /> Auto
                                </button>
                            </div>
                        </div>

                        {/* Accent Theme */}
                        <div className="border-t border-border/80 pt-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">Accent Theme</p>
                            <div className="grid grid-cols-3 gap-1 px-1">
                                {(
                                    [
                                        { id: 'purple', label: 'Purple', bg: 'bg-[#a802f5]' },
                                        { id: 'teal', label: 'Teal', bg: 'bg-[#02f5a8]' },
                                        { id: 'orange', label: 'Orange', bg: 'bg-[#f5aa02]' },
                                    ] as const
                                ).map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setColorTheme(t.id as ColorTheme)}
                                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                            colorTheme === t.id
                                                ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/40'
                                                : 'border-border/60 hover:bg-secondary/60 text-muted-foreground'
                                        }`}
                                    >
                                        <span className={`h-2 w-2 rounded-full ${t.bg}`} />
                                        <span>{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => navigate('/settings')}>
                            <Settings className="h-3.5 w-3.5 mr-2" />
                            <span>Account Settings</span>
                        </DropdownMenuItem>

                        {import.meta.env.DEV && (
                            <DropdownMenuItem onClick={() => navigate('/dev')}>
                                <Terminal className="h-3.5 w-3.5 mr-2 text-purple-400" />
                                <span>Developer Console</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* 2. User Avatar & Menu Dropdown */}
                {isAuthenticated && user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`flex items-center gap-2.5 rounded-xl hover:bg-secondary/60 transition-all focus:outline-none cursor-pointer ${
                                    collapsed ? 'justify-center h-10 w-10' : 'w-full px-2 py-1.5'
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

                            <DropdownMenuItem onClick={() => navigate('/commissions')}>
                                <Bookmark className="h-4 w-4 mr-2 text-blue-400" />
                                <span>My Commissions</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem destructive onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`flex items-center gap-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all cursor-pointer focus:outline-none ${
                                    collapsed ? 'justify-center h-10 w-10' : 'w-full px-3 py-2 h-10'
                                }`}
                                title="Account & Sign In"
                            >
                                <UserIcon className="h-5 w-5 shrink-0" />
                                {!collapsed && (
                                    <span className="text-xs font-semibold text-foreground/90">
                                        Sign In / Register
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 bg-card border border-border shadow-xl rounded-xl ml-2">
                            <div className="px-3 py-1.5 text-xs font-bold text-muted-foreground border-b border-border/80">
                                Guest Visitor
                            </div>
                            <DropdownMenuItem onClick={() => navigate('/login')}>
                                Sign In
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/register')}>
                                Create Account
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </aside>
    );
};
