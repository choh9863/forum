import api, { handleApiError } from './api';
import type { Post, CreatePostData, UpdatePostData, PaginatedResponse } from '../types';

export const postService = {
  // Get posts with pagination and filters
  getPosts: async (params?: {
    boardId?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'createdAt' | 'viewCount' | 'reactions';
    sortOrder?: 'asc' | 'desc';
    isPinned?: boolean;
  }): Promise<PaginatedResponse<Post>> => {
    try {
      const response = await api.get<PaginatedResponse<Post>>('/posts', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get post by ID
  getPostById: async (id: string): Promise<Post> => {
    try {
      const response = await api.get<Post>(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get post by slug
  getPostBySlug: async (boardSlug: string, postSlug: string): Promise<Post> => {
    try {
      const response = await api.get<Post>(`/boards/${boardSlug}/posts/${postSlug}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create post (logged in users)
  createPost: async (data: CreatePostData): Promise<Post> => {
    try {
      const response = await api.post<Post>('/posts', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create anonymous post
  createAnonymousPost: async (data: CreatePostData & { password: string }): Promise<Post> => {
    try {
      const response = await api.post<Post>('/posts/anonymous', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update post
  updatePost: async (id: string, data: UpdatePostData): Promise<Post> => {
    try {
      const response = await api.put<Post>(`/posts/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update anonymous post (with password)
  updateAnonymousPost: async (id: string, data: UpdatePostData & { password: string }): Promise<Post> => {
    try {
      const response = await api.put<Post>(`/posts/${id}/anonymous`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete post
  deletePost: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete anonymous post (with password)
  deleteAnonymousPost: async (id: string, password: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/posts/${id}/anonymous/delete`, { password });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Like/react to post
  likePost: async (postId: string, type: string = 'LIKE'): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/posts/${postId}/reactions`, { type });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Unlike/remove reaction from post
  unlikePost: async (postId: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/posts/${postId}/reactions`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Search posts
  searchPosts: async (query: string, params?: {
    boardId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Post>> => {
    try {
      const response = await api.get<PaginatedResponse<Post>>('/posts/search', {
        params: { q: query, ...params },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Pin post (moderator/admin only)
  pinPost: async (id: string): Promise<Post> => {
    try {
      const response = await api.post<Post>(`/posts/${id}/pin`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Unpin post
  unpinPost: async (id: string): Promise<Post> => {
    try {
      const response = await api.post<Post>(`/posts/${id}/unpin`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Lock post (moderator/admin only)
  lockPost: async (id: string): Promise<Post> => {
    try {
      const response = await api.post<Post>(`/posts/${id}/lock`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Unlock post
  unlockPost: async (id: string): Promise<Post> => {
    try {
      const response = await api.post<Post>(`/posts/${id}/unlock`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Hide post (moderator/admin only)
  hidePost: async (id: string): Promise<Post> => {
    try {
      const response = await api.post<Post>(`/posts/${id}/hide`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Unhide post
  unhidePost: async (id: string): Promise<Post> => {
    try {
      const response = await api.post<Post>(`/posts/${id}/unhide`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Increment view count
  incrementViewCount: async (id: string): Promise<void> => {
    try {
      await api.post(`/posts/${id}/view`);
    } catch (error) {
      // Silently fail for view count increment
      console.error('Failed to increment view count:', error);
    }
  },
};
