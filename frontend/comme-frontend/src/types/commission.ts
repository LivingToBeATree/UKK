import type { User } from './user';
import type { ArtistProfile } from './artist';
import type { MediaItem } from './post';

export type ServiceStatus = 'open' | 'closed' | 'draft';

export interface CommissionAddon {
  id?: number;
  commission_option_id?: number;
  title: string;
  description?: string | null;
  additional_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface CommissionOption {
  id?: number;
  commission_service_id?: number;
  title: string;
  description?: string | null;
  base_price: number;
  price?: number;
  duration_days?: number;
  addons?: CommissionAddon[];
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

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

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

export interface CommissionPayout {
  id: number;
  amount: number;
  status: PayoutStatus;
  reference: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  requested_at?: string | null;
  completed_at?: string | null;
}

export interface ArtistPayoutAccount {
  id: number;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  is_active: boolean;
  updated_at: string;
}

export interface CommissionAddonSelection {
  id: number;
  commission_id: number;
  commission_addon_id?: number | null;
  title: string;
  price: number;
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
  proposed_deadline?: string | null;
  deadline_proposal_note?: string | null;
  delivered_at?: string | null;
  review_deadline?: string | null;
  completed_at?: string | null;
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
  payout?: CommissionPayout | null;
  addons_selections?: CommissionAddonSelection[];
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
