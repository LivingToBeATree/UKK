import type { User } from './user';
import type { Ticket } from './ticket';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'copyright'
  | 'impersonation'
  | 'scam'
  | 'other';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export type ReportableType = 'post' | 'post_comment' | 'commission_review' | 'portfolio' | 'commission_service' | 'user';

export interface Report {
  id: number;
  user_id: number;
  reportable_type: ReportableType | string;
  reportable_id: number;
  reason: ReportReason | string;
  description?: string | null;
  status: ReportStatus;
  handled_by?: number | null;
  handled_at?: string | null;
  created_at: string;
  updated_at?: string;

  reporter?: User;
  handled_by_user?: User;
  reportable?: any;
  ticket?: Ticket;
}
