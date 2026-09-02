import type { User } from './user';

export type CommissionStatus = 'open' | 'closed' | 'busy';

export interface ArtistProfile {
    id: number;
    user_id: number;
    bio?: string | null;
    commission_status: CommissionStatus;
    portfolio_url?: string | null;
    social_links?: string[] | Record<string, string> | null;
    rating_avg?: number;
    reviews_count?: number;
    created_at: string;
    updated_at: string;
    user?: User
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface ArtistApplication{
    id: number;
    user_id: number;
    status: ApplicationStatus;
    portfolio_url: string;
    social_links?: string[] | null;
    note?: string | null;
    rejection_reason?: string | null;
    created_at: string;
    updated_at: string;
    user?: User
}

export interface Portfolio {
    id: number;
    artist_profile_id?: number;
    title: string;
    description?: string | null;
    thumbnail_media_id?: number | null;
    visibility?: string;
    starred?: boolean;
    created_at?: string;
    updated_at?: string;
    media?: { id: number; url: string; file_name?: string; media_type?: string }[];
    thumbnail_media?: { id: number; url: string; file_name?: string };
    tags?: { id: number; name: string }[];
}