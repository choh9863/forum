import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import type { CreateCommentData, UpdateCommentData } from '../types';

// Get comments for a post
export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentService.getComments(postId),
    enabled: !!postId,
  });
};

// Get comment by ID
export const useComment = (id: string) => {
  return useQuery({
    queryKey: ['comment', id],
    queryFn: () => commentService.getCommentById(id),
    enabled: !!id,
  });
};

// Get replies to a comment
export const useReplies = (commentId: string) => {
  return useQuery({
    queryKey: ['comments', 'replies', commentId],
    queryFn: () => commentService.getReplies(commentId),
    enabled: !!commentId,
  });
};

// Create comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentData) => commentService.createComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
      if (variables.parentId) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'replies', variables.parentId] });
      }
    },
  });
};

// Create anonymous comment
export const useCreateAnonymousComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentData & { password: string }) =>
      commentService.createAnonymousComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
      if (variables.parentId) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'replies', variables.parentId] });
      }
    },
  });
};

// Update comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentData }) =>
      commentService.updateComment(id, data),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({ queryKey: ['comments', comment.postId] });
      queryClient.invalidateQueries({ queryKey: ['comment', comment.id] });
    },
  });
};

// Update anonymous comment
export const useUpdateAnonymousComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentData & { password: string } }) =>
      commentService.updateAnonymousComment(id, data),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({ queryKey: ['comments', comment.postId] });
      queryClient.invalidateQueries({ queryKey: ['comment', comment.id] });
    },
  });
};

// Delete comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commentService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

// Delete anonymous comment
export const useDeleteAnonymousComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      commentService.deleteAnonymousComment(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

// Like comment
export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, type }: { commentId: string; type?: string }) =>
      commentService.likeComment(commentId, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comment', variables.commentId] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

// Unlike comment
export const useUnlikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.unlikeComment(commentId),
    onSuccess: (_, commentId) => {
      queryClient.invalidateQueries({ queryKey: ['comment', commentId] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

// Hide comment
export const useHideComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commentService.hideComment(id),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({ queryKey: ['comments', comment.postId] });
      queryClient.invalidateQueries({ queryKey: ['comment', comment.id] });
    },
  });
};

// Unhide comment
export const useUnhideComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commentService.unhideComment(id),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({ queryKey: ['comments', comment.postId] });
      queryClient.invalidateQueries({ queryKey: ['comment', comment.id] });
    },
  });
};
