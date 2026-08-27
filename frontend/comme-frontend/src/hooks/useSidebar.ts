import { useContext } from 'react';
import { SidebarContext } from '@/contexts/sidebarContextDef';

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
