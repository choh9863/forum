import api, { handleApiError } from './api';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

export const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/refresh');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/change-password', { oldPassword, newPassword });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { newPassword });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
