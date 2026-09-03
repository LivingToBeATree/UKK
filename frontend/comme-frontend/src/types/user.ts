import type { ArtistProfile } from './artist';

export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
    id: number;
    username: string;
    email: string;
    display_name: string;
    role: UserRole;
    avatar?: string | null;
    avatar_url?: string | null;
    banner?: string | null;
    banner_url?: string | null;
    bio?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    artist_profile?: ArtistProfile | null;
    followers_count?: number;
    following_count?: number;
    posts_count?: number;
    is_following?: boolean;
    two_factor_enabled?: boolean;
    is_suspended?: boolean;
    suspended_at?: string | null;
    suspension_reason?: string | null;
    active_warning?: string | null;
    warning_acknowledged_at?: string | null;
    has_unacknowledged_warning?: boolean;
}

export const isArtist = (user?: User | null): boolean => {
    return !!user?.artist_profile;
};

export const isStaff = (user?: User | null): boolean => {
    return user?.role === 'admin' || user?.role === 'moderator';
};

export interface PendingRegistrationResponse {
    message: string;
    email: string;
    expires_in_minutes: number;
}