import api, { handleApiError } from './api';
import type { File } from '../types';

export const fileService = {
  // Upload single image
  uploadImage: async (file: File, postId?: string): Promise<File> => {
    try {
      const formData = new FormData();
      formData.append('file', file as any);
      if (postId) {
        formData.append('postId', postId);
      }

      const response = await api.post<File>('/files/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Upload multiple images
  uploadImages: async (files: File[], postId?: string): Promise<File[]> => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file as any);
      });
      if (postId) {
        formData.append('postId', postId);
      }

      const response = await api.post<File[]>('/files/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Upload video
  uploadVideo: async (file: File, postId?: string): Promise<File> => {
    try {
      const formData = new FormData();
      formData.append('file', file as any);
      if (postId) {
        formData.append('postId', postId);
      }

      const response = await api.post<File>('/files/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Upload any file type
  uploadFile: async (file: File, postId?: string): Promise<File> => {
    try {
      const formData = new FormData();
      formData.append('file', file as any);
      if (postId) {
        formData.append('postId', postId);
      }

      const response = await api.post<File>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get files for a post
  getFiles: async (postId: string): Promise<File[]> => {
    try {
      const response = await api.get<File[]>(`/files/post/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get file by ID
  getFileById: async (id: string): Promise<File> => {
    try {
      const response = await api.get<File>(`/files/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete file
  deleteFile: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/files/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get file URL
  getFileUrl: (path: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}${path}`;
  },

  // Check if file is image
  isImage: (mimeType: string): boolean => {
    return mimeType.startsWith('image/');
  },

  // Check if file is video
  isVideo: (mimeType: string): boolean => {
    return mimeType.startsWith('video/');
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  // Validate file type
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    const fileType = (file as any).type;
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.slice(0, -2));
      }
      return fileType === type;
    });
  },

  // Validate file size (in bytes)
  validateFileSize: (file: File, maxSize: number): boolean => {
    return (file as any).size <= maxSize;
  },
};
