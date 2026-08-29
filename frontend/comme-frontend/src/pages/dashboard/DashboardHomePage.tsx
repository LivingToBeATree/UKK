import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Layers, Star, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const stats = [
    { label: 'Active Orders', value: '—', icon: Layers, color: 'text-purple-400' },
    { label: 'Avg Rating', value: '—', icon: Star, color: 'text-amber-400' },
    { label: 'Total Earnings', value: '—', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'This Month', value: '—', icon: TrendingUp, color: 'text-blue-400' },
];

export const DashboardHomePage: React.FC = () => {
    const { user } = useAuth();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <LayoutDashboard className="h-6 w-6" /> Artist Studio
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Welcome back, {user?.display_name || user?.username}!
                </p>
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
                    <p className="text-muted-foreground">Dashboard analytics coming soon. Manage your services, portfolio, and orders from the sidebar.</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};
