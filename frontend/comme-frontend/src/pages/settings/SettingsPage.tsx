import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    User,
    Lock,
    Smartphone,
    Palette,
    Sun,
    Moon,
    Laptop,
    Check,
    CreditCard,
    Building2,
    Trash2,
    ShieldCheck,
    Bell,
    AlertTriangle,
    LogOut,
    CheckCircle2,
    RefreshCw,
    Shield,
    Pipette,
    Sparkles,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { userService } from '@/services/userService';
import { payoutAccountApi } from '@/services/commissionService';
import { twoFactorService } from '@/services/twoFactorService';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useColorTheme, type ColorTheme } from '@/hooks/useColorTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { TwoFactorSetupModal } from '@/components/auth/TwoFactorSetupModal';
import { TwoFactorRecoveryModal } from '@/components/auth/TwoFactorRecoveryModal';
import { CustomColorPicker } from '@/components/ui/color-picker';
import type { ArtistPayoutAccount } from '@/types';

interface ActiveSession {
    id: string;
    ip_address: string | null;
    user_agent: string | null;
    last_activity: string;
    is_current: boolean;
}

function parseUserAgent(ua: string | null): { browser: string; os: string; isMobile: boolean } {
    if (!ua) return { browser: 'Web Browser', os: 'Desktop', isMobile: false };
    let browser = 'Web Browser';
    let os = 'Desktop';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';

    if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
    else if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    return { browser, os, isMobile };
}

