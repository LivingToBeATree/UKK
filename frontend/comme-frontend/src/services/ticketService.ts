import { api } from './api';
import type { ApiResponse } from '@/types';

export interface Ticket {
    id: number;
    user_id: number;
    subject: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in_progress' | 'closed';
    created_at: string;
    updated_at: string;
    user?: { id: number; username: string; display_name: string; avatar_url?: string | null };
    messages?: TicketMessage[];
}

export interface TicketMessage {
    id: number;
    ticket_id: number;
    user_id: number;
    body: string;
    created_at: string;
    user?: { id: number; username: string; display_name: string; avatar_url?: string | null };
}

export const ticketService = {
    list: async (page = 1, params?: Record<string, string>) => {
        const res = await api.get<ApiResponse<Ticket[]>>('/tickets', { params: { page, ...params } });
        return res.data;
    },

    show: async (id: number) => {
        const res = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
        return res.data.data;
    },

    update: async (id: number, payload: { body: string }) => {
        const res = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}`, payload);
        return res.data.data;
    },

    close: async (id: number) => {
        const res = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/close`);
        return res.data.data;
    },
};
