import api, { handleApiError } from './api';
import type { Board, Post, PaginatedResponse } from '../types';

interface SearchResult {
  boards: Board[];
  posts: Post[];
  total: number;
}

interface AutocompleteResult {
  suggestions: string[];
  boards: Board[];
  posts: Post[];
}

export const searchService = {
  // Search boards
  searchBoards: async (query: string, params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
  }): Promise<PaginatedResponse<Board>> => {
    try {
      const response = await api.get<PaginatedResponse<Board>>('/search/boards', {
        params: { q: query, ...params },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Search posts
  searchPosts: async (query: string, params?: {
    page?: number;
    limit?: number;
    boardId?: string;
    sortBy?: 'relevance' | 'createdAt' | 'viewCount';
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Post>> => {
    try {
      const response = await api.get<PaginatedResponse<Post>>('/search/posts', {
        params: { q: query, ...params },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Unified search (search both boards and posts)
  unifiedSearch: async (query: string, params?: {
    page?: number;
    limit?: number;
    type?: 'all' | 'boards' | 'posts';
  }): Promise<SearchResult> => {
    try {
      const response = await api.get<SearchResult>('/search', {
        params: { q: query, ...params },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Autocomplete search
  autocomplete: async (query: string, limit: number = 5): Promise<AutocompleteResult> => {
    try {
      const response = await api.get<AutocompleteResult>('/search/autocomplete', {
        params: { q: query, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Search by tags
  searchByTags: async (tags: string[], params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Post>> => {
    try {
      const response = await api.get<PaginatedResponse<Post>>('/search/tags', {
        params: { tags: tags.join(','), ...params },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get trending searches
  getTrendingSearches: async (limit: number = 10): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/search/trending', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get search history (logged in users)
  getSearchHistory: async (limit: number = 10): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/search/history', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Clear search history
  clearSearchHistory: async (): Promise<{ message: string }> => {
    try {
      const response = await api.delete('/search/history');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
