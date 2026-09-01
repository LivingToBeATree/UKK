import type { User } from './user';

export type PostVisibility = 'public' | 'followers' | 'private';

export interface MediaItem {
  id: number;
  url: string;
  file_name?: string;
  mime_type?: string;
  media_type?: string;
  size?: number;
}

export interface Post {
  id: number;
  user_id: number;
  portfolio_id?: number | null;
  content: string;
  visibility: PostVisibility;
  commentable: boolean;
  likes_count: number;
  comments_count: number;
  bookmarks_count: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  media?: MediaItem[];
  portfolio?: {
    id: number;
    title: string;
    description?: string | null;
    cover_image_url?: string;
    media?: { id: number; url: string }[];
  } | null;
  tags?: { id: number; name: string }[];
}

export interface PostComment {
  id: number;
  post_id: number;
  user_id: number;
  body: string;
  content?: string;
  created_at: string;
  user?: User;
}
