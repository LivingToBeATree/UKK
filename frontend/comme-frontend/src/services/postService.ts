import { api } from './api';
import type { ApiResponse, Post, PostComment } from '@/types';

export const postService = {
    // List all posts (paginated)
    list: async (page = 1) => {
        const res = await api.get<ApiResponse<Post[]>>('/posts', { params: { page } });
        return res.data;
    },

    // Get single post
    show: async (id: number) => {
        const res = await api.get<ApiResponse<Post>>(`/posts/${id}`);
        return res.data.data;
    },

    // Create post
    create: async (payload: FormData) => {
        const res = await api.post<ApiResponse<Post>>('/posts', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    },

    // Update post
    update: async (id: number, payload: FormData) => {
        payload.append('_method', 'PUT');
        const res = await api.post<ApiResponse<Post>>(`/posts/${id}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    },

    // Delete post
    destroy: async (id: number) => {
        await api.delete(`/posts/${id}`);
    },

    // Toggle like
    toggleLike: async (postId: number) => {
        const res = await api.post<ApiResponse<{ liked: boolean; likes_count: number }>>(`/posts/${postId}/like`);
        return res.data.data;
    },

    // Toggle bookmark
    toggleBookmark: async (postId: number) => {
        const res = await api.post<ApiResponse<{ bookmarked: boolean }>>(`/posts/${postId}/bookmark`);
        return res.data.data;
    },

    // Get user's bookmarked posts
    getBookmarks: async (page = 1) => {
        const res = await api.get<ApiResponse<Post[]>>('/me/bookmarks', { params: { page } });
        return res.data;
    },

    // List comments for a post
    listComments: async (postId: number, page = 1) => {
        const res = await api.get<ApiResponse<PostComment[]>>(`/posts/${postId}/comments`, { params: { page } });
        return res.data;
    },

    // Create comment
    createComment: async (postId: number, body: string) => {
        const res = await api.post<ApiResponse<PostComment>>(`/posts/${postId}/comments`, { body });
        return res.data.data;
    },

    // Delete comment
    deleteComment: async (commentId: number) => {
        await api.delete(`/comments/${commentId}`);
    },
};
