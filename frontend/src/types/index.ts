// User types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const UserRole = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Board types
export interface Board {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  _count?: {
    posts: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  boards?: Board[];
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isHidden: boolean;
  authorId: string;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
  board?: Board;
  comments?: Comment[];
  files?: File[];
  reactions?: Reaction[];
  _count?: {
    comments: number;
    reactions: number;
  };
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  author?: User;
  post?: Post;
  parent?: Comment;
  replies?: Comment[];
  reactions?: Reaction[];
  _count?: {
    replies: number;
    reactions: number;
  };
}

// Reaction types
export interface Reaction {
  id: string;
  type: ReactionType;
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
  user?: User;
}

export const ReactionType = {
  LIKE: 'LIKE',
  LOVE: 'LOVE',
  HAHA: 'HAHA',
  WOW: 'WOW',
  SAD: 'SAD',
  ANGRY: 'ANGRY'
} as const;

export type ReactionType = typeof ReactionType[keyof typeof ReactionType];

// Chat types
export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: User;
  recipient?: User;
}

// File types
export interface File {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  postId?: string;
  userId: string;
  createdAt: string;
  uploader?: User;
  post?: Post;
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  content: string;
  userId: string;
  relatedUserId?: string;
  postId?: string;
  commentId?: string;
  isRead: boolean;
  createdAt: string;
  user?: User;
  relatedUser?: User;
  post?: Post;
  comment?: Comment;
}

export const NotificationType = {
  POST_REPLY: 'POST_REPLY',
  COMMENT_REPLY: 'COMMENT_REPLY',
  MENTION: 'MENTION',
  REACTION: 'REACTION',
  CHAT_MESSAGE: 'CHAT_MESSAGE'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Form types
export interface CreatePostData {
  title: string;
  content: string;
  boardId: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  isHidden?: boolean;
}

export interface CreateCommentData {
  content: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface CreateBoardData {
  name: string;
  slug: string;
  description?: string;
  categoryId?: string;
}

export interface UpdateBoardData {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// WebSocket types
export interface SocketMessage {
  type: string;
  payload: any;
}

export interface OnlineUser {
  userId: string;
  username: string;
  lastSeen: string;
}
