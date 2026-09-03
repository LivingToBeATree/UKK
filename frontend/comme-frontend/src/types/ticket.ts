import type { User } from './user';
import type { Report } from './report';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface TicketMessage {
  id: number;
  ticket_id?: number;
  user_id?: number;
  content: string;
  created_at: string;
  updated_at?: string;
  user?: User;
}

export interface ModerationAction {
  id: number;
  ticket_id: number;
  staff_id: number;
  action_type: string;
  notes?: string | null;
  created_at: string;
  staff?: User;
}

export interface Ticket {
  id: number;
  report_id: number;
  assigned_to?: number | null;
  priority: TicketPriority;
  assigned_at?: string | null;
  closed_at?: string | null;
  created_at: string;
  updated_at?: string;

  report?: Report;
  assignee?: User | null;
  messages?: TicketMessage[];
  moderation_actions?: ModerationAction[];
}
