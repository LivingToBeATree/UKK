import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Lock, Smartphone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { userService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';

export const SettingsPage: React.FC = () => {
    const { user, refreshUser } = useAuth();
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
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="h-6 w-6" /> Settings
                </h1>
            </div>

            <Tabs defaultValue="profile">
                <TabsList className="mb-6">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="devices">Devices</TabsTrigger>
                </TabsList>

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

                <TabsContent value="security">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-bold flex items-center gap-2 mb-4">
                                    <Lock className="h-4 w-4" /> Change Password
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

                <TabsContent value="devices">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h2 className="font-bold flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" /> Device Management
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
