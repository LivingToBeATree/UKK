import type { User } from './user';

export type PostVisibility = 'public' | 'followers' | 'private';

export interface MediaItem {
  id: number;
  url: string;
  file_name?: string;
  mime_type?: string;
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
}

export interface PostComment {
  id: number;
  post_id: number;
  user_id: number;
  body: string;
  created_at: string;
  user?: User;
}
