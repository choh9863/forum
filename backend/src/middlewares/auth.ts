/**
 * Authentication Middlewares
 * JWT 토큰 검증 미들웨어
 */

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';

/**
 * 필수 인증 미들웨어
 * JWT 토큰이 없거나 유효하지 않으면 401 에러 반환
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거

    // 토큰 검증
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

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

    if (!user || !user.isActive) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid or inactive user',
      });
      return;
    }

    // Request 객체에 사용자 정보 추가
    req.user = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'error',
        message: 'Token expired',
      });
      return;
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고 사용자 정보를 추가하지만,
 * 토큰이 없어도 다음 미들웨어로 진행 (익명 사용자 허용)
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Authorization 헤더 확인
    const authHeader = req.headers.authorization;

    // 토큰이 없으면 익명 사용자로 처리
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = undefined;
      next();
      return;
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거

    // 토큰 검증
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

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

      // 사용자가 존재하고 활성화된 경우에만 정보 추가
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          role: user.role,
        };
      } else {
        req.user = undefined;
      }
    } catch (tokenError) {
      // 토큰이 유효하지 않으면 익명 사용자로 처리
      req.user = undefined;
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // 에러가 발생해도 익명 사용자로 처리하고 계속 진행
    req.user = undefined;
    next();
  }
};

/**
 * 관리자 권한 확인 미들웨어
 * requireAuth 다음에 사용해야 함
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({
      status: 'error',
      message: 'Admin privileges required',
    });
    return;
  }

  next();
};

/**
 * 최고 관리자 권한 확인 미들웨어
 * requireAuth 다음에 사용해야 함
 */
export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({
      status: 'error',
      message: 'Super admin privileges required',
    });
    return;
  }

  next();
};
