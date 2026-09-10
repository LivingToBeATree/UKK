import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setDocumentTitle, slugToTitle } from '@/hooks/useDocumentTitle';

// Route lookup table for static and standard application routes
const STATIC_ROUTE_TITLES: Record<string, string> = {
    '/': 'Digital Commission & Creator Platform',
    '/explore': 'Explore Artwork',
    '/store': 'Marketplace & Services',
    '/artists': 'Artists Directory',
    '/commissions': 'My Commissions',
    '/orders': 'My Commissions',
    '/settings': 'Account Settings',
    '/notifications': 'Notifications',
    '/support': 'Support Helpdesk',
    '/tickets': 'Support Helpdesk',
    '/apply-artist': 'Apply as Artist',
    '/apply-artist/status': 'Artist Application Status',
    '/posts/create': 'Create Artwork Post',

    // Legal & Trust
    '/terms': 'Terms of Service',
    '/privacy': 'Privacy Policy',
    '/cookies': 'Cookie Policy',
    '/license': 'Creator License Agreement',
    '/api-terms': 'API Terms of Service',
    '/escrow-terms': 'Escrow Protection Terms',

    // Authentication
    '/login': 'Sign In',
    '/register': 'Join Comme',
    '/register/verify': 'Verify Email',
    '/forgot-password': 'Forgot Password',
    '/reset-password': 'Reset Password',

    // Artist Studio / Workbench
    '/dashboard': 'Artist Studio',
    '/dashboard/services': 'Manage Services',
    '/dashboard/services/new': 'Create Service',
    '/dashboard/portfolio': 'Manage Portfolio',
    '/dashboard/posts': 'Manage Posts',
    '/dashboard/commissions': 'Studio Commissions',
    '/dashboard/inquiries': 'Studio Inquiries',
    '/dashboard/reviews': 'Studio Reviews',
    '/dashboard/earnings': 'Studio Earnings & Payouts',
    '/dashboard/settings': 'Studio Settings',

    // Admin Panel
    '/admin': 'Admin Dashboard',
    '/admin/users': 'User Management',
    '/admin/applications': 'Artist Applications',
    '/admin/reports': 'Content Moderation',
    '/admin/tickets': 'Support Tickets',
    '/admin/moderation-log': 'Moderation Audit Log',

    // Developer Panel
    '/dev': 'Developer Panel',
    '/dev/panel': 'Developer Panel',
    '/dev/sandbox': 'API Playground',
};

/**
 * Resolves a human-readable title based on the URL pathname and route slugs.
 */
function resolveTitleFromPath(pathname: string): string {
    // Direct static lookup
    if (STATIC_ROUTE_TITLES[pathname]) {
        return STATIC_ROUTE_TITLES[pathname];
    }

    // Order Commission flow: /store/:serviceId/order
    const orderMatch = pathname.match(/^\/store\/([^/]+)\/order$/);
    if (orderMatch) {
        const title = slugToTitle(orderMatch[1]);
        return title ? `Order — ${title}` : 'Order Commission';
    }

    // Marketplace Service Detail: /store/:serviceId
    const storeMatch = pathname.match(/^\/store\/([^/]+)$/);
    if (storeMatch) {
        const title = slugToTitle(storeMatch[1]);
        return title || 'Commission Service';
    }

    // Portfolio Artwork Detail: /portfolio/:id
    const portfolioMatch = pathname.match(/^\/portfolio\/([^/]+)$/);
    if (portfolioMatch) {
        const title = slugToTitle(portfolioMatch[1]);
        return title || 'Portfolio Artwork';
    }

    // Community Post Detail: /posts/:id
    const postMatch = pathname.match(/^\/posts\/([^/]+)$/);
    if (postMatch) {
        const title = slugToTitle(postMatch[1]);
        return title || 'Artwork Post';
    }

    // Commission Workspace / Detail: /commissions/:id or /orders/:id
    const commissionMatch = pathname.match(/^\/(?:commissions|orders)\/([^/]+)$/);
    if (commissionMatch) {
        return `Order #${commissionMatch[1]}`;
    }

    // Creator / User Profiles: /profile/:username, /users/:username, /u/:username, /artists/:username
    const profileMatch = pathname.match(/^\/(?:profile|users|u|artists)\/([^/]+)$/);
    if (profileMatch) {
        const rawUsername = profileMatch[1].replace(/^@/, '');
        return `@${rawUsername}`;
    }

    // Own profile root: /profile
    if (pathname === '/profile') {
        return 'My Profile';
    }

    // Dashboard Service Edit: /dashboard/services/:id/edit
    const serviceEditMatch = pathname.match(/^\/dashboard\/services\/([^/]+)\/edit$/);
    if (serviceEditMatch) {
        return `Edit Service #${serviceEditMatch[1]}`;
    }

    // Admin Ticket Detail: /admin/tickets/:id
    const ticketMatch = pathname.match(/^\/admin\/tickets\/([^/]+)$/);
    if (ticketMatch) {
        return `Ticket #${ticketMatch[1]}`;
    }

    // Default fallback
    return 'Digital Commission & Creator Platform';
}

/**
 * Global component placed inside Router to automatically synchronize document.title
 * with route changes and slugs.
 */
export function DynamicTitleUpdater(): null {
    const location = useLocation();

    useEffect(() => {
        const title = resolveTitleFromPath(location.pathname);
        setDocumentTitle(title);
    }, [location.pathname]);

    return null;
}