export const SettingsPage: React.FC = () => {
    const { user, refreshUser, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { colorTheme, setColorTheme, customColor, setCustomColor } = useColorTheme();
    const [tempHex, setTempHex] = useState(customColor || '#A802F5');
    const [activeTab, setActiveTab] = useState<'account' | 'security' | 'appearance' | 'payouts' | 'notifications' | 'privacy'>('account');
    const [savingAccount, setSavingAccount] = useState(false);

    useEffect(() => {
        if (customColor) {
            setTempHex(customColor);
        }
    }, [customColor]);

    // Active Sessions State
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    // Payout Account State
    const [payoutAccount, setPayoutAccount] = useState<ArtistPayoutAccount | null>(null);
    const [loadingPayout, setLoadingPayout] = useState(false);
    const [savingPayout, setSavingPayout] = useState(false);
    const [bankName, setBankName] = useState('BCA');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    // Notification Toggles
    const [notifOrders, setNotifOrders] = useState(true);
    const [notifMessages, setNotifMessages] = useState(true);
    const [notifComments, setNotifComments] = useState(true);
    const [notifFollows, setNotifFollows] = useState(false);

    // 2FA Modals State
    const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
    const [is2FARecoveryOpen, setIs2FARecoveryOpen] = useState(false);
    const [disabling2FA, setDisabling2FA] = useState(false);

    // Account Deletion State
    const [deletePassword, setDeletePassword] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);

    const { register: regAccount, handleSubmit: handleAccount } = useForm({
        defaultValues: {
            username: user?.username || '',
            display_name: user?.display_name || '',
            bio: user?.bio || '',
        },
    });

    const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword } = useForm({
        defaultValues: { current_password: '', password: '', password_confirmation: '' },
    });

    const fetchSessions = async () => {
        setLoadingSessions(true);
        try {
            const data = await userService.getSessions();
            setSessions(data);
        } catch {
            // Non-critical
        } finally {
            setLoadingSessions(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        if (user?.artist_profile) {
            setLoadingPayout(true);
            payoutAccountApi.get()
                .then((acc) => {
                    setPayoutAccount(acc);
                    if (acc) {
                        setBankName(acc.bank_name);
                        setAccountName(acc.bank_account_name);
                    }
                })
                .catch(() => {})
                .finally(() => setLoadingPayout(false));
        }
    }, [user]);

    const onAccountSubmit = async (data: { username: string; display_name: string; bio: string }) => {
        setSavingAccount(true);
        try {
            const formData = new FormData();
            formData.append('username', data.username.trim());
            formData.append('display_name', data.display_name.trim());
            formData.append('bio', data.bio.trim());
            await userService.updateProfile(formData);
            await refreshUser();
            toast.success('Account information updated successfully!');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update account information';
            toast.error(message);
        } finally {
            setSavingAccount(false);
        }
    };

    const onPasswordSubmit = async (data: { current_password: string; password: string; password_confirmation: string }) => {
        try {
            await userService.changePassword(data);
            toast.success('Password changed successfully! A security confirmation was dispatched.');
            resetPassword();
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password. Verify your current password.';
            toast.error(message);
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        setRevokingId(sessionId);
        try {
            await userService.revokeSession(sessionId);
            toast.success('Session revoked successfully.');
            await fetchSessions();
        } catch {
            toast.error('Failed to revoke session.');
        } finally {
            setRevokingId(null);
        }
    };

    const handleLogoutAllOtherDevices = async () => {
        const password = prompt('Enter your password to log out all other active sessions:');
        if (!password) return;
        try {
            await userService.logoutOtherDevices(password);
            toast.success('Logged out of all other devices.');
            await fetchSessions();
        } catch {
            toast.error('Failed to log out devices. Verify your password.');
        }
    };

    const handleDisable2FA = async () => {
        const password = prompt('Enter your current password to disable Two-Factor Authentication:');
        if (!password) return;
        setDisabling2FA(true);
        try {
            await twoFactorService.disable(password);
            await refreshUser();
            toast.success('Two-factor authentication has been disabled.');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to disable 2FA. Verify your password.';
            toast.error(message);
        } finally {
            setDisabling2FA(false);
        }
    };

    const handleSavePayout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountName.trim() || !accountNumber.trim()) {
            toast.error('Please fill in both account holder name and account number');
            return;
        }
        setSavingPayout(true);
        try {
            const saved = await payoutAccountApi.update({
                bank_name: bankName,
                bank_account_name: accountName.trim(),
                bank_account_number: accountNumber.trim(),
            });
            setPayoutAccount(saved);
            setAccountNumber('');
            toast.success('Payout account saved! Earnings will automatically disburse here upon completed orders.');
        } catch {
            toast.error('Failed to save payout account');
        } finally {
            setSavingPayout(false);
        }
    };

    const handleDeletePayout = async () => {
        if (!confirm('Are you sure you want to remove your payout account? Automatic disbursements will be held until a new bank account is configured.')) return;
        setSavingPayout(true);
        try {
            await payoutAccountApi.delete();
            setPayoutAccount(null);
            setAccountName('');
            setAccountNumber('');
            toast.success('Payout account removed');
        } catch {
            toast.error('Failed to remove payout account');
        } finally {
            setSavingPayout(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deletePassword) {
            toast.error('Please enter your password to confirm account deletion.');
            return;
        }
        if (!confirm('Are you absolutely sure you want to permanently delete your account? This action cannot be undone.')) return;

        setDeletingAccount(true);
        try {
            await userService.deleteAccount(deletePassword);
            toast.success('Your account has been deleted in compliance with data privacy regulations.');
            await logout();
            window.location.href = '/';
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete account. Please verify your password.';
            toast.error(message);
        } finally {
            setDeletingAccount(false);
        }
    };

    const navItems = [
        { id: 'account', label: 'Account Information', icon: User, desc: 'Administrative identity & public handle' },
        { id: 'security', label: 'Security & 2FA', icon: Lock, desc: 'Password, two-factor auth & devices' },
        { id: 'appearance', label: 'Appearance & Theme', icon: Palette, desc: 'Display theme & brand accent color' },
        ...(user?.artist_profile ? [
            { id: 'payouts', label: 'Artist Payout Account', icon: CreditCard, desc: 'Bank & e-wallet disbursement' }
        ] : []),
        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email alerts & communications' },
        { id: 'privacy', label: 'Danger Zone', icon: AlertTriangle, desc: 'UU PDP Data erasure & account closure', isDestructive: true },
    ];

    const getTabMeta = () => {
        switch (activeTab) {
            case 'account':
                return { title: 'Account Information', desc: 'Manage your administrative credentials, email verification status, handle, and public artist statement.' };
            case 'security':
                return { title: 'Security & Authentication', desc: 'Protect your account with high-entropy passwords, 2FA TOTP apps, and device session monitoring.' };
            case 'appearance':
                return { title: 'Appearance & Theme', desc: 'Customize your interface appearance with light/dark modes and curated brand highlight accent colors.' };
            case 'payouts':
                return { title: 'Artist Payout Configuration', desc: 'Set up your Indonesian bank account or e-wallet for automated commission escrow payouts via Midtrans Iris.' };
            case 'notifications':
                return { title: 'Notification Preferences', desc: 'Configure which events trigger real-time and transactional email dispatches.' };
            case 'privacy':
                return { title: 'Danger Zone & Privacy Erasure', desc: 'Exercise your legal rights under Indonesian UU PDP (UU No. 27/2022) to permanently erase account data.' };
            default:
                return { title: 'Settings', desc: 'Manage your preferences.' };
        }
    };

    const tabMeta = getTabMeta();

    return (
        <div className="flex-1 h-screen overflow-hidden flex flex-col md:flex-row bg-background text-foreground">
            
            {/* ── Left Fixed Settings Sidebar (Constant on Screen) ── */}
            <aside className="w-full md:w-80 lg:w-88 shrink-0 border-r border-border/70 bg-card/30 flex flex-col justify-between h-full md:h-screen p-6 lg:p-7 overflow-y-auto select-none">
                <div className="space-y-7">
                    {/* User Identity Card */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/90 shadow-sm space-y-3.5">
                        <div className="flex items-center gap-3.5">
                            <Avatar size="lg" fallback={user?.display_name || user?.username || '?'} src={user?.avatar_url} />
                            <div className="overflow-hidden min-w-0">
                                <p className="font-bold text-base text-foreground truncate">{user?.display_name || user?.username}</p>
                                <p className="text-xs text-muted-foreground truncate font-medium">@{user?.username}</p>
                            </div>
                        </div>
                        <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">Account Role</span>
                            <span className="font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20 text-[11px]">
                                {user?.artist_profile ? 'Artist' : user?.role || 'User'}
                            </span>
                        </div>
                    </div>

                    {/* Section Label */}
                    <div className="space-y-1.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
                            Preferences &amp; Security
                        </p>
                        {/* Navigation Links */}
                        <nav className="flex flex-col space-y-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveTab(item.id as typeof activeTab)}
                                        className={`w-full text-left transition-all py-3.5 px-4 rounded-xl flex items-center justify-between group cursor-pointer ${
                                            isActive
                                                ? item.isDestructive
                                                    ? 'bg-rose-500/15 text-rose-400 font-bold ring-1 ring-rose-500/30 shadow-xs'
                                                    : 'bg-primary/10 text-primary font-bold ring-1 ring-primary/20 shadow-xs'
                                                : item.isDestructive
                                                    ? 'text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <Icon className={`h-5 w-5 shrink-0 ${
                                                isActive
                                                    ? item.isDestructive ? 'text-rose-400' : 'text-primary'
                                                    : item.isDestructive ? 'text-rose-400/80' : 'text-muted-foreground group-hover:text-foreground'
                                            }`} />
                                            <span className="text-sm font-semibold">{item.label}</span>
                                        </div>
                                        {isActive && (
                                            <span className={`h-2 w-2 rounded-full shrink-0 ${item.isDestructive ? 'bg-rose-400' : 'bg-primary'}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Footer Security Badge */}
                <div className="pt-6 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-2.5">
                    <Shield className="h-4 w-4 text-primary shrink-0" />
                    <span>Encrypted &amp; Protected by Comme Core</span>
                </div>
            </aside>

            {/* ── Right Content Area (Independently Scrollable) ── */}
            <main className="flex-1 min-w-0 h-full md:h-screen p-6 sm:p-10 lg:p-14 overflow-y-auto">
                <div className="max-w-6xl">
                    {/* Active Section Header */}
                <div className="mb-8 space-y-2 border-b border-border/60 pb-6">
                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                        {tabMeta.title}
                    </h1>
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                        {tabMeta.desc}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {/* ── 1. Account Information Tab ── */}
                    {activeTab === 'account' && (
                        <motion.div
                            key="account"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-8"
                        >
                            <Card className="shadow-sm">
                                <CardHeader className="p-6 sm:p-8 pb-4">
                                    <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-2.5">
                                        <User className="h-5 w-5 text-primary" /> Profile Presentation &amp; Email
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Your primary administrative credentials and public creator identity.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
                                    <form onSubmit={handleAccount(onAccountSubmit)} className="space-y-6">
                                        {/* Registered Email */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="email" className="text-sm font-semibold text-foreground/90">
                                                    Registered Email Address
                                                </Label>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                                                </span>
                                            </div>
                                            <Input
                                                id="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="h-12 rounded-xl bg-muted/60 text-muted-foreground border-border/60 cursor-not-allowed font-mono text-sm px-4"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Email changes require identity verification. Contact staff support if you need to update your email.
                                            </p>
                                        </div>

                                        {/* 2-Column Row for Username & Display Name */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="username" className="text-sm font-semibold text-foreground/90">
                                                    Username <span className="text-muted-foreground font-normal">(@handle)</span>
                                                </Label>
                                                <Input
                                                    id="username"
                                                    className="h-12 rounded-xl bg-card border-border/80 focus-visible:ring-primary font-mono text-sm px-4"
                                                    {...regAccount('username')}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="display_name" className="text-sm font-semibold text-foreground/90">
                                                    Display Name
                                                </Label>
                                                <Input
                                                    id="display_name"
                                                    className="h-12 rounded-xl bg-card border-border/80 focus-visible:ring-primary text-sm px-4"
                                                    {...regAccount('display_name')}
                                                />
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        <div className="space-y-2">
                                            <Label htmlFor="bio" className="text-sm font-semibold text-foreground/90">
                                                Bio &amp; Artist Statement
                                            </Label>
                                            <Textarea
                                                id="bio"
                                                rows={5}
                                                placeholder="Tell the community about your craft, aesthetic style, or background..."
                                                className="rounded-xl bg-card border-border/80 focus-visible:ring-primary text-sm p-4 leading-relaxed"
                                                {...regAccount('bio')}
                                            />
                                        </div>

                                        <Button type="submit" disabled={savingAccount} className="h-12 px-8 text-sm font-bold shadow-md cursor-pointer">
                                            {savingAccount ? 'Saving Changes...' : 'Save Account Info'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── 2. Security & 2FA Tab ── */}
                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-8"
                        >
                            {/* Change Password Card */}
                            <Card className="shadow-sm">
                                <CardHeader className="p-6 sm:p-8 pb-4">
                                    <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-2.5">
                                        <Lock className="h-5 w-5 text-primary" /> Password Authentication
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Ensure your account is using a strong, unique password.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
                                    <form onSubmit={handlePassword(onPasswordSubmit)} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="current_password" className="text-sm font-semibold">Current Password</Label>
                                                <Input
                                                    id="current_password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="h-12 rounded-xl bg-card border-border/80 px-4"
                                                    {...regPassword('current_password')}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new_password" className="text-sm font-semibold">New Password (min. 8)</Label>
                                                <Input
                                                    id="new_password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="h-12 rounded-xl bg-card border-border/80 px-4"
                                                    {...regPassword('password')}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm_password" className="text-sm font-semibold">Confirm New Password</Label>
                                                <Input
                                                    id="confirm_password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="h-12 rounded-xl bg-card border-border/80 px-4"
                                                    {...regPassword('password_confirmation')}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" className="h-12 px-8 text-sm font-bold shadow-md cursor-pointer">
                                            Update Password
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* 2FA Interactive Card */}
                            <Card className={`shadow-sm ${user?.two_factor_enabled ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/70 bg-card'}`}>
                                <CardHeader className="p-6 sm:p-8 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-2.5">
                                            <ShieldCheck className={`h-5 w-5 ${user?.two_factor_enabled ? 'text-emerald-400' : 'text-primary'}`} />
                                            Two-Factor Authentication (2FA TOTP)
                                        </CardTitle>
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                                            user?.two_factor_enabled
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                : 'bg-secondary text-muted-foreground border-border'
                                        }`}>
                                            {user?.two_factor_enabled ? 'ENABLED & ACTIVE' : 'DISABLED'}
                                        </span>
                                    </div>
                                    <CardDescription className="text-sm mt-1">
                                        {user?.two_factor_enabled
                                            ? 'Your account is protected with a Time-based One-Time Password (TOTP) authenticator app.'
                                            : 'Add an extra layer of security to your account by requiring a 6-digit code from Google Authenticator, Authy, or Apple Passwords when signing in.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 pt-2">
                                    {user?.two_factor_enabled ? (
                                        <div className="flex items-center gap-3.5">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIs2FARecoveryOpen(true)}
                                                className="h-11 px-5 text-xs font-semibold cursor-pointer"
                                            >
                                                View Recovery Codes
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={handleDisable2FA}
                                                disabled={disabling2FA}
                                                className="h-11 px-5 text-xs text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                            >
                                                {disabling2FA ? 'Disabling...' : 'Disable 2FA'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => setIs2FASetupOpen(true)}
                                            className="h-12 px-7 text-sm font-bold shadow-md gap-2 cursor-pointer"
                                        >
                                            <ShieldCheck className="h-5 w-5" />
                                            Set Up Two-Factor Authentication
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Active Sessions & Devices Card */}
                            <Card className="shadow-sm">
                                <CardHeader className="p-6 sm:p-8 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-2.5">
                                                <Smartphone className="h-5 w-5 text-primary" /> Active Sessions &amp; Devices
                                            </CardTitle>
                                            <CardDescription className="text-sm mt-1">
                                                Devices and browsers currently authenticated to your account.
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={fetchSessions}
                                            disabled={loadingSessions}
                                            className="text-xs gap-1.5 h-10 px-4 cursor-pointer"
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 ${loadingSessions ? 'animate-spin' : ''}`} /> Refresh
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 pt-2 space-y-4">
                                    {sessions.length === 0 ? (
                                        <p className="text-sm text-muted-foreground py-3">No active sessions tracked.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {sessions.map((s) => {
                                                const { browser, os, isMobile } = parseUserAgent(s.user_agent);

                                                return (
                                                    <div
                                                        key={s.id}
                                                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                                                            s.is_current
                                                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                                                : 'border-border/70 bg-card hover:bg-secondary/40'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-foreground shrink-0">
                                                                {isMobile ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2.5">
                                                                    <span className="font-semibold text-sm text-foreground">
                                                                        {browser} on {os}
                                                                    </span>
                                                                    {s.is_current && (
                                                                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                                                                            Current Device
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    IP: <span className="font-mono">{s.ip_address || '127.0.0.1'}</span> • Last active: {s.last_activity}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {!s.is_current && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRevokeSession(s.id)}
                                                                disabled={revokingId === s.id}
                                                                className="text-xs text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                                            >
                                                                {revokingId === s.id ? 'Revoking...' : 'Revoke'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-border/60">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleLogoutAllOtherDevices}
                                            className="h-10 px-4 text-xs font-bold gap-1.5 cursor-pointer"
                                        >
                                            <LogOut className="h-4 w-4" /> Log Out All Other Devices
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── 3. Appearance & Theme Tab ── */}
                    {activeTab === 'appearance' && (
                        <motion.div
                            key="appearance"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-8"
                        >
                            <Card className="shadow-sm">
                                <CardHeader className="p-6 sm:p-8 pb-4">
                                    <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-2.5">
                                        <Sun className="h-5 w-5 text-primary" /> Display Theme Mode
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Choose between light, dark, or automatic system theme.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 pt-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        {[
                                            { key: 'light', label: 'Light Mode', desc: 'Clean, crisp white canvas', icon: Sun },
                                            { key: 'dark', label: 'Dark Mode', desc: 'Deep black for rich focus', icon: Moon },
                                            { key: 'system', label: 'System Default', desc: 'Syncs with your OS setting', icon: Laptop },
                                        ].map((mode) => {
                                            const Icon = mode.icon;
                                            const isActive = theme === mode.key;
                                            return (
                                                <button
                                                    key={mode.key}
                                                    type="button"
                                                    onClick={() => setTheme(mode.key as 'light' | 'dark' | 'system')}
                                                    className={`flex flex-col items-start p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                                                        isActive
                                                            ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/40 shadow-xs'
                                                            : 'border-border hover:bg-secondary/60 text-muted-foreground'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between w-full mb-4">
                                                        <Icon className={`h-8 w-8 ${isActive ? 'text-primary' : ''}`} />
                                                        {isActive && <Check className="h-5 w-5 text-primary" />}
                                                    </div>
                                                    <span className="text-base font-bold text-foreground">{mode.label}</span>
                                                    <span className="text-xs text-muted-foreground mt-1">{mode.desc}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Preset Brand Colors */}
                            <Card className="shadow-sm">
                                <CardHeader className="p-6 sm:p-8 pb-4">
                                    <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-2.5">
                                        <Palette className="h-5 w-5 text-primary" /> Curated Brand Accent Palettes
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Select from distinct, non-overlapping accent palettes crafted for high contrast across buttons, active borders, and badges.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 pt-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { id: 'purple', label: 'Royal Violet', hex: '#A802F5', bg: 'bg-[#A802F5]', desc: 'Original signature highlight' },
                                            { id: 'teal', label: 'Neon Teal', hex: '#02F5A8', bg: 'bg-[#02F5A8]', desc: 'Cyberpunk mint & cyan' },
                                            { id: 'amber', label: 'Solar Amber', hex: '#F59E0B', bg: 'bg-[#F59E0B]', desc: 'Warm sunset amber energy' },
                                            { id: 'blue', label: 'Electric Cobalt', hex: '#2563EB', bg: 'bg-[#2563EB]', desc: 'Deep vivid ultramarine blue' },
                                            { id: 'crimson', label: 'Crimson Ruby', hex: '#E11D48', bg: 'bg-[#E11D48]', desc: 'Bold radiant ruby scarlet' },
                                            { id: 'lilac', label: 'Dreamy Lilac', hex: '#B899FF', bg: 'bg-[#B899FF]', desc: 'Soft pastel neon lavender' },
                                            { id: 'pink', label: 'Cyber Pink', hex: '#F43F5E', bg: 'bg-[#F43F5E]', desc: 'High-energy hyper pink' },
                                            { id: 'prism', label: 'Prism Chroma', hex: '#A802F5', bg: 'bg-gradient-to-tr from-[#a802f5] via-[#0284f5] to-[#02f5a8]', desc: 'Dynamic animated chroma glow', isSpecial: true },
                                        ].map((c) => {
                                            const isActive = colorTheme === c.id;
                                            return (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => setColorTheme(c.id as ColorTheme)}
                                                    className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                                                        isActive
                                                            ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/40 shadow-xs'
                                                            : 'border-border hover:bg-secondary/60 text-muted-foreground'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between w-full mb-3">
                                                        <span className={`h-7 w-7 rounded-full ${c.bg} shadow-md ring-2 ring-border/80`} />
                                                        <div className="flex items-center gap-1.5">
                                                            {c.isSpecial && <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />}
                                                            {isActive && <Check className="h-4 w-4 text-primary" />}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-foreground">{c.label}</span>
                                                    <span className="text-xs text-muted-foreground mt-0.5">{c.desc}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Custom Color Wheel Studio */}
                            <Card className={`shadow-sm transition-all ${colorTheme === 'custom' ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : ''}`}>
                                <CardHeader className="p-6 sm:p-8 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-2.5">
                                            <Pipette className="h-5 w-5 text-primary" /> Interactive Custom Color Studio
                                        </CardTitle>
                                        {colorTheme === 'custom' && (
                                            <span className="text-xs font-bold text-primary bg-primary/15 border border-primary/30 px-3 py-1 rounded-full">
                                                ACTIVE CUSTOM THEME
                                            </span>
                                        )}
                                    </div>
                                    <CardDescription className="text-sm">
                                        Drag on the 2D gradient saturation canvas and hue spectrum to craft bespoke tones, or fine-tune exact RGB and HEX channels.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 pt-2">
                                    <CustomColorPicker
                                        value={customColor || tempHex}
                                        onChange={(hex) => {
                                            setTempHex(hex);
                                            setCustomColor(hex);
                                            setColorTheme('custom');
                                        }}
                                        onApply={(hex) => {
                                            setCustomColor(hex);
                                            setColorTheme('custom');
                                            toast.success(`Custom accent color ${hex.toUpperCase()} applied!`);
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── 4. Payout Account Tab (Artist Only) ── */}
                    {activeTab === 'payouts' && user?.artist_profile && (
                        <motion.div
                            key="payouts"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-8"
                        >
                            <Card className="shadow-sm">
                                <CardHeader className="p-6 sm:p-8 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-2.5">
                                            <CreditCard className="h-5 w-5 text-primary" /> Artist Payout Account
                                        </CardTitle>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                                            <ShieldCheck className="h-3.5 w-3.5" /> AES-256 ENCRYPTED
                                        </span>
                                    </div>
                                    <CardDescription className="text-sm">
                                        Configure the bank account or e-wallet where earnings from completed commissions will be disbursed via Midtrans Iris.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
                                    {payoutAccount && (
                                        <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2.5">
                                                    <Building2 className="h-5 w-5 text-emerald-400" />
                                                    <span className="font-bold text-base text-foreground">{payoutAccount.bank_name}</span>
                                                    <span className="text-[11px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-bold">ACTIVE</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Account: <span className="font-semibold text-foreground">{payoutAccount.bank_account_name}</span> ({payoutAccount.bank_account_number})
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={handleDeletePayout} disabled={savingPayout} className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1.5 text-xs cursor-pointer">
                                                <Trash2 className="h-4 w-4" /> Remove
                                            </Button>
                                        </div>
                                    )}

                                    <form onSubmit={handleSavePayout} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="bank_select" className="text-sm font-semibold">Bank or E-Wallet</Label>
                                            <select
                                                id="bank_select"
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="BCA">BCA (Bank Central Asia)</option>
                                                <option value="MANDIRI">Bank Mandiri</option>
                                                <option value="BNI">BNI (Bank Negara Indonesia)</option>
                                                <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                                                <option value="CIMB">CIMB Niaga</option>
                                                <option value="PERMATA">Bank Permata</option>
                                                <option value="GOPAY">GoPay E-Wallet</option>
                                                <option value="OVO">OVO E-Wallet</option>
                                                <option value="DANA">DANA E-Wallet</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="account_name" className="text-sm font-semibold">Account Holder Name</Label>
                                                <Input
                                                    id="account_name"
                                                    placeholder="e.g. Alex Rivera"
                                                    value={accountName}
                                                    onChange={(e) => setAccountName(e.target.value)}
                                                    className="h-12 rounded-xl bg-card border-border/80 px-4"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="account_number" className="text-sm font-semibold">Bank Account Number / E-Wallet Phone</Label>
                                                <Input
                                                    id="account_number"
                                                    placeholder="e.g. 1234567890"
                                                    value={accountNumber}
                                                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                                    className="h-12 rounded-xl bg-card border-border/80 font-mono px-4"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={savingPayout || loadingPayout} className="gap-2 font-bold shadow-md h-12 px-8 text-sm cursor-pointer">
                                            <CreditCard className="h-4 w-4" />
                                            {savingPayout ? 'Saving Payout Account...' : payoutAccount ? 'Update Payout Account' : 'Save Payout Account'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── 5. Notification Preferences Tab ── */}
                    {activeTab === 'notifications' && (
                        <motion.div
                            key="notifications"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-8"
                        >
                            <Card className="shadow-sm">
                                <CardHeader className="p-6 sm:p-8 pb-4">
                                    <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-2.5">
                                        <Bell className="h-5 w-5 text-primary" /> Email Notification Preferences
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Control which transactional and social notifications trigger email dispatches.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 pt-2 space-y-3.5">
                                    {[
                                        {
                                            id: 'orders',
                                            title: 'Commission Orders & Escrow Updates',
                                            desc: 'Get notified when an escrow payment is secured, revised, or approved.',
                                            checked: notifOrders,
                                            set: setNotifOrders,
                                        },
                                        {
                                            id: 'messages',
                                            title: 'Direct Client & Artist Messages',
                                            desc: 'Receive alerts when clients or artists reply in your order discussion threads.',
                                            checked: notifMessages,
                                            set: setNotifMessages,
                                        },
                                        {
                                            id: 'comments',
                                            title: 'Post Comments & Artwork Feedback',
                                            desc: 'Alerts when members comment on artworks you have shared in the feed.',
                                            checked: notifComments,
                                            set: setNotifComments,
                                        },
                                        {
                                            id: 'follows',
                                            title: 'New Followers & Community Activity',
                                            desc: 'Receive a summary when new collectors follow your creator studio.',
                                            checked: notifFollows,
                                            set: setNotifFollows,
                                        },
                                    ].map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                item.set(!item.checked);
                                                toast.success('Notification preference updated.');
                                            }}
                                            className="flex items-center justify-between p-5 rounded-xl border border-border/70 hover:bg-secondary/40 transition-colors cursor-pointer"
                                        >
                                            <div className="space-y-1 pr-4">
                                                <p className="font-semibold text-sm text-foreground">{item.title}</p>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={item.checked}
                                                onChange={() => {}}
                                                className="h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── 6. Danger Zone & UU PDP Privacy Tab ── */}
                    {activeTab === 'privacy' && (
                        <motion.div
                            key="privacy"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-8"
                        >
                            <Card className="border-rose-500/30 bg-rose-500/5 shadow-sm">
                                <CardHeader className="p-6 sm:p-8 pb-4">
                                    <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-2.5 text-rose-400">
                                        <AlertTriangle className="h-5 w-5 text-rose-400" /> Account Deletion &amp; Data Erasure
                                    </CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                                        In compliance with Indonesian Personal Data Protection Law (UU No. 27/2022 tentang Pelindungan Data Pribadi - UU PDP), you have the right to request permanent erasure of your personal data and account records.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
                                    <div className="p-5 rounded-xl border border-rose-500/20 bg-card/60 text-sm text-muted-foreground leading-relaxed space-y-2.5">
                                        <p className="font-semibold text-rose-400">Warning: This action is permanent and irreversible.</p>
                                        <ul className="list-disc list-inside space-y-1.5 text-xs">
                                            <li>All active browser sessions and auth tokens will be invalidated immediately.</li>
                                            <li>Your creator profile, posts, and personal data records will be purged.</li>
                                            <li>Active escrow commissions must be resolved before account closure.</li>
                                        </ul>
                                    </div>

                                    <form onSubmit={handleDeleteAccount} className="space-y-5 max-w-lg">
                                        <div className="space-y-2">
                                            <Label htmlFor="delete_password" className="text-sm font-semibold text-rose-400">
                                                Confirm Password to Delete Account
                                            </Label>
                                            <Input
                                                id="delete_password"
                                                type="password"
                                                placeholder="Enter your current password"
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                                className="h-12 rounded-xl bg-card border-rose-500/30 focus-visible:ring-rose-500 px-4"
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={deletingAccount || !deletePassword}
                                            className="font-bold shadow-md h-12 px-8 text-sm gap-2 cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {deletingAccount ? 'Deleting Account...' : 'Permanently Delete Account'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
                </div>
            </main>

            {/* 2FA Setup Modal */}
            <TwoFactorSetupModal
                isOpen={is2FASetupOpen}
                onClose={() => setIs2FASetupOpen(false)}
                onSuccess={async () => {
                    await refreshUser();
                }}
            />

            {/* 2FA Recovery Codes Modal */}
            <TwoFactorRecoveryModal
                isOpen={is2FARecoveryOpen}
                onClose={() => setIs2FARecoveryOpen(false)}
            />
        </div>
    );
};
