import { api } from './api';
import type { ApiResponse, Ticket, TicketMessage } from '@/types';

export const ticketService = {
    list: async (page = 1, params?: Record<string, string>) => {
        const res = await api.get<ApiResponse<Ticket[]>>('/tickets', { params: { page, ...params } });
        return res.data;
    },

    show: async (id: number) => {
        const res = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
        return res.data.data;
    },

    update: async (id: number, payload: { priority?: string; assigned_to?: number | null }) => {
        const res = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}`, payload);
        return res.data.data;
    },

    close: async (id: number) => {
        const res = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/close`);
        return res.data.data;
    },

    sendMessage: async (ticketId: number, content: string) => {
        const res = await api.post<ApiResponse<TicketMessage>>(`/tickets/${ticketId}/messages`, { content });
        return res.data.data;
    },
};
