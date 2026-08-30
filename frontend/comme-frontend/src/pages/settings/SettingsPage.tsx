import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Lock, Smartphone, Palette, Sun, Moon, Laptop, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { userService } from '@/services/userService';
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

export const SettingsPage: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const { colorTheme, setColorTheme } = useColorTheme();
    const [savingProfile, setSavingProfile] = useState(false);

    const { register: regProfile, handleSubmit: handleProfile } = useForm({
        defaultValues: {
            display_name: user?.display_name || '',
            bio: user?.bio || '',
        },
    });

    const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword } = useForm({
        defaultValues: { current_password: '', password: '', password_confirmation: '' },
    });

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

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="h-6 w-6 text-primary" /> Settings & Preferences
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your account details, security, display appearance, and session devices.
                </p>
            </div>

            <Tabs defaultValue="profile">
                <TabsList className="mb-6 grid grid-cols-4 w-full">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="devices">Devices</TabsTrigger>
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
            </Tabs>
        </div>
    );
};
