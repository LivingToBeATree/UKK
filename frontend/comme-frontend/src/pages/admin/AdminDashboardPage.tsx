import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, Flag, MessageSquare, FileCheck, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
    { label: 'Total Users', value: '—', icon: Users, color: 'text-blue-400' },
    { label: 'Pending Applications', value: '—', icon: FileCheck, color: 'text-amber-400' },
    { label: 'Open Reports', value: '—', icon: Flag, color: 'text-rose-400' },
    { label: 'Active Tickets', value: '—', icon: MessageSquare, color: 'text-purple-400' },
];

export const AdminDashboardPage: React.FC = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <LayoutDashboard className="h-6 w-6" /> Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Platform overview and management</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label}>
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-muted">
                                        <Icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardContent className="p-6 text-center py-12">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Analytics dashboard coming soon. Use the sidebar to manage the platform.</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};
