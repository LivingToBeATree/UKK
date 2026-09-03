import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Users,
    Search,
    Shield,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Lock,
    Palette,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { adminApi, type AdminUserItem } from '@/services/adminService';
import { formatDateSafe } from '@/utils/format';
import { toast } from '@/components/ui/sonner';

const roleFilters = [
    { label: 'All Users', value: 'all' },
    { label: 'Artists', value: 'artist' },
    { label: 'Moderators', value: 'moderator' },
    { label: 'Admins', value: 'admin' },
    { label: 'Regular Users', value: 'user' },
];

export const UserManagementPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<AdminUserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Guard: Only admins
    if (currentUser?.role === 'moderator') {
        return <Navigate to="/admin/applications" replace />;
    }

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers({
                search: search.trim() || undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                page,
            });
            setUsers(res.data);
            if (res.meta) {
                setTotalPages(res.meta.last_page);
                setTotalUsers(res.meta.total);
            }
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleRoleChange = async (targetUser: AdminUserItem, newRole: 'user' | 'moderator' | 'admin') => {
        if (targetUser.id === currentUser?.id && newRole !== 'admin') {
            toast.error('You cannot demote your own administrator account');
            return;
        }

        const confirmMsg = `Are you sure you want to change @${targetUser.username}'s role to [${newRole.toUpperCase()}]?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await adminApi.updateUserRole(targetUser.id, newRole);
            setUsers((prev) =>
                prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
            );
            toast.success(`Updated @${targetUser.username} role to ${newRole}`);
        } catch {
            toast.error('Failed to update user role');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2.5">
                        <Users className="h-6 w-6 text-primary" /> User Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        View, search, and assign staff privileges to platform accounts ({totalUsers} total)
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers()}
                    className="rounded-xl gap-2 font-medium"
                >
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by username, display name, or email..."
                        className="pl-10 h-10 rounded-xl"
                    />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {roleFilters.map((tab) => (
                        <Button
                            key={tab.value}
                            variant={roleFilter === tab.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                setRoleFilter(tab.value);
                                setPage(1);
                            }}
                            className="rounded-xl text-xs whitespace-nowrap h-9 font-medium"
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* User Table Card */}
            <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/40 border-b border-border text-muted-foreground font-mono uppercase text-[10px]">
                            <tr>
                                <th className="p-4 pl-6">User / Account</th>
                                <th className="p-4">System Role</th>
                                <th className="p-4">Creator Status</th>
                                <th className="p-4">Security</th>
                                <th className="p-4">Activity</th>
                                <th className="p-4">Joined Date</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="p-4">
                                            <Skeleton className="h-10 w-full rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-muted-foreground">
                                        <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                                        No users found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const isSelf = u.id === currentUser?.id;
                                    return (
                                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                                            {/* User Info */}
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        size="sm"
                                                        fallback={u.display_name || u.username}
                                                        src={u.avatar_url || undefined}
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-bold text-foreground truncate">{u.display_name}</p>
                                                            {isSelf && (
                                                                <Badge variant="secondary" className="text-[9px] px-1 py-0 font-mono">
                                                                    You
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-muted-foreground text-[11px] font-mono">@{u.username}</p>
                                                        <p className="text-muted-foreground text-[11px] truncate max-w-[180px]">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* System Role */}
                                            <td className="p-4">
                                                <Badge
                                                    variant={
                                                        u.role === 'admin'
                                                            ? 'rose'
                                                            : u.role === 'moderator'
                                                            ? 'purple'
                                                            : 'secondary'
                                                    }
                                                    className="text-[10px] uppercase font-mono font-bold"
                                                >
                                                    {u.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                                                    {u.role === 'moderator' && <ShieldCheck className="h-3 w-3 mr-1" />}
                                                    {u.role}
                                                </Badge>
                                            </td>

                                            {/* Creator Status */}
                                            <td className="p-4">
                                                {u.is_artist ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge variant="gold" className="text-[10px] uppercase font-mono font-bold">
                                                            <Palette className="h-3 w-3 mr-1" /> Artist
                                                        </Badge>
                                                        {u.commission_open && (
                                                            <span className="h-2 w-2 rounded-full bg-emerald-400" title="Commissions Open" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </td>

                                            {/* Security */}
                                            <td className="p-4 space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    {u.email_verified ? (
                                                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                                                            <CheckCircle2 className="h-3 w-3" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                                            <XCircle className="h-3 w-3" /> Unverified
                                                        </span>
                                                    )}
                                                </div>
                                                {u.two_factor_enabled && (
                                                    <Badge variant="teal" className="text-[9px] px-1 py-0 font-mono">
                                                        <Lock className="h-2.5 w-2.5 mr-0.5" /> 2FA
                                                    </Badge>
                                                )}
                                            </td>

                                            {/* Activity */}
                                            <td className="p-4 text-[11px] text-muted-foreground font-mono space-y-0.5">
                                                <p>{u.commissions_count} orders</p>
                                                <p>{u.posts_count} posts</p>
                                            </td>

                                            {/* Joined */}
                                            <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">
                                                {formatDateSafe(u.created_at)}
                                            </td>

                                            {/* Action Menu */}
                                            <td className="p-4 pr-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                        <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground font-mono">
                                                            Manage @{u.username}
                                                        </div>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            disabled={u.role === 'user' || isSelf}
                                                            onClick={() => handleRoleChange(u, 'user')}
                                                            className="text-xs"
                                                        >
                                                            <Users className="h-3.5 w-3.5 mr-2" /> Set as User
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            disabled={u.role === 'moderator' || isSelf}
                                                            onClick={() => handleRoleChange(u, 'moderator')}
                                                            className="text-xs text-indigo-400 font-semibold"
                                                        >
                                                            <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Set as Moderator
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            disabled={u.role === 'admin'}
                                                            onClick={() => handleRoleChange(u, 'admin')}
                                                            className="text-xs text-rose-400 font-semibold"
                                                        >
                                                            <Shield className="h-3.5 w-3.5 mr-2" /> Promote to Admin
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between text-xs">
                        <p className="text-muted-foreground">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                                className="rounded-xl h-8"
                            >
                                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                                className="rounded-xl h-8"
                            >
                                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </motion.div>
    );
};
