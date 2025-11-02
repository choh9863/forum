/**
 * Type Definitions
 * 공통으로 사용되는 타입 정의
 */

import { Request } from 'express';
import { Role } from '@prisma/client';

/**
 * 인증된 사용자 정보를 포함한 Request 타입
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    nickname: string;
    role: Role;
  };
}

/**
 * API 응답 타입
 */
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: string;
}

/**
 * 페이지네이션 요청 파라미터
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 페이지네이션 응답 메타데이터
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * JWT 페이로드
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

/**
 * 환경 변수 타입
 */
export interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;
  PORT: number;
  NODE_ENV: string;
  FRONTEND_URL: string;
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;
}
