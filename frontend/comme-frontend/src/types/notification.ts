import type { User } from './user';

export interface AppNotification {
  id: string | number;
  user_id: number;
  actor_id?: number | null;
  actor?: User | null;
  type: string;
  title?: string;
  message?: string;
  data?: {
    title?: string;
    message?: string;
    action_url?: string;
    [key: string]: unknown;
  };
  notifiable_type?: string | null;
  notifiable_id?: number | null;
  read_at: string | null;
  is_read?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UnreadNotificationCount {
  unread_count: number;
}
