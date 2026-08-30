import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Lock, Smartphone, Palette, Sun, Moon, Laptop, Check, CreditCard, Building2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { userService } from '@/services/userService';
import { payoutAccountApi } from '@/services/commissionService';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useColorTheme, type ColorTheme } from '@/hooks/useColorTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import type { ArtistPayoutAccount } from '@/types';

export const SettingsPage: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const { colorTheme, setColorTheme } = useColorTheme();
    const [savingProfile, setSavingProfile] = useState(false);

    // Payout Account State
    const [payoutAccount, setPayoutAccount] = useState<ArtistPayoutAccount | null>(null);
    const [loadingPayout, setLoadingPayout] = useState(false);
    const [savingPayout, setSavingPayout] = useState(false);
    const [bankName, setBankName] = useState('BCA');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    const { register: regProfile, handleSubmit: handleProfile } = useForm({
        defaultValues: {
            display_name: user?.display_name || '',
            bio: user?.bio || '',
        },
    });

    const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword } = useForm({
        defaultValues: { current_password: '', password: '', password_confirmation: '' },
    });

    useEffect(() => {
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

    const onProfileSubmit = async (data: { display_name: string; bio: string }) => {
        setSavingProfile(true);
        try {
            const formData = new FormData();
            formData.append('display_name', data.display_name);
            formData.append('bio', data.bio);
            await userService.updateProfile(formData);
            await refreshUser();
            toast.success('Profile updated!');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const onPasswordSubmit = async (data: { current_password: string; password: string; password_confirmation: string }) => {
        try {
            await userService.changePassword(data);
            toast.success('Password changed!');
            resetPassword();
        } catch {
            toast.error('Failed to change password');
        }
    };

    const handleLogoutDevices = async () => {
        const password = prompt('Enter your password to log out other devices:');
        if (!password) return;
        try {
            await userService.logoutOtherDevices(password);
            toast.success('Logged out of other devices');
        } catch {
            toast.error('Failed to log out devices');
        }
    };

    const handleSavePayout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountName.trim() || !accountNumber.trim()) {
            toast.error('Please fill in both account name and account number');
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
            toast.success('Payout account saved successfully! Earnings will disburse here.');
        } catch {
            toast.error('Failed to save payout account');
        } finally {
            setSavingPayout(false);
        }
    };

    const handleDeletePayout = async () => {
        if (!confirm('Are you sure you want to remove your payout account? Automatic disbursements will be held until a new account is configured.')) return;
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

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="h-6 w-6 text-primary" /> Settings & Preferences
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your account details, security, payout account, and display appearance.
                </p>
            </div>

            <Tabs defaultValue="profile">
                <TabsList className={`mb-6 grid ${user?.artist_profile ? 'grid-cols-5' : 'grid-cols-4'} w-full`}>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="devices">Devices</TabsTrigger>
                    {user?.artist_profile && <TabsTrigger value="payouts">Payouts</TabsTrigger>}
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar size="lg" fallback={user?.display_name || user?.username || '?'} src={user?.avatar_url} />
                                    <div>
                                        <p className="font-bold">{user?.display_name || user?.username}</p>
                                        <p className="text-xs text-muted-foreground">@{user?.username}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="display_name">Display Name</Label>
                                        <Input id="display_name" {...regProfile('display_name')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea id="bio" {...regProfile('bio')} rows={3} />
                                    </div>
                                    <Button type="submit" disabled={savingProfile}>
                                        {savingProfile ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Appearance Tab */}
                <TabsContent value="appearance">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Sun className="h-4 w-4 text-primary" /> Display Mode
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Choose between light, dark, or automatic system theme.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'light', label: 'Light', icon: Sun },
                                        { key: 'dark', label: 'Dark', icon: Moon },
                                        { key: 'system', label: 'Auto System', icon: Laptop },
                                    ].map((mode) => {
                                        const Icon = mode.icon;
                                        const isActive = theme === mode.key;
                                        return (
                                            <button
                                                key={mode.key}
                                                type="button"
                                                onClick={() => setTheme(mode.key as 'light' | 'dark' | 'system')}
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/40'
                                                        : 'border-border hover:bg-secondary/60 text-muted-foreground'
                                                }`}
                                            >
                                                <Icon className={`h-6 w-6 mb-2 ${isActive ? 'text-primary' : ''}`} />
                                                <span className="text-xs font-semibold">{mode.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Palette className="h-4 w-4 text-primary" /> Accent Color Theme
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Select your preferred primary brand highlight color.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'purple', label: 'Royal Purple', hex: '#A802F5', bg: 'bg-[#A802F5]' },
                                        { id: 'teal', label: 'Neon Teal', hex: '#02F5A8', bg: 'bg-[#02F5A8]' },
                                        { id: 'orange', label: 'Solar Orange', hex: '#F5AA02', bg: 'bg-[#F5AA02]' },
                                    ].map((c) => {
                                        const isActive = colorTheme === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setColorTheme(c.id as ColorTheme)}
                                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/40'
                                                        : 'border-border hover:bg-secondary/60 text-muted-foreground'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`h-4 w-4 rounded-full ${c.bg} shadow-xs ring-1 ring-border`} />
                                                    <span className="text-xs font-semibold">{c.label}</span>
                                                </div>
                                                {isActive && <Check className="h-4 w-4 text-primary" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-bold flex items-center gap-2 mb-4">
                                    <Lock className="h-4 w-4 text-primary" /> Change Password
                                </h2>
                                <form onSubmit={handlePassword(onPasswordSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Current Password</Label>
                                        <Input id="current_password" type="password" {...regPassword('current_password')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new_password">New Password</Label>
                                        <Input id="new_password" type="password" {...regPassword('password')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                                        <Input id="confirm_password" type="password" {...regPassword('password_confirmation')} />
                                    </div>
                                    <Button type="submit">Change Password</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Devices Tab */}
                <TabsContent value="devices">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h2 className="font-bold flex items-center gap-2">
                                    <Smartphone className="h-4 w-4 text-primary" /> Device Management
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Log out of all other browser sessions across all of your devices.
                                </p>
                                <Button variant="destructive" onClick={handleLogoutDevices}>
                                    Log Out Other Devices
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Payouts Tab (Artist Only) */}
                {user?.artist_profile && (
                    <TabsContent value="payouts">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-primary" /> Artist Payout Account
                                    </CardTitle>
                                    <CardDescription>
                                        Configure the bank account or e-wallet where earnings from completed commissions will be disbursed via Midtrans Iris.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {payoutAccount && (
                                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-emerald-400" />
                                                    <span className="font-bold text-sm text-foreground">{payoutAccount.bank_name}</span>
                                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">ACTIVE</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Account: <span className="font-semibold text-foreground">{payoutAccount.bank_account_name}</span> ({payoutAccount.bank_account_number})
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={handleDeletePayout} disabled={savingPayout} className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1 text-xs">
                                                <Trash2 className="h-3.5 w-3.5" /> Remove
                                            </Button>
                                        </div>
                                    )}

                                    <form onSubmit={handleSavePayout} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="bank_select">Bank or E-Wallet</Label>
                                            <select
                                                id="bank_select"
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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

                                        <div className="space-y-2">
                                            <Label htmlFor="account_name">Account Holder Name (as registered with bank)</Label>
                                            <Input
                                                id="account_name"
                                                placeholder="e.g. John Doe"
                                                value={accountName}
                                                onChange={(e) => setAccountName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="account_number">Bank Account Number / E-Wallet Phone</Label>
                                            <Input
                                                id="account_number"
                                                placeholder="e.g. 1234567890"
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                                required
                                            />
                                            <p className="text-[11px] text-muted-foreground">Numbers only. Your account information is encrypted at rest using AES-256-CBC.</p>
                                        </div>

                                        <Button type="submit" disabled={savingPayout || loadingPayout} className="gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            {savingPayout ? 'Saving Payout Account...' : payoutAccount ? 'Update Payout Account' : 'Save Payout Account'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};
