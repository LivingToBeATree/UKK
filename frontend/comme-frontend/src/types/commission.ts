import type { User } from './user';
import type { ArtistProfile } from './artist';
import type { MediaItem } from './post';

export type ServiceStatus = 'open' | 'closed' | 'draft';

export interface CommissionOption {
  id: number;
  commission_service_id: number;
  title: string;
  description?: string | null;
  base_price: number;
  price?: number;
  duration_days?: number;
  created_at?: string;
  updated_at?: string;
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

export interface CommissionReview {
  id: number;
  commission_id: number;
  artist_profile_id: number;
  user_id: number;
  rating: number;
  title?: string | null;
  comment: string;
  recommended: boolean;
  artist_reply?: string | null;
  artist_replied_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CommissionPayment {
  id: number;
  commission_id: number;
  order_id: string;
  status: string;
  gross_amount: number;
  snap_token?: string | null;
  payment_type?: string | null;
  settlement_time?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommissionOrder {
  id: number;
  commission_service_id: number;
  commission_option_id?: number | null;
  artist_profile_id: number;
  user_id: number;
  status: OrderStatus;
  description?: string | null;
  deadline?: string | null;
  total_price: number;
  created_at: string;
  updated_at: string;
  commission_service?: CommissionService;
  commission_option?: CommissionOption;
  artist_profile?: ArtistProfile;
  user?: User;
  messages?: CommissionMessage[];
  review?: CommissionReview | null;
  payments?: CommissionPayment[];
}

export interface CommissionMessage {
  id: number;
  commission_id: number;
  sender_id?: number;
  recipient_id?: number;
  user_id?: number;
  message: string;
  created_at: string;
  user?: User;
  media?: MediaItem[];
}
