import { api } from './api';
import type { ApiResponse, Post, PostComment } from '@/types';

export const postService = {
    // List all posts (paginated with filters & sort order)
    list: async (page = 1, params?: { tag?: string; search?: string; type?: string; user_id?: number; username?: string; sort?: string }) => {
        const res = await api.get<ApiResponse<Post[]>>('/posts', { params: { page, ...params } });
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
        const res = await api.post<ApiResponse<{ liked?: boolean; is_liked?: boolean; likes_count: number }>>(`/posts/${postId}/like`);
        const data = res.data.data;
        return {
            liked: data.liked ?? data.is_liked ?? false,
            is_liked: data.is_liked ?? data.liked ?? false,
            likes_count: data.likes_count,
        };
    },

    // Toggle bookmark
    toggleBookmark: async (postId: number) => {
        const res = await api.post<ApiResponse<{ bookmarked?: boolean; is_bookmarked?: boolean; bookmarks_count: number }>>(`/posts/${postId}/bookmark`);
        const data = res.data.data;
        return {
            bookmarked: data.bookmarked ?? data.is_bookmarked ?? false,
            is_bookmarked: data.is_bookmarked ?? data.bookmarked ?? false,
            bookmarks_count: data.bookmarks_count,
        };
    },

    // Get user's bookmarked posts
    getBookmarks: async (page = 1) => {
        const res = await api.get<ApiResponse<Post[]>>('/me/bookmarks', { params: { page } });
        return res.data;
    },

    // Get user's liked posts
    getLikes: async (page = 1) => {
        const res = await api.get<ApiResponse<Post[]>>('/me/likes', { params: { page } });
        return res.data;
    },

    // List comments for a post
    listComments: async (postId: number, page = 1) => {
        const res = await api.get<ApiResponse<PostComment[]>>(`/posts/${postId}/comments`, { params: { page } });
        return res.data;
    },

    // Create comment or reply
    createComment: async (postId: number, body: string, parentCommentId?: number) => {
        const payload: Record<string, any> = {
            content: body,
            body: body,
        };
        if (parentCommentId) {
            payload.parent_comment_id = parentCommentId;
        }
        const res = await api.post<ApiResponse<PostComment>>(`/posts/${postId}/comments`, payload);
        return res.data.data;
    },

    // Delete comment
    deleteComment: async (commentId: number) => {
        await api.delete(`/comments/${commentId}`);
    },

    // Toggle comment like
    toggleCommentLike: async (commentId: number) => {
        const res = await api.post<ApiResponse<{ liked?: boolean; is_liked?: boolean; likes_count: number }>>(`/comments/${commentId}/like`);
        const data = res.data.data;
        return {
            liked: data.liked ?? data.is_liked ?? false,
            is_liked: data.is_liked ?? data.liked ?? false,
            likes_count: data.likes_count,
        };
    },

    // Toggle comment bookmark
    toggleCommentBookmark: async (commentId: number) => {
        const res = await api.post<ApiResponse<{ bookmarked?: boolean; is_bookmarked?: boolean; bookmarks_count: number }>>(`/comments/${commentId}/bookmark`);
        const data = res.data.data;
        return {
            bookmarked: data.bookmarked ?? data.is_bookmarked ?? false,
            is_bookmarked: data.is_bookmarked ?? data.bookmarked ?? false,
            bookmarks_count: data.bookmarks_count,
        };
    },
};
