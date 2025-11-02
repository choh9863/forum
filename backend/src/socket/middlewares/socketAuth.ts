/**
 * Socket.io Authentication Middleware
 * Socket.io 연결 시 JWT 토큰 검증 (선택적)
 */

import { Socket } from 'socket.io';
import { verifyToken } from '../../utils/jwt';
import { ExtendedError } from 'socket.io/dist/namespace';
import prisma from '../../utils/prisma';

/**
 * Socket.io 인증 미들웨어
 * JWT 토큰을 검증하고 사용자 정보를 socket.data에 저장합니다.
 * 토큰이 없거나 유효하지 않은 경우 익명 사용자로 처리합니다.
 */
export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
): Promise<void> {
  try {
    // Auth 헤더 또는 handshake에서 토큰 추출
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    // 토큰이 없으면 익명 사용자로 처리
    if (!token) {
      socket.data.isAuthenticated = false;
      socket.data.user = null;
      console.log(`Anonymous user connected: ${socket.id}`);
      return next();
    }

    // 토큰 검증
    try {
      const decoded = verifyToken(token);

      // 사용자 정보 조회
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          nickname: true,
          role: true,
          isActive: true,
        },
      });

      // 사용자가 존재하지 않거나 비활성화된 경우
      if (!user || !user.isActive) {
        socket.data.isAuthenticated = false;
        socket.data.user = null;
        console.log(`Inactive or invalid user attempted to connect: ${socket.id}`);
        return next();
      }

      // 인증된 사용자 정보 저장
      socket.data.isAuthenticated = true;
      socket.data.user = {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      };

      console.log(`Authenticated user connected: ${user.nickname} (${socket.id})`);
      return next();
    } catch (tokenError) {
      // 토큰 검증 실패 시 익명 사용자로 처리
      console.warn(`Token verification failed for socket ${socket.id}:`, tokenError);
      socket.data.isAuthenticated = false;
      socket.data.user = null;
      return next();
    }
  } catch (error) {
    // 예상치 못한 에러 발생 시 익명 사용자로 처리
    console.error('Error in socket authentication middleware:', error);
    socket.data.isAuthenticated = false;
    socket.data.user = null;
    return next();
  }
}

/**
 * Socket 데이터 타입 정의
 */
export interface SocketData {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    nickname: string;
    role: string;
  } | null;
}
