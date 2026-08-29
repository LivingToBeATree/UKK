import React from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const ModerationLogPage: React.FC = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Shield className="h-6 w-6" /> Moderation Log
                </h1>
                <p className="text-sm text-muted-foreground mt-1">History of all moderation actions</p>
            </div>

            <Card>
                <CardContent className="p-6 text-center py-12">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Moderation log will display a history of all admin/moderator actions.</p>
                    <p className="text-xs text-muted-foreground mt-1">Including user bans, post removals, report resolutions, and more.</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};
