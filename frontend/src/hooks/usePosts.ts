import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '../services/postService';
import type { CreatePostData, UpdatePostData } from '../types';

// Get posts with pagination
export const usePosts = (params?: {
  boardId?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'viewCount' | 'reactions';
  sortOrder?: 'asc' | 'desc';
  isPinned?: boolean;
}) => {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => postService.getPosts(params),
  });
};

// Get posts with infinite scroll
export const useInfinitePosts = (params?: {
  boardId?: string;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'viewCount' | 'reactions';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      postService.getPosts({
        ...params,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

// Get post by ID
export const usePost = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.getPostById(id),
    enabled: !!id,
  });
};

// Get post by slug
export const usePostBySlug = (boardSlug: string, postSlug: string) => {
  return useQuery({
    queryKey: ['post', 'slug', boardSlug, postSlug],
    queryFn: () => postService.getPostBySlug(boardSlug, postSlug),
    enabled: !!boardSlug && !!postSlug,
  });
};

// Create post
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => postService.createPost(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts', { boardId: variables.boardId }] });
    },
  });
};

// Create anonymous post
export const useCreateAnonymousPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData & { password: string }) => postService.createAnonymousPost(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts', { boardId: variables.boardId }] });
    },
  });
};

// Update post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostData }) =>
      postService.updatePost(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.id] });
    },
  });
};

// Update anonymous post
export const useUpdateAnonymousPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostData & { password: string } }) =>
      postService.updateAnonymousPost(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.id] });
    },
  });
};

// Delete post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Delete anonymous post
export const useDeleteAnonymousPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      postService.deleteAnonymousPost(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Like post
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type?: string }) =>
      postService.likePost(postId, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Unlike post
export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.unlikePost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Search posts
export const useSearchPosts = (query: string, params?: {
  boardId?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['posts', 'search', query, params],
    queryFn: () => postService.searchPosts(query, params),
    enabled: query.length > 0,
  });
};

// Pin post
export const usePinPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.pinPost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Unpin post
export const useUnpinPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.unpinPost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Lock post
export const useLockPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.lockPost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Unlock post
export const useUnlockPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.unlockPost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Increment view count
export const useIncrementViewCount = () => {
  return useMutation({
    mutationFn: (id: string) => postService.incrementViewCount(id),
  });
};
