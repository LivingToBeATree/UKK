import { api } from './api';

export interface AdminStats {
    total_users: number;
    total_artists: number;
    total_moderators: number;
    total_admins: number;
    pending_applications_count: number;
    open_reports_count: number;
    active_tickets_count: number;
    total_commissions_count: number;
    completed_commissions_count: number;
    total_volume_idr: number;
    recent_applications: Array<{
        id: number;
        user: {
            id: number;
            username: string;
            display_name: string;
            avatar_url: string | null;
        };
        status: string;
        created_at: string;
    }>;
    recent_reports: Array<{
        id: number;
        reason: string;
        status: string;
        reportable_type: string;
        reporter: {
            id: number;
            username: string;
            display_name: string;
        };
        created_at: string;
    }>;
    recent_tickets: Array<{
        id: number;
        status: string;
        priority: string;
        reporter: {
            id: number;
            username: string;
            display_name: string;
        } | null;
        created_at: string;
    }>;
}

export interface AdminUserItem {
    id: number;
    username: string;
    display_name: string;
    email: string;
    role: 'user' | 'moderator' | 'admin';
    avatar_url: string | null;
    email_verified: boolean;
    two_factor_enabled: boolean;
    is_artist: boolean;
    commission_open: boolean;
    commissions_count: number;
    posts_count: number;
    reports_count: number;
    created_at: string;
}

export interface AdminUsersResponse {
    data: AdminUserItem[];
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    links?: {
        prev: string | null;
        next: string | null;
    };
}

export interface ModerationLogItem {
    id: number;
    type: string;
    notes: string | null;
    actor: {
        id: number;
        username: string;
        display_name: string;
        role: string;
        avatar_url: string | null;
    } | null;
    ticket: {
        id: number;
        title: string;
        status: string;
    } | null;
    created_at: string;
}

export interface ModerationLogsResponse {
    data: ModerationLogItem[];
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}

export const adminApi = {
    getStats: async (): Promise<{ data: AdminStats }> => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getUsers: async (params?: { search?: string; role?: string; page?: number }): Promise<AdminUsersResponse> => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    updateUserRole: async (userId: number, role: 'user' | 'moderator' | 'admin'): Promise<{ data: { id: number; username: string; role: string } }> => {
        const response = await api.patch(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    getModerationLogs: async (params?: { type?: string; page?: number }): Promise<ModerationLogsResponse> => {
        const response = await api.get('/admin/moderation-logs', { params });
        return response.data;
    },
};
