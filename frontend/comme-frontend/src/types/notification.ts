export interface AppNotification {
  id: string | number;
  user_id: number;
  type: string;
  data: {
    title?: string;
    message: string;
    action_url?: string;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
}

export interface UnreadNotificationCount {
  unread_count: number;
}

export interface Report {
  id: number;
  user_id: number;
  reportable_type: 'user' | 'post' | 'commission' | string;
  reportable_id: number;
  reason: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
}
