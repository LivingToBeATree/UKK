import type { User } from './user';
import type { ArtistProfile } from './artist';
import type { MediaItem } from './post';

export type ServiceStatus = 'open' | 'closed' | 'draft';

export interface CommissionOption {
  id: number;
  commission_service_id: number;
  title: string;
  description?: string | null;
  price: number;
  duration_days: number;
}

export interface CommissionService {
  id: number;
  artist_profile_id: number;
  thumbnail_media_id?: number | null;
  name: string;
  description: string;
  status: ServiceStatus;
  alt_text?: string | null;
  created_at: string;
  updated_at: string;
  artist_profile?: ArtistProfile;
  options?: CommissionOption[];
  media?: MediaItem[];
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'waiting_for_client'
  | 'revision'
  | 'completed'
  | 'cancelled'
  | 'declined';

export interface CommissionOrder {
  id: number;
  commission_service_id: number;
  commission_option_id?: number | null;
  artist_profile_id: number;
  user_id: number; // Buyer
  status: OrderStatus;
  description?: string | null;
  deadline?: string | null;
  total_price: number;
  created_at: string;
  updated_at: string;
  commission_service?: CommissionService;
  artist_profile?: ArtistProfile;
  user?: User;
  messages?: CommissionMessage[];
}

export interface CommissionMessage {
  id: number;
  commission_id: number;
  user_id: number;
  message: string;
  created_at: string;
  user?: User;
  media?: MediaItem[];
}
