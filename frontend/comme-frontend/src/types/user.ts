import type { ArtistProfile } from './artist';

export type UserRole = 'user' | 'artist' | 'staff' | 'admin';

export interface User {
    id: number;
    username: string;
    email: string;
    display_name: string;
    role: UserRole;
    avatar_url?: string | null;
    bio?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    artist_profile?: ArtistProfile | null;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface PendingRegistrationResponse {
    message: string;
    email: string;
    expires_in_minutes: number;
}