import api, { handleApiError } from './api';
import type { Comment, CreateCommentData, UpdateCommentData } from '../types';

export const commentService = {
  // Get comments for a post
  getComments: async (postId: string): Promise<Comment[]> => {
    try {
      const response = await api.get<Comment[]>(`/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get comment by ID
  getCommentById: async (id: string): Promise<Comment> => {
    try {
      const response = await api.get<Comment>(`/comments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create comment (logged in users)
  createComment: async (data: CreateCommentData): Promise<Comment> => {
    try {
      const response = await api.post<Comment>('/comments', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create anonymous comment
  createAnonymousComment: async (data: CreateCommentData & { password: string }): Promise<Comment> => {
    try {
      const response = await api.post<Comment>('/comments/anonymous', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update comment
  updateComment: async (id: string, data: UpdateCommentData): Promise<Comment> => {
    try {
      const response = await api.put<Comment>(`/comments/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update anonymous comment (with password)
  updateAnonymousComment: async (id: string, data: UpdateCommentData & { password: string }): Promise<Comment> => {
    try {
      const response = await api.put<Comment>(`/comments/${id}/anonymous`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete comment
  deleteComment: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/comments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete anonymous comment (with password)
  deleteAnonymousComment: async (id: string, password: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/comments/${id}/anonymous/delete`, { password });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Like/react to comment
  likeComment: async (commentId: string, type: string = 'LIKE'): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/comments/${commentId}/reactions`, { type });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Unlike/remove reaction from comment
  unlikeComment: async (commentId: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/comments/${commentId}/reactions`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get replies to a comment
  getReplies: async (commentId: string): Promise<Comment[]> => {
    try {
      const response = await api.get<Comment[]>(`/comments/${commentId}/replies`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Hide comment (moderator/admin only)
  hideComment: async (id: string): Promise<Comment> => {
    try {
      const response = await api.post<Comment>(`/comments/${id}/hide`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Unhide comment
  unhideComment: async (id: string): Promise<Comment> => {
    try {
      const response = await api.post<Comment>(`/comments/${id}/unhide`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
