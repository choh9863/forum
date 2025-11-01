import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services/boardService';
import type { Board, CreateBoardData, UpdateBoardData } from '../types';

// Get all boards
export const useBoards = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ['boards', params],
    queryFn: () => boardService.getBoards(params),
  });
};

// Get board by slug
export const useBoard = (slug: string) => {
  return useQuery({
    queryKey: ['board', slug],
    queryFn: () => boardService.getBoardBySlug(slug),
    enabled: !!slug,
  });
};

// Get board by ID
export const useBoardById = (id: string) => {
  return useQuery({
    queryKey: ['board', 'id', id],
    queryFn: () => boardService.getBoardById(id),
    enabled: !!id,
  });
};

// Create board
export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardData) => boardService.createBoard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

// Request board
export const useRequestBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardData) => boardService.requestBoard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

// Update board
export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBoardData }) =>
      boardService.updateBoard(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', variables.id] });
    },
  });
};

// Delete board
export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => boardService.deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

// Approve board
export const useApproveBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => boardService.approveBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

// Add manager
export const useAddManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, userId }: { boardId: string; userId: string }) =>
      boardService.addManager(boardId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
    },
  });
};

// Remove manager
export const useRemoveManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, userId }: { boardId: string; userId: string }) =>
      boardService.removeManager(boardId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
    },
  });
};

// Ban user
export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, userId, reason }: { boardId: string; userId: string; reason?: string }) =>
      boardService.banUser(boardId, userId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
    },
  });
};

// Unban user
export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, userId }: { boardId: string; userId: string }) =>
      boardService.unbanUser(boardId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
    },
  });
};

// Get board stats
export const useBoardStats = (boardId: string) => {
  return useQuery({
    queryKey: ['board', 'stats', boardId],
    queryFn: () => boardService.getBoardStats(boardId),
    enabled: !!boardId,
  });
};
