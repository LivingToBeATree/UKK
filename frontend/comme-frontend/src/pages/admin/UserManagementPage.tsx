import React from 'react';
import { motion } from 'motion/react';
import { Users, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const UserManagementPage: React.FC = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="h-6 w-6" /> User Management
                </h1>
                <p className="text-sm text-muted-foreground mt-1">View and manage platform users</p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users by name or email..." className="pl-10" />
            </div>

            <Card>
                <CardContent className="p-6 text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">User management table coming soon.</p>
                    <p className="text-xs text-muted-foreground mt-1">Will include search, role management, and moderation actions.</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};
