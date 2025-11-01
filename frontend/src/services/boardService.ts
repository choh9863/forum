import api, { handleApiError } from './api';
import type { Board, CreateBoardData, UpdateBoardData, PaginatedResponse } from '../types';

export const boardService = {
  // Get all boards
  getBoards: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Board>> => {
    try {
      const response = await api.get<PaginatedResponse<Board>>('/boards', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get board by slug
  getBoardBySlug: async (slug: string): Promise<Board> => {
    try {
      const response = await api.get<Board>(`/boards/${slug}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get board by ID
  getBoardById: async (id: string): Promise<Board> => {
    try {
      const response = await api.get<Board>(`/boards/id/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Request new board
  requestBoard: async (data: CreateBoardData): Promise<Board> => {
    try {
      const response = await api.post<Board>('/boards/request', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create board (admin only)
  createBoard: async (data: CreateBoardData): Promise<Board> => {
    try {
      const response = await api.post<Board>('/boards', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update board
  updateBoard: async (id: string, data: UpdateBoardData): Promise<Board> => {
    try {
      const response = await api.put<Board>(`/boards/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete board
  deleteBoard: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/boards/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Approve board request (admin only)
  approveBoard: async (id: string): Promise<Board> => {
    try {
      const response = await api.post<Board>(`/boards/${id}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Add board manager
  addManager: async (boardId: string, userId: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/boards/${boardId}/managers`, { userId });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Remove board manager
  removeManager: async (boardId: string, userId: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/boards/${boardId}/managers/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Ban user from board
  banUser: async (boardId: string, userId: string, reason?: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/boards/${boardId}/bans`, { userId, reason });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Unban user from board
  unbanUser: async (boardId: string, userId: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/boards/${boardId}/bans/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get board statistics
  getBoardStats: async (boardId: string): Promise<any> => {
    try {
      const response = await api.get(`/boards/${boardId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
