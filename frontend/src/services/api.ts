import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// API Base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle different error status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - Clear token and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;

        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;

        case 404:
          // Not found
          console.error('Resource not found');
          break;

        case 500:
          // Server error
          console.error('Server error');
          break;

        default:
          console.error('An error occurred:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred';
};

// API Service functions
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: { email: string; username: string; password: string; displayName?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

export const boardApi = {
  getAll: async () => {
    const response = await api.get('/boards');
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get(`/boards/${slug}`);
    return response.data;
  },

  create: async (data: { name: string; slug: string; description?: string; categoryId?: string }) => {
    const response = await api.post('/boards', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/boards/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/boards/${id}`);
    return response.data;
  },
};

export const postApi = {
  getAll: async (params?: { boardId?: string; page?: number; limit?: number }) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  create: async (data: { title: string; content: string; boardId: string }) => {
    const response = await api.post('/posts', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};

export const commentApi = {
  getByPostId: async (postId: string) => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },

  create: async (data: { content: string; postId: string; parentId?: string }) => {
    const response = await api.post('/comments', data);
    return response.data;
  },

  update: async (id: string, data: { content: string }) => {
    const response = await api.put(`/comments/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};

export const reactionApi = {
  add: async (data: { type: string; postId?: string; commentId?: string }) => {
    const response = await api.post('/reactions', data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/reactions/${id}`);
    return response.data;
  },
};

export const chatApi = {
  getMessages: async (userId: string) => {
    const response = await api.get(`/chat/messages/${userId}`);
    return response.data;
  },

  sendMessage: async (data: { recipientId: string; content: string }) => {
    const response = await api.post('/chat/messages', data);
    return response.data;
  },

  markAsRead: async (messageId: string) => {
    const response = await api.put(`/chat/messages/${messageId}/read`);
    return response.data;
  },
};

export const userApi = {
  getProfile: async (username: string) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
